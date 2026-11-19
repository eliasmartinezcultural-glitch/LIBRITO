(() => {
  "use strict";
  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-copiar-url]");
    if (!button) return;
    const url = button.dataset.copiarUrl || location.href;
    const status = button.parentElement.querySelector(".estado-copiar");
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const field = document.createElement("textarea");
        field.value = url;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand("copy");
        field.remove();
        if (!copied) throw new Error("No se pudo copiar");
      }
      if (status) status.textContent = "Enlace copiado. Ya podés pegarlo donde quieras.";
      button.textContent = "¡Enlace copiado!";
      window.setTimeout(() => { button.textContent = "Copiar enlace"; }, 2200);
    } catch (_) {
      if (status) status.textContent = "No se pudo copiar automáticamente. Podés copiar el enlace desde la barra del navegador.";
    }
  });
})();