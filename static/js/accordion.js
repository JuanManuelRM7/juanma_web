const allPanels = Array.from(document.querySelectorAll(".panel"));
const allAccordion = Array.from(document.querySelectorAll(".accordion"));

// Open/close handler invoked from header <p onclick>
const expandAccordion = (elem) => {
  // Si el elemento ya está activo, lo cerramos
  if (elem.parentElement.classList.contains("active")) {
    elem.parentElement.classList.remove("active");
    let activePanel = elem.parentElement.nextElementSibling;
    activePanel.style.maxHeight = null;

    // Si estábamos apuntando a este panel en el hash, lo limpiamos
    if (activePanel.id && window.location.hash === `#${activePanel.id}`) {
      try {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      } catch {}
    }
  } else {
    // Abrimos este panel (sin cerrar los demás)
    elem.parentElement.classList.add("active");
    let activePanel = elem.parentElement.nextElementSibling;
    if (
      activePanel.id != "skill-panel" &&
      document.querySelector("#skill-panel")
    ) {
      let skillBars = Array.from(document.querySelectorAll("#skill-percent"));
      skillBars.forEach((elem) => {
        elem.style.width = "0";
      });
    }
    activePanel.style.maxHeight = activePanel.scrollHeight + "px";

    // Guardar estado y actualizar hash (sin salto brusco)
    if (activePanel.id) {
      try {
        localStorage.setItem("lastAccordionPanel", activePanel.id);
      } catch {}
      try {
        history.replaceState(null, "", `#${activePanel.id}`);
      } catch {}
    }

    // Asegurar visibilidad del encabezado
    try {
      elem.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch {}
  }
};

// Utilidad: abrir panel por id (busca su header anterior y llama a expandAccordion)
function openPanelById(panelId) {
  const panel = document.getElementById(panelId);
  if (!panel) return;
  const header = panel.previousElementSibling?.querySelector("p[onclick]");
  if (header) expandAccordion(header);
}

// En carga: abrir todos los paneles automáticamente
document.addEventListener("DOMContentLoaded", () => {
  // Abrir todos los paneles
  allAccordion.forEach((accordion) => {
    accordion.classList.add("active");
    const panel = accordion.nextElementSibling;
    if (panel) {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  });

  // Si hay hash específico, asegurar que ese panel está visible
  const hashId = (window.location.hash || "").replace(/^#/, "");
  if (hashId) {
    const targetPanel = document.getElementById(hashId);
    if (targetPanel) {
      try {
        targetPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch {}
    }
  }
});



