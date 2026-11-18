(() => {
"use strict";
const $=s=>document.querySelector(s),buscador=$("#buscador"),lista=$("#coleccion-lista"),filtros=$("#filtros"),contador=$("#contador"),total=$("#total-documentos");
let documentos=[],categoriaActiva="Todas",categorias=[];
const texto=v=>typeof v==="string"?v:"";
const permitido=r=>typeof r==="string"&&/^documentos\/[A-Za-z0-9._/-]+\.pdf$/i.test(r)&&!r.split("/").includes("..");
function crear(tag,clase,contenido){const n=document.createElement(tag);if(clase)n.className=clase;if(contenido!==undefined)n.textContent=contenido;return n}
function mostrarEstado(titulo,descripcion){lista.replaceChildren();const caja=crear("div","sin-resultados");caja.append(crear("strong","",titulo),crear("p","",descripcion));lista.append(caja)}
function publicarFiltros(){filtros.replaceChildren();for(const categoria of ["Todas",...categorias]){const b=crear("button","filtro",categoria);b.type="button";b.setAttribute("aria-pressed",String(categoriaActiva===categoria));b.addEventListener("click",()=>{categoriaActiva=categoria;publicarFiltros();dibujar()});filtros.append(b)}}
function tarjeta(item){
 const a=crear("article","documento"),cab=crear("div","documento-cabecera");
 cab.append(crear("span","documento-categoria",texto(item.categoria)||"Documento"),crear("span","documento-sello","ARCHIVO VERIFICADO"));a.append(cab,crear("h3","",texto(item.titulo)||"Documento sin título"));
 const datos=[texto(item.autoria),texto(item.institucion),texto(item.fecha)].filter(Boolean);a.append(crear("p","documento-datos",datos.join(" · ")));
 if(texto(item.descripcion))a.append(crear("p","documento-descripcion",item.descripcion));
 const meta=crear("div","documento-metadatos"),pag=Number.isInteger(item.paginas)&&item.paginas>0?item.paginas+(item.paginas===1?" página":" páginas"):"";
 for(const d of [texto(item.formato).toUpperCase()||"PDF",pag])if(d)meta.append(crear("span","",d));a.append(meta);
 const pie=crear("div","documento-pie"),acciones=crear("div","acciones-documento"),leer=crear("a","descarga","Leer / imprimir ↗"),descargar=crear("a","descarga descarga-principal","Descargar PDF ↓");
 leer.href=item.archivo;leer.target="_blank";leer.rel="noopener noreferrer";leer.setAttribute("aria-label","Abrir para leer e imprimir: "+texto(item.titulo));
 descargar.href=item.archivo;descargar.setAttribute("download","");descargar.setAttribute("aria-label","Descargar: "+texto(item.titulo));acciones.append(leer,descargar);pie.append(acciones);a.append(pie);
 const detalle=crear("details","documento-detalle");detalle.append(crear("summary","","Procedencia y créditos"));
 const base=item.autorizacion&&texto(item.autorizacion.base),lineas=[texto(item.procedencia)&&"Procedencia: "+item.procedencia,texto(item.integridad)&&"Integridad: "+item.integridad,base&&"Publicación: "+base].filter(Boolean);
 for(const l of lineas)detalle.append(crear("p","",l));if(lineas.length)a.append(detalle);return a;
}
function dibujar(){
 const termino=texto(buscador.value).trim().toLocaleLowerCase("es");
 const resultados=documentos.filter(item=>{const cat=categoriaActiva==="Todas"||item.categoria===categoriaActiva;const indice=[item.titulo,item.autoria,item.institucion,item.tematica,item.descripcion,item.categoria,...(Array.isArray(item.etiquetas)?item.etiquetas:[])].map(texto).join(" ").toLocaleLowerCase("es");return cat&&indice.includes(termino)});
 contador.textContent=resultados.length+(resultados.length===1?" documento disponible":" documentos disponibles");lista.replaceChildren();
 if(!resultados.length){mostrarEstado(documentos.length?"No encontramos coincidencias":"La colección está en preparación",documentos.length?"Probá con otras palabras o elegí otra categoría.":"Publicamos únicamente documentos completos, legibles y autorizados.");return}
 for(const item of resultados)lista.append(tarjeta(item));
}
async function iniciar(){try{
 const ruta=location.pathname.includes("/web/")?"../catalogo.json":"catalogo.json",r=await fetch(ruta,{cache:"no-store"});if(!r.ok)throw new Error("HTTP "+r.status);
 const catalogo=await r.json();if(!catalogo||!Array.isArray(catalogo.documentos))throw new Error("Catálogo inválido");
 documentos=catalogo.documentos.filter(i=>i&&i.estado==="Publicado"&&permitido(i.archivo)&&i.formato==="PDF"&&i.autorizacion&&i.autorizacion.estado==="confirmada");
 categorias=[...new Set(documentos.map(i=>texto(i.categoria)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));if(total)total.textContent=String(documentos.length).padStart(2,"0");publicarFiltros();dibujar();
 }catch(e){contador.textContent="No se pudo cargar el catálogo.";if(total)total.textContent="—";mostrarEstado("El archivo no está disponible","Volvé a intentarlo más tarde. No mostramos documentos si no podemos verificar el catálogo.");console.error("Biblioteca Digital Chañarense:",e)}}
buscador.addEventListener("input",dibujar);document.addEventListener("keydown",e=>{if(e.key==="/"&&!["INPUT","TEXTAREA"].includes(document.activeElement.tagName)){e.preventDefault();buscador.focus()}});iniciar();
})();