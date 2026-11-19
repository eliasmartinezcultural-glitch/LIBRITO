(() => {
"use strict";
const $=s=>document.querySelector(s),buscador=$("#buscador"),lista=$("#coleccion-lista"),contador=$("#contador"),total=$("#total-documentos"),filtro=$("#filtros"),zonaFiltro=$("#filtros-zona");
let documentos=[],categoriaActiva="Todas";
const texto=v=>typeof v==="string"?v:"";
const normalizar=v=>texto(v).toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const permitido=r=>typeof r==="string"&&/^documentos\/[A-Za-z0-9._/-]+\.pdf$/i.test(r)&&!r.split("/").includes("..");
const urlSegura=r=>typeof r==="string"&&/^https?:\/\/[A-Za-z0-9.-]+(?::\d+)?(?:[/?#][^\s]*)?$/i.test(r);
function disponible(i){
 if(!i||!["PDF","JPG","JPEG","PNG","WEBP","MAPA"].includes(text(i.formato).toUpperCase()))return false;
 if(i.estado==="Publicado"&&permitido(i.archivo)&&i.autorizacion&&i.autorizacion.estado==="confirmada")return true;
 return i.estado==="Disponible en origen"&&["origen","ficha"].includes(i.acceso)&&urlSegura(i.urlOriginal);
}
function nodo(tag,clase,contenido){const n=document.createElement(tag);if(clase)n.className=clase;if(contenido!==undefined)n.textContent=contenido;return n}
function estado(titulo,detalle,reintentar=false){lista.replaceChildren();const caja=nodo("div","estado");caja.append(nodo("strong","",titulo));if(detalle)caja.append(nodo("p","",detalle));if(reintentar){const b=nodo("button","reintentar","Volver a intentar");b.type="button";b.addEventListener("click",iniciar);caja.append(b)}lista.append(caja)}
function poblarFiltro(){const categorias=[...new Set(documentos.map(d=>texto(d.categoria)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));filtro.replaceChildren();const todas=nodo("option","","Todos los temas");todas.value="Todas";filtro.append(todas);for(const c of categorias){const o=nodo("option","",c);o.value=c;filtro.append(o)}zonaFiltro.hidden=categorias.length<2}
function tarjeta(item){
 const card=nodo("article","documento");card.append(nodo("h3","",texto(item.titulo)||"Documento"));
 const datos=[texto(item.autoria),texto(item.institucion),texto(item.fecha).slice(0,4)].filter(Boolean);if(datos.length)card.append(nodo("p","documento-datos",datos.join(" · ")));
 if(texto(item.descripcion))card.append(nodo("p","documento-descripcion",item.descripcion));
 const pistas=nodo("div","documento-pistas");
 const etiquetas=[texto(item.formato).toUpperCase()||"PDF",Number.isInteger(item.paginas)&&item.paginas>0?item.paginas+(item.paginas===1?" página":" páginas"):"",item.acceso==="origen"||item.acceso==="ficha"?(texto(item.formato).toUpperCase()==="PDF"?"PDF en su fuente original":(texto(item.formato).toUpperCase()==="MAPA"?"Mapa en su fuente original":"Imagen en su fuente original")):"Alojado en LIBRITO",texto(item.categoria)];
 if(item.autorizacion&&item.autorizacion.estado==="licencia_confirmada")etiquetas.push(texto(item.autorizacion.base).split(".")[0]);
 for(const dato of etiquetas.filter(Boolean))pistas.append(nodo("span","",dato));card.append(pistas);
 const acciones=nodo("div","documento-acciones");
 if(item.acceso==="origen"||item.acceso==="ficha"){
  const abrir=nodo("a","accion accion-leer",texto(item.accionExterna)||(item.acceso==="ficha"?"Ver ficha y descarga":(texto(item.formato).toUpperCase()==="PDF"?"Abrir PDF original":(texto(item.formato).toUpperCase()==="MAPA"?"Abrir mapa original":"Abrir imagen original"))));
  abrir.href=item.urlOriginal;abrir.target="_blank";abrir.rel="noopener noreferrer";abrir.setAttribute("aria-label",abrir.textContent+": "+texto(item.titulo));acciones.append(abrir);
 }else{
  const leer=nodo("a","accion accion-leer","Leer e imprimir"),bajar=nodo("a","accion accion-descargar","Descargar PDF");
  leer.href=item.archivo;leer.setAttribute("aria-label","Leer e imprimir: "+texto(item.titulo));bajar.href=item.archivo;bajar.setAttribute("download","");bajar.setAttribute("aria-label","Descargar PDF: "+texto(item.titulo));acciones.append(leer,bajar);
 }
 card.append(acciones);
 const detalle=nodo("details","documento-detalle");detalle.append(nodo("summary","","Autoría, fuente y condiciones"));
 const lineas=[texto(item.procedencia)&&"Procedencia: "+item.procedencia,texto(item.integridad)&&"Archivo: "+item.integridad,item.autorizacion&&texto(item.autorizacion.base)&&"Condiciones: "+item.autorizacion.base].filter(Boolean);
 for(const l of lineas)detalle.append(nodo("p","",l));
 if(urlSegura(item.urlFicha)){const p=nodo("p","");const a=nodo("a","","Ver ficha de la fuente");a.href=item.urlFicha;a.target="_blank";a.rel="noopener noreferrer";p.append(a);detalle.append(p)}
 if(lineas.length||urlSegura(item.urlFicha))card.append(detalle);
 if(item.acceso==="origen"||item.acceso==="ficha"){const aviso=nodo("p","documento-aviso","Este material se abre en el sitio que lo publica. LIBRITO conserva la referencia y sus créditos, no una copia del archivo.");card.append(aviso)}
 return card;
}
function dibujar(){const termino=normalizar(buscador.value.trim());const resultados=documentos.filter(item=>{const cat=categoriaActiva==="Todas"||item.categoria===categoriaActiva;const indice=normalizar([item.titulo,item.autoria,item.institucion,item.tematica,item.descripcion,item.categoria,...(Array.isArray(item.etiquetas)?item.etiquetas:[])].join(" "));return cat&&indice.includes(termino)});contador.textContent=resultados.length+(resultados.length===1?" material disponible":" materiales disponibles");lista.replaceChildren();if(!resultados.length){estado(documentos.length?"No encontramos ese material":"Todavía no hay documentos publicados","Probá con otra palabra o borrá la búsqueda.");return}for(const item of resultados)lista.append(tarjeta(item))}
async function iniciar(){try{contador.textContent="Cargando los documentos...";const ruta=location.pathname.includes("/web/")?"../catalogo.json":"catalogo.json";const respuesta=await fetch(ruta,{cache:"no-store"});if(!respuesta.ok)throw new Error("No se pudo leer el catálogo");const catalogo=await respuesta.json();if(!catalogo||!Array.isArray(catalogo.documentos))throw new Error("Catálogo inválido");documentos=catalogo.documentos.filter(disponible);total.textContent=String(documentos.length);poblarFiltro();dibujar()}catch(error){total.textContent="—";contador.textContent="No se pudo abrir la biblioteca.";estado("No pudimos cargar los documentos","Revisá tu conexión y volvé a intentarlo.",true);console.error("LIBRITO:",error)}}
buscador.addEventListener("input",dibujar);filtro.addEventListener("change",()=>{categoriaActiva=filtro.value;dibujar()});iniciar();
})();