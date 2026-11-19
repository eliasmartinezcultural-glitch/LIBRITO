(() => {
"use strict";
const input=document.querySelector("#buscador-recursos"),list=document.querySelector("#lista-recursos"),count=document.querySelector("#contador-recursos"),total=document.querySelector("#total-recursos"),category=document.querySelector("#filtro-categoria-recursos"),order=document.querySelector("#orden-recursos"),clear=document.querySelector("#limpiar-recursos");
if(!input||!list||!count||!total||!category||!order||!clear)return;
const norm=v=>String(v||"").toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const safeUrl=v=>{try{const u=new URL(v);return ["https:","http:"].includes(u.protocol)&&!!u.hostname&&!u.username&&!u.password}catch(_){return false}};
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n};
let resources=[];
function addDetail(dl,label,value){
 if(!value)return;
 const wrap=el("div","recurso-dato");
 wrap.append(el("dt","",label),el("dd","",value));
 dl.append(wrap);
}
function draw(){
 const q=norm(input.value.trim()),cat=category.value;
 const found=resources.filter(r=>{
  const hay=norm([r.titulo,r.categoria,r.tipo,r.fecha,r.autor,r.descripcion,r.acceso,r.derechos_estado,r.derechos,r.licencia,...(r.etiquetas||[])].join(" "));
  return(!q||hay.includes(q))&&(!cat||r.categoria===cat);
 }).sort((a,b)=>order.value==="categoria"?(a.categoria.localeCompare(b.categoria,"es")||a.titulo.localeCompare(b.titulo,"es")):a.titulo.localeCompare(b.titulo,"es"));
 total.textContent=String(resources.length);
 count.textContent=(q||cat?found.length+" de "+resources.length+" referencias":"Colección de consulta · "+resources.length+" referencias")+(resources.length?" · "+new Set(resources.map(r=>r.categoria)).size+" categorías":"");
 list.replaceChildren();list.setAttribute("aria-busy","false");
 if(!found.length){list.append(el("p","estado","No encontramos recursos con esa búsqueda. Probá otras palabras o limpiá los filtros."));return}
 const frag=document.createDocumentFragment();
 found.forEach(r=>{
  const card=el("article","recurso");
  card.id="recurso-"+String(r.id).replace(/[^a-zA-Z0-9_-]/g,"-");
  const meta=[r.categoria,r.fecha].filter(Boolean).join(" · ");
  card.append(el("p","recurso-meta",meta),el("h3","",r.titulo));
  if(safeUrl(r.url)){
   const a=el("a","accion","Consultar recurso");
   a.href=r.url;a.target="_blank";a.rel="noopener noreferrer";
   a.setAttribute("aria-label","Consultar "+r.titulo+" en su fuente original");
   card.append(a);
  }
  const share=el("div","acciones-compartir recurso-compartir");
  const deep=location.href.split("#")[0]+"#"+card.id;
  const wa=el("a","boton-compartir whatsapp","WhatsApp");
  wa.href="https://wa.me/?text="+encodeURIComponent("Hola, te comparto este recurso de LIBRITO: "+r.titulo+". La Biblioteca Digital Chañarense reúne referencias a fotografías, mapas y materiales sobre San Patricio del Chañar, respetando sus créditos y condiciones de uso. Podés consultarlo acá: "+deep);
  wa.target="_blank";wa.rel="noopener noreferrer";
  const copy=el("button","boton-compartir copiar","Copiar enlace");
  copy.type="button";copy.dataset.copiarUrl=deep;
  const status=el("span","estado-copiar","");
  status.setAttribute("aria-live","polite");
  share.append(wa,copy,status);card.append(share);
  const details=el("details","recurso-derechos");
  details.append(el("summary","","Ver descripción, créditos y derechos"));
  if(r.descripcion)details.append(el("p","recurso-descripcion",r.descripcion));
  const dl=el("dl","recurso-datos");
  addDetail(dl,"Formato o tipo",r.tipo);
  addDetail(dl,"Autoría o institución",r.autor);
  addDetail(dl,"Modo de acceso",r.acceso);
  addDetail(dl,"Estado de derechos",r.derechos_estado);
  addDetail(dl,"Licencia o condiciones",r.licencia);
  if(dl.children.length)details.append(dl);
  if(r.derechos)details.append(el("p","recurso-nota-derechos",r.derechos));
  if(Array.isArray(r.etiquetas)&&r.etiquetas.length){
   const tags=el("div","recurso-etiquetas");
   r.etiquetas.forEach(t=>tags.append(el("span","",t)));
   details.append(tags);
  }
  if(safeUrl(r.fuente)){
   const source=el("a","recurso-fuente","Ver fuente y procedencia");
   source.href=r.fuente;source.target="_blank";source.rel="noopener noreferrer";
   details.append(source);
  }
  card.append(details);frag.append(card);
 });
 list.append(frag);
}
async function start(){
 try{
  const path=location.pathname.includes("/web/")?"../recursos.json":"recursos.json";
  const response=await fetch(path,{cache:"no-store"});
  if(!response.ok)throw new Error("No se pudo abrir el índice.");
  const data=await response.json();
  if(!data||!Array.isArray(data.recursos))throw new Error("Formato de catálogo inválido.");
  const ids=new Set();
  resources=data.recursos.filter(r=>{
   if(!r||!r.id||ids.has(r.id)||!r.titulo||!r.categoria||!r.descripcion||!safeUrl(r.url))return false;
   ids.add(r.id);return true;
  });
  [...new Set(resources.map(r=>r.categoria))].sort((a,b)=>a.localeCompare(b,"es")).forEach(v=>{
   const o=el("option","",v);o.value=v;category.append(o);
  });
  draw();
  if(location.hash&&location.hash.startsWith("#recurso-"))requestAnimationFrame(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({behavior:"smooth",block:"start"}));
 }catch(error){
  total.textContent="—";count.textContent="No se pudo cargar el índice.";
  list.replaceChildren(el("p","estado","Revisá tu conexión e intentá nuevamente."));
  console.error("LIBRITO Recursos:",error);
 }
}
input.addEventListener("input",draw);
category.addEventListener("change",draw);
order.addEventListener("change",draw);
clear.addEventListener("click",()=>{input.value="";category.value="";order.value="alfabetico";draw();input.focus()});
start();
})();
