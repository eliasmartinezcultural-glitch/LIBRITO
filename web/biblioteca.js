(() => {
  const $ = (selector) => document.querySelector(selector);
  const buscador = $("#buscador");
  const lista = $("#coleccion-lista");
  const filtros = $("#filtros");
  const contador = $("#contador");
  let documentos = [];
  let categoriaActiva = "Todas";

  const texto = (valor) => typeof valor === "string" ? valor : "";
  const permitido = (ruta) => /^documentos\/[A-Za-z0-9._/-]+$/.test(texto(ruta)) && !ruta.split("/").includes("..");

  function crear(tag, clase, contenido) {
    const nodo = document.createElement(tag);
    if (clase) nodo.className = clase;
    if (contenido !== undefined) nodo.textContent = contenido;
    return nodo;
  }

  function mostrarVacio(titulo, descripcion) {
    lista.replaceChildren();
    const caja = crear("div", "estado-vacio");
    caja.append(crear("span", "estado-icono", "✳"), crear("h3", "", titulo), crear("p", "", descripcion));
    lista.append(caja);
  }

  function publicarFiltros(categorias) {
    filtros.replaceChildren();
    const opciones = ["Todas", ...categorias];
    for (const categoria of opciones) {
      const boton = crear("button", "filtro", categoria);
      boton.type = "button";
      boton.setAttribute("aria-pressed", String(categoriaActiva === categoria));
      boton.addEventListener("click", () => {
        categoriaActiva = categoria;
        publicarFiltros(categorias);
        dibujar();
      });
      filtros.append(boton);
    }
  }

  function tarjeta(item) {
    const articulo = crear("article", "documento");
    const categoria = texto(item.categoria) || "Documento";
    articulo.append(crear("span", "documento-categoria", categoria));
    articulo.append(crear("h3", "", texto(item.titulo) || "Título no determinado"));
    const datos = [texto(item.autoria), texto(item.institucion), texto(item.fecha)].filter(Boolean);
    articulo.append(crear("p", "documento-datos", datos.join(" · ") || "Datos bibliográficos en verificación"));
    if (texto(item.descripcion)) articulo.append(crear("p", "documento-descripcion", item.descripcion));
    const pie = crear("div", "documento-pie");
    pie.append(crear("span", "", texto(item.formato).toUpperCase() || "ARCHIVO DIGITAL"));
    const enlace = crear("a", "descarga", "Descargar ↗");
    enlace.href = item.archivo;
    enlace.setAttribute("download", "");
    enlace.setAttribute("aria-label", "Descargar " + (texto(item.titulo) || "documento"));
    pie.append(enlace);
    articulo.append(pie);
    return articulo;
  }

  function dibujar() {
    const termino = texto(buscador.value).trim().toLocaleLowerCase("es");
    const resultados = documentos.filter((item) => {
      const coincideCategoria = categoriaActiva === "Todas" || item.categoria === categoriaActiva;
      const indice = [item.titulo, item.autoria, item.institucion, item.tematica, item.descripcion, item.categoria]
        .map(texto).join(" ").toLocaleLowerCase("es");
      return coincideCategoria && indice.includes(termino);
    });
    contador.textContent = resultados.length + (resultados.length === 1 ? " documento disponible" : " documentos disponibles");
    lista.replaceChildren();
    if (!resultados.length) {
      const mensaje = documentos.length
        ? "No hay documentos que coincidan. Probá con otras palabras o elegí otra categoría."
        : "Los documentos aparecerán aquí cuando estén recuperados, verificados y autorizados para su descarga.";
      mostrarVacio(documentos.length ? "No encontramos coincidencias" : "La colección está en preparación", mensaje);
      return;
    }
    for (const item of resultados) lista.append(tarjeta(item));
  }

  async function iniciar() {
    try {
      const rutaCatalogo = location.pathname.includes("/web/") ? "../catalogo.json" : "catalogo.json";
      const respuesta = await fetch(rutaCatalogo, { cache: "no-store" });
      if (!respuesta.ok) throw new Error("HTTP " + respuesta.status);
      const catalogo = await respuesta.json();
      if (!catalogo || !Array.isArray(catalogo.documentos)) throw new Error("Formato de catálogo inválido");
      documentos = catalogo.documentos.filter((item) =>
        item && item.estado === "Publicado" && permitido(item.archivo) &&
        item.autorizacion && item.autorizacion.estado === "confirmada"
      );
      const categorias = [...new Set(documentos.map((item) => texto(item.categoria)).filter(Boolean))].sort((a,b) => a.localeCompare(b, "es"));
      publicarFiltros(categorias);
      dibujar();
    } catch (error) {
      contador.textContent = "No se pudo cargar el catálogo.";
      mostrarVacio("El archivo no está disponible", "Volvé a intentarlo más tarde. La biblioteca no muestra documentos si no puede verificar el catálogo.");
      console.error("Biblioteca Digital Chañarense:", error);
    }
  }

  buscador.addEventListener("input", dibujar);
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "/" && !["INPUT","TEXTAREA"].includes(document.activeElement.tagName)) {
      evento.preventDefault();
      buscador.focus();
    }
  });
  iniciar();
})();