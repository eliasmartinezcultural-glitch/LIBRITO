(() => {
"use strict";

const $ = (selector) => document.querySelector(selector);
const buscador = $("#buscador");
const limpiar = $("#limpiar-busqueda");
const lista = $("#coleccion-lista");
const contador = $("#contador");
const total = $("#total-documentos");
let documentos = [];

const texto = (valor) => typeof valor === "string" ? valor : "";
const normalizar = (valor) => texto(valor).toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function urlSegura(valor) {
  if (typeof valor !== "string" || !valor.trim()) return false;
  try {
    const url = new URL(valor);
    return ["https:", "http:"].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password;
  } catch (_) { return false; }
}

function archivoLocalPermitido(ruta) {
  return typeof ruta === "string" && /^documentos\/[A-Za-z0-9._/-]+\.pdf$/i.test(ruta) && !ruta.split("/").includes("..");
}

function disponible(item) {
  if (!item || !["PDF", "JPG", "JPEG", "PNG", "WEBP", "MAPA"].includes(texto(item.formato).toUpperCase())) return false;
  if (item.estado === "Publicado") return item.formato === "PDF" && archivoLocalPermitido(item.archivo) && item.autorizacion?.estado === "confirmada";
  return item.estado === "Disponible en origen" && ["origen", "ficha"].includes(item.acceso) && urlSegura(item.urlOriginal);
}

function nodo(tag, clase, contenido) {
  const el = document.createElement(tag);
  if (clase) el.className = clase;
  if (contenido !== undefined) el.textContent = contenido;
  return el;
}

function mostrarEstado(titulo, detalle, reintentar = false) {
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
  const tipo = texto(item.formato).toUpperCase();
  if (tipo === "PDF") return "PDF";
  if (tipo === "MAPA") return "Mapa";
  if (["JPG", "JPEG", "PNG", "WEBP"].includes(tipo)) return "Imagen";
  return "Material";
}

function fecha(valor) {
  const s = texto(valor);
  if (/^\d{4}$/.test(s)) return s;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return s;
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const mes = Number(m[2]), dia = Number(m[3]);
  return mes >= 1 && mes <= 12 && dia >= 1 && dia <= 31 ? dia + " de " + meses[mes - 1] + " de " + m[1] : m[1];
}

function enlace(url, etiqueta, titulo, descargar = false) {
  const a = nodo("a", "accion", etiqueta);
  a.href = url;
  a.setAttribute("aria-label", etiqueta + ": " + titulo);
  if (descargar) a.setAttribute("download", "");
  else { a.target = "_blank"; a.rel = "noopener noreferrer"; }
  return a;
}

function tarjeta(item) {
  const card = nodo("article", "documento");
  const meta = nodo("p", "documento-meta", (texto(item.categoria) || "Biblioteca") + " · " + formato(item));
  card.append(meta);
  card.append(nodo("h3", "documento-titulo", texto(item.titulo) || "Material sin título"));

  const firma = [texto(item.autoria), fecha(item.fecha)].filter(Boolean).join(" · ");
  if (firma) card.append(nodo("p", "documento-firma", firma));
  if (texto(item.descripcion)) card.append(nodo("p", "documento-descripcion", item.descripcion));

  const acciones = nodo("div", "documento-acciones");
  if (item.estado === "Publicado") {
    acciones.append(enlace(item.archivo, "Leer o descargar PDF", item.titulo));
    card.append(nodo("p", "estado-acceso local", "Archivo alojado en LIBRITO"));
  } else {
    let etiqueta = texto(item.accionExterna);
    if (!etiqueta) etiqueta = item.acceso === "ficha" ? "Ver publicación original" : "Abrir original";
    acciones.append(enlace(item.urlOriginal, etiqueta, item.titulo));
    card.append(nodo("p", "estado-acceso externo", "Se abre en la fuente original, fuera de LIBRITO"));
  }
  card.append(acciones);

  const detalles = nodo("details", "documento-detalle");
  detalles.append(nodo("summary", "", "Autoría, fuente y condiciones"));
  const datos = [
    texto(item.institucion) ? "Institución: " + item.institucion : "",
    texto(item.procedencia) ? "Procedencia: " + item.procedencia : "",
    texto(item.integridad) ? "Integridad: " + item.integridad : "",
    item.autorizacion && texto(item.autorizacion.base) ? "Condiciones de uso: " + item.autorizacion.base : ""
  ].filter(Boolean);
  for (const dato of datos) detalles.append(nodo("p", "", dato));
  if (urlSegura(item.urlFicha)) {
    const p = nodo("p", "");
    p.append(enlace(item.urlFicha, "Ver ficha de la institución", item.titulo));
    detalles.append(p);
  }
  if (datos.length || urlSegura(item.urlFicha)) card.append(detalles);
  return card;
}

function dibujar() {
  const termino = normalizar(buscador.value.trim());
  const resultados = documentos.filter((item) => {
    const campos = [item.titulo, item.autoria, item.institucion, item.tematica, item.descripcion, item.categoria, item.fecha, item.formato, ...(Array.isArray(item.etiquetas) ? item.etiquetas : [])];
    return normalizar(campos.map(texto).join(" ")).includes(termino);
  });

  limpiar.hidden = !buscador.value;
  const alojados = documentos.filter((item) => item.estado === "Publicado").length;
  const externos = documentos.length - alojados;
  contador.textContent = termino
    ? resultados.length + " resultados · " + alojados + " archivos alojados y " + externos + " accesos a originales"
    : alojados + " archivos alojados en LIBRITO · " + externos + " accesos a fuentes originales";

  lista.replaceChildren();
  lista.setAttribute("aria-busy", "false");
  if (!resultados.length) {
    mostrarEstado(documentos.length ? "No encontramos ese material." : "Todavía no hay materiales disponibles.", "Probá con otra palabra o borrá la búsqueda.");
    return;
  }
  const fragmento = document.createDocumentFragment();
  for (const item of resultados) fragmento.append(tarjeta(item));
  lista.append(fragmento);
}

async function iniciar() {
  lista.setAttribute("aria-busy", "true");
  contador.textContent = "Abriendo la biblioteca...";
  try {
    const ruta = location.pathname.includes("/web/") ? "../catalogo.json" : "catalogo.json";
    const respuesta = await fetch(ruta, { cache: "no-store" });
    if (!respuesta.ok) throw new Error("No se pudo leer el catálogo.");
    const catalogo = await respuesta.json();
    if (!catalogo || !Array.isArray(catalogo.documentos)) throw new Error("El catálogo no tiene el formato esperado.");
    documentos = catalogo.documentos.filter(disponible);
    total.textContent = String(documentos.length);
    dibujar();
  } catch (error) {
    total.textContent = "—";
    mostrarEstado("La biblioteca no pudo cargarse.", "Revisá tu conexión y volvé a intentarlo.", true);
    console.error("LIBRITO:", error);
  }
}

buscador.addEventListener("input", dibujar);
limpiar.addEventListener("click", () => { buscador.value = ""; dibujar(); buscador.focus(); });
iniciar();
})();