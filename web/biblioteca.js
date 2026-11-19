(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const buscador = $("#buscador");
  const limpiar = $("#limpiar-busqueda");
  const lista = $("#coleccion-lista");
  const contador = $("#contador");
  const total = $("#total-documentos");

  if (!buscador || !lista || !contador || !total) {
    console.error("LIBRITO Obras: faltan elementos requeridos en obras.html.");
    return;
  }

  let documentos = [];
  const texto = (valor) => typeof valor === "string" ? valor : "";
  const normalizar = (valor) => texto(valor).toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  function urlSegura(valor) {
    if (typeof valor !== "string" || !valor.trim()) return false;
    try {
      const url = new URL(valor, location.href);
      return ["https:", "http:"].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password;
    } catch (_) {
      return false;
    }
  }

  function archivoLocalPermitido(ruta) {
    return typeof ruta === "string" &&
      /^documentos\/[A-Za-z0-9._/-]+\.pdf$/i.test(ruta) &&
      !ruta.split("/").includes("..");
  }

  function disponible(item) {
    if (!item || typeof item !== "object") return false;
    const tipo = texto(item.formato).trim().toUpperCase();
    const formatosAdmitidos = ["PDF", "JPG", "JPEG", "PNG", "WEBP", "MAPA", "PÁGINA WEB", "PAGINA WEB"];
    if (!formatosAdmitidos.includes(tipo)) return false;

    if (item.estado === "Publicado") {
      return tipo === "PDF" &&
        archivoLocalPermitido(item.archivo) &&
        item.autorizacion &&
        item.autorizacion.estado === "confirmada";
    }

    return item.estado === "Disponible en origen" &&
      ["origen", "ficha"].includes(item.acceso) &&
      urlSegura(item.urlOriginal);
  }

  function nodo(tag, clase, contenido) {
    const elemento = document.createElement(tag);
    if (clase) elemento.className = clase;
    if (contenido !== undefined) elemento.textContent = contenido;
    return elemento;
  }

  function mostrarEstado(titulo, detalle, reintentar) {
    lista.replaceChildren();
    const caja = nodo("div", "estado");
    caja.append(nodo("strong", "", titulo));
    if (detalle) caja.append(nodo("p", "", detalle));
    if (reintentar) {
      const boton = nodo("button", "reintentar", "Volver a intentar");
      boton.type = "button";
      boton.addEventListener("click", iniciar);
      caja.append(boton);
    }
    lista.append(caja);
    lista.setAttribute("aria-busy", "false");
  }

  function formato(item) {
    const tipo = texto(item.formato).trim().toUpperCase();
    if (tipo === "PDF") return "PDF";
    if (tipo === "MAPA") return "Mapa";
    if (["JPG", "JPEG", "PNG", "WEBP"].includes(tipo)) return "Imagen";
    if (tipo === "PÁGINA WEB" || tipo === "PAGINA WEB") return "Página web";
    return "Material";
  }

  function fecha(valor) {
    const s = texto(valor);
    if (/^\d{4}$/.test(s)) return s;
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return s;
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const mes = Number(m[2]);
    const dia = Number(m[3]);
    return mes >= 1 && mes <= 12 && dia >= 1 && dia <= 31 ? dia + " de " + meses[mes - 1] + " de " + m[1] : m[1];
  }

  function enlace(url, etiqueta, titulo, descargar) {
    const a = nodo("a", "accion", etiqueta);
    a.href = url;
    a.setAttribute("aria-label", etiqueta + ": " + titulo);
    if (descargar) {
      a.setAttribute("download", "");
    } else {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    return a;
  }

  function tarjeta(item) {
    const card = nodo("article", "documento");
    card.append(nodo("p", "documento-meta", (texto(item.categoria) || "Biblioteca") + " · " + formato(item)));
    if (urlSegura(item.imagen)) {
      const figura = nodo("figure", "documento-imagen");
      const img = nodo("img", "");
      img.src = item.imagen;
      img.alt = texto(item.imagen_alt) || ("Imagen de presentación de " + (texto(item.titulo) || "la obra"));
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", () => figura.remove(), { once: true });
      figura.append(img);
      if (texto(item.imagen_credito)) figura.append(nodo("figcaption", "", item.imagen_credito));
      card.append(figura);
    }
    if (texto(item.tematica)) card.append(nodo("p", "documento-tematica", item.tematica));
    card.append(nodo("h3", "documento-titulo", texto(item.titulo) || "Material sin título"));

    const firma = [texto(item.autoria), fecha(item.fecha)].filter(Boolean).join(" · ");
    if (firma) card.append(nodo("p", "documento-firma", firma));
    if (texto(item.descripcion)) card.append(nodo("p", "documento-descripcion", item.descripcion));

    const acciones = nodo("div", "documento-acciones");
    if (item.estado === "Publicado") {
      acciones.append(enlace(item.archivo, "Descargar PDF", item.titulo, true));
      card.append(nodo("p", "estado-acceso local", "Archivo completo alojado en LIBRITO"));
    } else {
      const etiqueta = texto(item.accionExterna) ||
        (item.acceso === "ficha" ? "Ver publicación original" : "Abrir original");
      acciones.append(enlace(item.urlOriginal, etiqueta, item.titulo, false));
      card.append(nodo("p", "estado-acceso externo", "Este material permanece en su fuente original"));
    }
    card.append(acciones);

    const detalles = nodo("details", "documento-detalle");
    detalles.append(nodo("summary", "", "Autoría, fuente y condiciones"));
    const datos = [
      texto(item.autoria) ? "Autoría: " + item.autoria : "",
      texto(item.institucion) ? "Institución: " + item.institucion : "",
      texto(item.tematica) ? "Temática: " + item.tematica : "",
      texto(item.fecha) ? "Fecha o período: " + item.fecha : "",
      texto(item.procedencia) ? "Procedencia: " + item.procedencia : "",
      texto(item.integridad) ? "Integridad: " + item.integridad : "",
      item.autorizacion && texto(item.autorizacion.base) ? "Condiciones de uso: " + item.autorizacion.base : ""
    ].filter(Boolean);

    for (const dato of datos) detalles.append(nodo("p", "", dato));
    if (urlSegura(item.urlFicha)) {
      const p = nodo("p", "");
      p.append(enlace(item.urlFicha, "Ver ficha de la institución", item.titulo, false));
      detalles.append(p);
    }
    if (datos.length || urlSegura(item.urlFicha)) card.append(detalles);
    return card;
  }

  function coincide(item, termino) {
    const campos = [
      item.titulo, item.autoria, item.institucion, item.tematica,
      item.descripcion, item.categoria, item.fecha, item.formato,
      ...(Array.isArray(item.etiquetas) ? item.etiquetas : [])
    ];
    return normalizar(campos.map(texto).join(" ")).includes(termino);
  }

  function dibujar() {
    const termino = normalizar(buscador.value.trim());
    const filtrados = documentos.filter((item) => coincide(item, termino));
    const alojados = filtrados.filter((item) => item.estado === "Publicado");
    const externos = filtrados.filter((item) => item.estado !== "Publicado");
    const totalLocales = documentos.filter((item) => item.estado === "Publicado").length;
    const totalExternos = documentos.length - totalLocales;

    if (limpiar) limpiar.hidden = !buscador.value;
    contador.textContent = termino
      ? filtrados.length + " resultados · " + alojados.length + " descargas directas · " + externos.length + " fuentes originales"
      : totalLocales + " archivos descargables desde LIBRITO · " + totalExternos + " fuentes originales para consultar";

    lista.replaceChildren();
    lista.setAttribute("aria-busy", "false");

    if (!filtrados.length) {
      mostrarEstado(documentos.length ? "No encontramos ese material." : "Todavía no hay materiales disponibles.",
        "Probá con otra palabra o borrá la búsqueda.", false);
      return;
    }

    const fragmento = document.createDocumentFragment();
    if (alojados.length) {
      const tituloDescargas = nodo("h3", "grupo-titulo", "Listos para descargar");
      tituloDescargas.id = "descargas";
      fragmento.append(tituloDescargas);
      fragmento.append(nodo("p", "grupo-ayuda", "Archivos completos alojados en LIBRITO, listos para descargar."));
      for (const item of alojados) fragmento.append(tarjeta(item));
    }

    if (externos.length) {
      const tituloLecturas = nodo("h3", "grupo-titulo grupo-externo", "Listos para leer");
      tituloLecturas.id = "lecturas";
      fragmento.append(tituloLecturas);
      fragmento.append(nodo("p", "grupo-ayuda", "Obras y documentos disponibles en sus sitios originales. No son copias alojadas aquí."));
      for (const item of externos) fragmento.append(tarjeta(item));
    }

    lista.append(fragmento);
  }

  async function iniciar() {
    lista.setAttribute("aria-busy", "true");
    contador.textContent = "Abriendo la biblioteca...";
    try {
      const ruta = location.pathname.includes("/web/") ? "../catalogo.json" : "catalogo.json";
      const respuesta = await fetch(ruta, { cache: "no-store", headers: { "Accept": "application/json" } });
      if (!respuesta.ok) throw new Error("Respuesta HTTP " + respuesta.status);
      const catalogo = await respuesta.json();
      if (!catalogo || !Array.isArray(catalogo.documentos)) {
        throw new Error("El catálogo no contiene una lista válida de obras.");
      }

      const validos = catalogo.documentos.filter(disponible);
      documentos = validos;
      total.textContent = String(documentos.length);
      dibujar();

      if (documentos.length !== catalogo.documentos.length) {
        console.warn("LIBRITO Obras: registros omitidos por datos incompletos o enlaces inválidos:",
          catalogo.documentos.length - documentos.length);
      }
    } catch (error) {
      total.textContent = "—";
      mostrarEstado("La biblioteca no pudo cargarse.",
        "No se pudo leer el catálogo. Revisá la conexión y volvé a intentarlo.", true);
      console.error("LIBRITO Obras:", error);
    }
  }

  buscador.addEventListener("input", dibujar);
  if (limpiar) {
    limpiar.addEventListener("click", () => {
      buscador.value = "";
      dibujar();
      buscador.focus();
    });
  }
  iniciar();
})();