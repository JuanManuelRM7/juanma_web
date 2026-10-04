// Convierte GIF animados en vídeo H.264 (.mp4) más un póster (.png, primer fotograma), usando
// AVFoundation: solo macOS, sin ffmpeg. Los ficheros se escriben junto al GIF, con el mismo nombre.
//
//   swiftc -O scripts/gif2mp4.swift -o /tmp/gif2mp4 && /tmp/gif2mp4 static/images/figura.gif [más.gif ...]
//   /tmp/gif2mp4 --quality 0.7 static/images/figura.gif     # 0..1, por defecto 0.65
//
// En el post se enlaza como una imagen: ![texto alternativo](/images/figura.mp4)
// (el render hook layouts/_default/_markup/render-image.html lo convierte en <video>).
// 0.65 mantiene nítidos los ejes, las líneas finas y el texto de las figuras de matplotlib; por
// debajo de 0.6 se emborronan. Equivalente con ffmpeg:
//   ffmpeg -i figura.gif -movflags +faststart -pix_fmt yuv420p -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" -crf 20 figura.mp4
import AVFoundation
import AppKit

func fail(_ m: String) -> Never { fputs("gif2mp4: " + m + "\n", stderr); exit(1) }

var quality = 0.65
var inputs: [String] = []
var args = Array(CommandLine.arguments.dropFirst())
while !args.isEmpty {
    let a = args.removeFirst()
    if a == "--quality" { guard !args.isEmpty, let q = Double(args.removeFirst()) else { fail("--quality necesita un número") }; quality = q }
    else { inputs.append(a) }
}
guard !inputs.isEmpty else { fail("uso: gif2mp4 [--quality 0.65] fichero.gif [...]") }

let srgb = CGColorSpace(name: CGColorSpace.sRGB)!
let timescale: Int32 = 600

for path in inputs {
    let url = URL(fileURLWithPath: path)
    guard let src = CGImageSourceCreateWithURL(url as CFURL, nil) else { fail("no se puede leer \(path)") }
    let count = CGImageSourceGetCount(src)
    guard count > 1, let first = CGImageSourceCreateImageAtIndex(src, 0, nil) else { fail("\(path) no es un GIF animado") }

    // H.264 necesita dimensiones pares: se añade una columna/fila repitiendo el borde
    let w = first.width, h = first.height
    let W = w + w % 2, H = h + h % 2

    // Duración de cada fotograma
    var delays: [Double] = []
    for i in 0..<count {
        let props = CGImageSourceCopyPropertiesAtIndex(src, i, nil) as? [CFString: Any]
        let gif = props?[kCGImagePropertyGIFDictionary] as? [CFString: Any]
        let d = (gif?[kCGImagePropertyGIFUnclampedDelayTime] as? Double) ?? (gif?[kCGImagePropertyGIFDelayTime] as? Double) ?? 0.1
        delays.append(d > 0.011 ? d : 0.1)
    }

    func draw(_ img: CGImage, into ctx: CGContext) {
        ctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
        ctx.fill(CGRect(x: 0, y: 0, width: W, height: H))
        ctx.interpolationQuality = .none
        if W != w || H != h { ctx.draw(img, in: CGRect(x: 0, y: 0, width: W, height: H)) }  // relleno del borde
        ctx.draw(img, in: CGRect(x: 0, y: H - h, width: w, height: h))
    }

    let base = url.deletingPathExtension()
    let mp4 = base.appendingPathExtension("mp4"), poster = base.appendingPathExtension("png")

    // Póster: primer fotograma
    let pctx = CGContext(data: nil, width: W, height: H, bitsPerComponent: 8, bytesPerRow: 0, space: srgb,
                         bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
    draw(first, into: pctx)
    guard let png = NSBitmapImageRep(cgImage: pctx.makeImage()!).representation(using: .png, properties: [:]) else { fail("no se puede crear el póster") }
    try! png.write(to: poster)

    try? FileManager.default.removeItem(at: mp4)
    let writer = try! AVAssetWriter(outputURL: mp4, fileType: .mp4)
    writer.shouldOptimizeForNetworkUse = true   // índice al principio: se puede reproducir mientras descarga
    let fps = max(1, Int((1.0 / (delays.reduce(0, +) / Double(count))).rounded()))
    let settings: [String: Any] = [
        AVVideoCodecKey: AVVideoCodecType.h264,
        AVVideoWidthKey: W, AVVideoHeightKey: H,
        AVVideoColorPropertiesKey: [
            AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2,
            AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2,
            AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2,
        ],
        AVVideoCompressionPropertiesKey: [
            AVVideoQualityKey: quality,
            AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
            AVVideoMaxKeyFrameIntervalKey: 240,
            AVVideoAllowFrameReorderingKey: false,
            AVVideoExpectedSourceFrameRateKey: fps,
        ] as [String: Any],
    ]
    guard writer.canApply(outputSettings: settings, forMediaType: .video) else { fail("este Mac no admite la configuración H.264 pedida") }
    let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
    input.expectsMediaDataInRealTime = false
    let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
        kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
        kCVPixelBufferWidthKey as String: W, kCVPixelBufferHeightKey as String: H,
    ])
    writer.add(input)
    guard writer.startWriting() else { fail("no se puede escribir \(mp4.path): \(String(describing: writer.error))") }
    writer.startSession(atSourceTime: .zero)

    var t = 0.0
    for i in 0..<count {
        guard let img = i == 0 ? first : CGImageSourceCreateImageAtIndex(src, i, nil) else { fail("fotograma \(i) ilegible en \(path)") }
        var pb: CVPixelBuffer?
        CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &pb)
        guard let buf = pb else { fail("sin memoria para el fotograma \(i)") }
        CVPixelBufferLockBaseAddress(buf, [])
        let ctx = CGContext(data: CVPixelBufferGetBaseAddress(buf), width: W, height: H, bitsPerComponent: 8,
                            bytesPerRow: CVPixelBufferGetBytesPerRow(buf), space: srgb,
                            bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)!
        draw(img, into: ctx)
        CVPixelBufferUnlockBaseAddress(buf, [])
        while !input.isReadyForMoreMediaData { usleep(2000) }
        let pts = CMTime(value: CMTimeValue((t * Double(timescale)).rounded()), timescale: timescale)
        if !adaptor.append(buf, withPresentationTime: pts) { fail("error al codificar \(path): \(String(describing: writer.error))") }
        t += delays[i]
    }
    input.markAsFinished()
    writer.endSession(atSourceTime: CMTime(value: CMTimeValue((t * Double(timescale)).rounded()), timescale: timescale))
    let done = DispatchSemaphore(value: 0)
    writer.finishWriting { done.signal() }
    done.wait()
    guard writer.status == .completed else { fail("error al cerrar \(mp4.path): \(String(describing: writer.error))") }
    // AVAssetWriter deja al lado su fichero intermedio (<nombre>.mp4.sb-xxxx): se borra
    let folder = mp4.deletingLastPathComponent()
    for f in (try? FileManager.default.contentsOfDirectory(atPath: folder.path)) ?? [] where f.hasPrefix(mp4.lastPathComponent + ".sb-") {
        try? FileManager.default.removeItem(at: folder.appendingPathComponent(f))
    }

    func size(_ u: URL) -> Int { ((try? FileManager.default.attributesOfItem(atPath: u.path)[.size]) as? NSNumber)?.intValue ?? 0 }
    let g = size(url), m = size(mp4)
    print(String(format: "%@: %d fotogramas %dx%d, %.1f s · GIF %.2f MB → MP4 %.2f MB (%.1fx) + póster %d KB",
                 url.lastPathComponent, count, W, H, t, Double(g) / 1048576, Double(m) / 1048576, Double(g) / Double(max(m, 1)), size(poster) / 1024))
}
