const buscador = document.querySelector("#buscador");
const coleccion = document.querySelector("#coleccion");
const contador = document.querySelector("#contador");

async function iniciarBiblioteca() {
  try {
    const respuesta = await fetch("../catalogo.json", { cache: "no-store" });
    if (!respuesta.ok) throw new Error("No se pudo leer el catálogo");
    const catalogo = await respuesta.json();
    const documentos = Array.isArray(catalogo.documentos) ? catalogo.documentos : [];
    const publicados = documentos.filter(item => item.estado === "Publicado" && item.archivo);
    contador.textContent = publicados.length === 0
      ? "Todavía no hay documentos publicados para descarga."
      : publicados.length + " documentos disponibles";

    function dibujar(filtro = "") {
      const termino = filtro.trim().toLocaleLowerCase("es");
      const resultados = publicados.filter(item =>
        [item.titulo, item.autoria, item.tematica, item.institucion]
          .filter(Boolean).join(" ").toLocaleLowerCase("es").includes(termino)
      );
      coleccion.replaceChildren();
      if (!resultados.length) {
        const mensaje = document.createElement("div");
        mensaje.className = "vacio";
        const titulo = document.createElement("h2");
        titulo.textContent = publicados.length ? "No encontramos coincidencias" : "La colección está en preparación";
        const texto = document.createElement("p");
        texto.textContent = publicados.length
          ? "Probá con otro título, autor o tema."
          : "Los documentos aparecerán aquí cuando estén recuperados, verificados y autorizados para su descarga.";
        mensaje.append(titulo, texto);
        coleccion.append(mensaje);
        return;
      }
      for (const item of resultados) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "regla";
        const titulo = document.createElement("h2");
        titulo.textContent = item.titulo || "Título no determinado";
        const datos = document.createElement("p");
        datos.textContent = [item.autoria, item.fecha, item.tematica].filter(Boolean).join(" · ");
        const enlace = document.createElement("a");
        enlace.href = item.archivo;
        enlace.textContent = "Descargar documento";
        enlace.setAttribute("download", "");
        tarjeta.append(titulo, datos, enlace);
        coleccion.append(tarjeta);
      }
    }
    buscador.addEventListener("input", () => dibujar(buscador.value));
    dibujar();
  } catch (error) {
    contador.textContent = "El catálogo no está disponible en este momento.";
    console.error(error);
  }
}
iniciarBiblioteca();
