(() => {
"use strict";

const buscar = (selector) => document.querySelector(selector);
const buscador = buscar("#buscador");
const botonLimpiar = buscar("#limpiar-busqueda");
const lista = buscar("#coleccion-lista");
const contador = buscar("#contador");
const total = buscar("#total-documentos");
const filtro = buscar("#filtros");
const zonaFiltro = buscar("#filtros-zona");

let documentos = [];
let categoriaActiva = "Todas";

const texto = (valor) => typeof valor === "string" ? valor : "";
const normalizar = (valor) => texto(valor)
  .toLocaleLowerCase("es")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");

function urlSegura(valor) {
  if (typeof valor !== "string" || !valor.trim()) return false;
  try {
    const url = new URL(valor);
    return (url.protocol === "https:" || url.protocol === "http:") &&
      Boolean(url.hostname) && !url.username && !url.password;
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
  if (!item || !["PDF", "JPG", "JPEG", "PNG", "WEBP", "MAPA"].includes(texto(item.formato).toUpperCase())) return false;

  if (item.estado === "Publicado") {
    return item.formato === "PDF" &&
      archivoLocalPermitido(item.archivo) &&
      item.autorizacion &&
      item.autorizacion.estado === "confirmada";
  }

  return item.estado === "Disponible en origen" &&
    ["origen", "ficha"].includes(item.acceso) &&
    urlSegura(item.urlOriginal);
}

function crearNodo(etiqueta, clase, contenido) {
  const nodo = document.createElement(etiqueta);
  if (clase) nodo.className = clase;
  if (contenido !== undefined) nodo.textContent = contenido;
  return nodo;
}

function mostrarEstado(titulo, detalle, permitirReintento) {
  lista.replaceChildren();
  const caja = crearNodo("div", "estado");
  caja.append(crearNodo("strong", "", titulo));
  if (detalle) caja.append(crearNodo("p", "", detalle));

  if (permitirReintento) {
    const boton = crearNodo("button", "reintentar", "Volver a intentar");
    boton.type = "button";
    boton.addEventListener("click", iniciar);
    caja.append(boton);
  }

  lista.append(caja);
  lista.setAttribute("aria-busy", "false");
}

function nombreFormato(item) {
  const formato = texto(item.formato).toUpperCase();
  if (formato === "PDF") return "Documento PDF";
  if (formato === "MAPA") return "Mapa";
  if (["JPG", "JPEG", "PNG", "WEBP"].includes(formato)) return "Imagen";
  return "Material";
}

function nombreAcceso(item) {
  if (item.estado === "Publicado") return "Descarga directa desde LIBRITO";
  if (item.acceso === "ficha") return "Consulta en la página de la publicación";
  if (item.formato === "PDF") return "PDF en su fuente original";
  if (item.formato === "MAPA") return "Mapa en su fuente original";
  return "Imagen en su fuente original";
}

function fechaVisible(valor) {
  const fecha = texto(valor);
  if (/^\d{4}$/.test(fecha)) return fecha;
  const coincidencia = fecha.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!coincidencia) return fecha;
  const anio = coincidencia[1];
  const mes = Number(coincidencia[2]);
  const dia = Number(coincidencia[3]);
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return anio;
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return dia + " de " + meses[mes - 1] + " de " + anio;
}

function agregarEnlace(contenedor, url, etiqueta) {
  if (!urlSegura(url)) return;
  const parrafo = crearNodo("p", "");
  const enlace = crearNodo("a", "", etiqueta);
  enlace.href = url;
  enlace.target = "_blank";
  enlace.rel = "noopener noreferrer";
  parrafo.append(enlace);
  contenedor.append(parrafo);
}

function tarjeta(item) {
  const tarjeta = crearNodo("article", "documento");
  const encabezado = crearNodo("div", "documento-encabezado");
  encabezado.append(crearNodo("span", "documento-categoria", texto(item.categoria) || "Biblioteca"));
  encabezado.append(crearNodo("span", "documento-formato", nombreFormato(item)));
  tarjeta.append(encabezado);

  tarjeta.append(crearNodo("h3", "documento-titulo", texto(item.titulo) || "Material sin título"));

  const datos = [
    texto(item.autoria),
    texto(item.institucion),
    fechaVisible(item.fecha)
  ].filter(Boolean);

  if (datos.length) tarjeta.append(crearNodo("p", "documento-datos", datos.join(" · ")));
  if (texto(item.descripcion)) tarjeta.append(crearNodo("p", "documento-descripcion", item.descripcion));

  const acceso = crearNodo("p", "documento-acceso");
  acceso.append(crearNodo("span", "punto-acceso", ""));
  acceso.append(document.createTextNode(nombreAcceso(item)));
  tarjeta.append(acceso);

  const acciones = crearNodo("div", "documento-acciones");

  if (item.estado === "Publicado") {
    const abrir = crearNodo("a", "accion accion-leer", "Abrir PDF para leer");
    abrir.href = item.archivo;
    abrir.target = "_blank";
    abrir.rel = "noopener";
    abrir.setAttribute("aria-label", "Abrir PDF para leer: " + texto(item.titulo));

    const descargar = crearNodo("a", "accion accion-descargar", "Descargar PDF");
    descargar.href = item.archivo;
    descargar.setAttribute("download", "");
    descargar.setAttribute("aria-label", "Descargar PDF: " + texto(item.titulo));
    acciones.append(abrir, descargar);
  } else {
    let etiqueta = texto(item.accionExterna);
    if (!etiqueta) {
      if (item.acceso === "ficha") etiqueta = "Ver publicación y acceso";
      else if (item.formato === "PDF") etiqueta = "Abrir PDF original";
      else if (item.formato === "MAPA") etiqueta = "Abrir mapa original";
      else etiqueta = "Abrir imagen original";
    }

    const abrir = crearNodo("a", "accion accion-leer", etiqueta);
    abrir.href = item.urlOriginal;
    abrir.target = "_blank";
    abrir.rel = "noopener noreferrer";
    abrir.setAttribute("aria-label", etiqueta + ": " + texto(item.titulo));
    acciones.append(abrir);
  }

  tarjeta.append(acciones);

  const detalles = crearNodo("details", "documento-detalle");
  detalles.append(crearNodo("summary", "", "Más información sobre este material"));

  const lineas = [
    texto(item.procedencia) ? "Fuente: " + item.procedencia : "",
    texto(item.integridad) ? "Sobre el archivo: " + item.integridad : "",
    item.autorizacion && texto(item.autorizacion.base) ? "Condiciones de uso: " + item.autorizacion.base : ""
  ].filter(Boolean);

  for (const linea of lineas) detalles.append(crearNodo("p", "", linea));
  agregarEnlace(detalles, item.urlFicha, "Ver ficha de la institución o publicación");

  if (lineas.length || urlSegura(item.urlFicha)) tarjeta.append(detalles);

  if (item.estado !== "Publicado") {
    tarjeta.append(crearNodo("p", "documento-aviso", "Este material se abre fuera de LIBRITO, en la página que lo publica. La descarga, si está disponible, depende de esa fuente."));
  }

  return tarjeta;
}

function poblarFiltro() {
  const categorias = [...new Set(documentos.map((documento) => texto(documento.categoria)).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "es"));

  filtro.replaceChildren();
  const todas = crearNodo("option", "", "Todos los temas");
  todas.value = "Todas";
  filtro.append(todas);

  for (const categoria of categorias) {
    const opcion = crearNodo("option", "", categoria);
    opcion.value = categoria;
    filtro.append(opcion);
  }

  zonaFiltro.hidden = categorias.length < 2;
}

function dibujar() {
  const termino = normalizar(buscador.value.trim());
  const resultados = documentos.filter((item) => {
    const categoriaCoincide = categoriaActiva === "Todas" || item.categoria === categoriaActiva;
    const campos = [
      item.titulo, item.autoria, item.institucion, item.tematica,
      item.descripcion, item.categoria, item.fecha, item.formato,
      ...(Array.isArray(item.etiquetas) ? item.etiquetas : [])
    ];
    return categoriaCoincide && normalizar(campos.map(texto).join(" ")).includes(termino);
  });

  botonLimpiar.hidden = !buscador.value;
  contador.textContent = "Mostrando " + resultados.length + " de " + documentos.length +
    (documentos.length === 1 ? " material." : " materiales.");

  lista.replaceChildren();
  lista.setAttribute("aria-busy", "false");

  if (!resultados.length) {
    mostrarEstado(
      documentos.length ? "No encontramos ese material." : "Todavía no hay materiales disponibles.",
      documentos.length ? "Probá con otra palabra o elegí todos los temas." : "Estamos preparando la colección.",
      false
    );
    return;
  }

  const fragmento = document.createDocumentFragment();
  for (const item of resultados) fragmento.append(tarjeta(item));
  lista.append(fragmento);
}

async function iniciar() {
  lista.setAttribute("aria-busy", "true");
  contador.textContent = "Estamos preparando la biblioteca...";

  try {
    const rutaCatalogo = location.pathname.includes("/web/") ? "../catalogo.json" : "catalogo.json";
    const respuesta = await fetch(rutaCatalogo, { cache: "no-store" });
    if (!respuesta.ok) throw new Error("No se pudo leer el catálogo.");

    const catalogo = await respuesta.json();
    if (!catalogo || !Array.isArray(catalogo.documentos)) throw new Error("El catálogo no tiene el formato esperado.");

    documentos = catalogo.documentos.filter(disponible);
    total.textContent = String(documentos.length);
    poblarFiltro();
    dibujar();
  } catch (error) {
    total.textContent = "—";
    contador.textContent = "No pudimos abrir la biblioteca.";
    mostrarEstado("La biblioteca no pudo cargarse.", "Revisá tu conexión a internet y volvé a intentarlo.", true);
    console.error("LIBRITO:", error);
  }
}

buscador.addEventListener("input", dibujar);
botonLimpiar.addEventListener("click", () => {
  buscador.value = "";
  categoriaActiva = "Todas";
  filtro.value = "Todas";
  dibujar();
  buscador.focus();
});
filtro.addEventListener("change", () => {
  categoriaActiva = filtro.value;
  dibujar();
});

iniciar();
})();