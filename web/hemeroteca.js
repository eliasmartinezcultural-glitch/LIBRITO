(() => {
"use strict";
const input=document.querySelector("#buscador-hemeroteca");
const list=document.querySelector("#lista-hemeroteca");
const count=document.querySelector("#contador-hemeroteca");
const total=document.querySelector("#total-noticias");
const yearSelect=document.querySelector("#filtro-anio");
const mediumSelect=document.querySelector("#filtro-medio");
const topicSelect=document.querySelector("#filtro-tema");
const orderSelect=document.querySelector("#orden-noticias");
const clearButton=document.querySelector("#limpiar-filtros-hemeroteca");
if(!input||!list||!count||!yearSelect||!mediumSelect||!topicSelect||!orderSelect||!clearButton)return;
const norm=v=>String(v||"").toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const safeUrl=v=>{try{const u=new URL(v);return ["https:","http:"].includes(u.protocol)&&!!u.hostname&&!u.username&&!u.password}catch(_){return false}};
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n};
const date=v=>{const m=String(v||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+"/"+m[2]+"/"+m[1]:String(v||"Fecha no informada")};
let news=[];
function addOptions(select,values,counts){
 const fragment=document.createDocumentFragment();
 values.forEach(value=>{const amount=counts&&counts[value]?counts[value]:0;const label=amount?value+" · "+amount:""+value;const option=el("option","",label);option.value=value;fragment.append(option)});
 select.append(fragment);
}
function populateFilters(){
 const years=[...new Set(news.map(n=>String(n.fecha||"").slice(0,4)).filter(y=>/^\d{4}$/.test(y)))].sort((a,b)=>Number(b)-Number(a));
 const media=[...new Set(news.map(n=>String(n.medio||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));
 const topics=[...new Set(news.flatMap(n=>Array.isArray(n.etiquetas)?n.etiquetas:[]).map(t=>String(t).trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));
 const yearCounts={},mediumCounts={},topicCounts={};
 news.forEach(n=>{
  const y=String(n.fecha||"").slice(0,4);if(y)yearCounts[y]=(yearCounts[y]||0)+1;
  if(n.medio)mediumCounts[n.medio]=(mediumCounts[n.medio]||0)+1;
  (n.etiquetas||[]).forEach(t=>{const tag=String(t).trim();if(tag)topicCounts[tag]=(topicCounts[tag]||0)+1});
 });
 addOptions(yearSelect,years,yearCounts);
 addOptions(mediumSelect,media,mediumCounts);
 addOptions(topicSelect,topics,topicCounts);
}
function draw(){
 const q=norm(input.value.trim()),year=yearSelect.value,medium=mediumSelect.value,topic=norm(topicSelect.value);
 const found=news.filter(n=>{
  const searchable=norm([n.titulo,n.fecha,n.medio,n.autor,n.descripcion,...(n.etiquetas||[])].join(" "));
  return (!q||searchable.includes(q))&&(!year||String(n.fecha).slice(0,4)===year)&&(!medium||n.medio===medium)&&(!topic||(n.etiquetas||[]).some(t=>norm(t)===topic));
 }).sort((a,b)=>orderSelect.value==="antigua"?String(a.fecha).localeCompare(String(b.fecha)):String(b.fecha).localeCompare(String(a.fecha)));
 total.textContent=String(news.length);
 const active=Boolean(q||year||medium||topic||orderSelect.value!=="reciente");
 count.textContent=active?found.length+" de "+news.length+" noticias · "+[year,medium,topicSelect.value].filter(Boolean).join(" · "):"Colección completa · "+news.length+" noticias · "+new Set(news.map(n=>String(n.fecha).slice(0,4))).size+" años documentados";
 clearButton.disabled=!active;
 list.replaceChildren();list.setAttribute("aria-busy","false");
 if(!found.length){list.append(el("p","estado","No encontramos noticias con esa combinación. Probá cambiar el año, el tema o las palabras."));return}
 const frag=document.createDocumentFragment();let activeYear="";
 for(const n of found){
  const y=String(n.fecha||"").slice(0,4)||"Fecha no informada";
  if(y!==activeYear){activeYear=y;const heading=el("h3","hemeroteca-anio","Año "+y);heading.setAttribute("aria-label","Noticias del año "+y);frag.append(heading)}
  const card=el("article","noticia");
  card.append(el("p","noticia-meta",date(n.fecha)+" · "+n.medio+(n.autor&&n.autor!=="Redacción"?" · "+n.autor:"")));
  if(n.imagen&&safeUrl(n.imagen)){
   const figure=el("figure","noticia-imagen"),img=el("img","");
   img.src=n.imagen;img.alt=n.imagen_alt||("Imagen relacionada con: "+n.titulo);img.loading="lazy";img.decoding="async";
   img.addEventListener("error",()=>figure.remove(),{once:true});figure.append(img);
   if(n.imagen_credito)figure.append(el("figcaption","",n.imagen_credito));card.append(figure);
  }
  card.append(el("h3","",""+n.titulo));card.append(el("p","",n.descripcion));
  if(Array.isArray(n.etiquetas)&&n.etiquetas.length){const tags=el("div","noticia-etiquetas");n.etiquetas.slice(0,8).forEach(tag=>tags.append(el("span","",tag)));card.append(tags)}
  if(n.derechos||n.tipo){
   const details=el("details","noticia-detalle");details.append(el("summary","","Datos de la publicación"));
   if(n.tipo)details.append(el("p","","Tipo de registro: "+n.tipo));
   if(n.derechos)details.append(el("p","",n.derechos));
   details.append(el("p","","Referencia conservada por LIBRITO; consultá el contenido en el medio que lo publicó."));card.append(details);
  }
  if(safeUrl(n.url)){const a=el("a","accion","Leer en el diario");a.href=n.url;a.target="_blank";a.rel="noopener noreferrer";a.setAttribute("aria-label","Leer "+n.titulo+" en "+n.medio);card.append(a)}
  frag.append(card);
 }
 list.append(frag);
}
async function start(){
 try{
  const path=location.pathname.includes("/web/")?"../hemeroteca.json":"hemeroteca.json";
  const r=await fetch(path,{cache:"no-store"});if(!r.ok)throw new Error("No se pudo abrir el índice.");
  const data=await r.json();if(!data||!Array.isArray(data.noticias))throw new Error("Formato inválido.");
  news=data.noticias.filter(n=>n&&n.id&&n.titulo&&n.fecha&&n.medio&&safeUrl(n.url)).sort((a,b)=>String(b.fecha).localeCompare(String(a.fecha)));
  populateFilters();draw();
 }catch(e){if(total)total.textContent="—";count.textContent="No se pudo cargar la hemeroteca.";list.replaceChildren(el("p","estado","Revisá tu conexión e intentá nuevamente."));console.error("LIBRITO Hemeroteca:",e)}
}
input.addEventListener("input",draw);
[yearSelect,mediumSelect,topicSelect,orderSelect].forEach(control=>control.addEventListener("change",draw));
clearButton.addEventListener("click",()=>{input.value="";yearSelect.value="";mediumSelect.value="";topicSelect.value="";orderSelect.value="reciente";draw();input.focus()});
start();
})();