const allPanels = Array.from(document.querySelectorAll(".panel"));
const allAccordion = Array.from(document.querySelectorAll(".accordion"));
const expandAccordion = (elem) => {
  // Si el elemento ya está activo, lo cerramos
  if (elem.parentElement.classList.contains("active")) {
    elem.parentElement.classList.remove("active");
    let activePanel = elem.parentElement.nextElementSibling;
    activePanel.style.maxHeight = null;
  } else {
    // Si no está activo, cerramos todos y abrimos este
    allAccordion.forEach((acc) => {
      acc.classList.remove("active");
    });
    elem.parentElement.classList.add("active");
    allPanels.forEach(function (elem) {
      elem.style.maxHeight = null;
    });
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
  }
};



