(() => {
"use strict";
const input=document.querySelector("#buscador-hemeroteca"),list=document.querySelector("#lista-hemeroteca"),count=document.querySelector("#contador-hemeroteca");
if(!input||!list||!count)return;
const norm=v=>String(v||"").toLocaleLowerCase("es").normalize("NFD").replace(/[\\u0300-\\u036f]/g,"");
const safeUrl=v=>{try{const u=new URL(v);return ["https:","http:"].includes(u.protocol)&&!!u.hostname&&!u.username&&!u.password}catch(_){return false}};
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n};
const date=v=>{const m=String(v||"").match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);return m?m[3]+"/"+m[2]+"/"+m[1]:String(v||"Fecha no informada")};
let news=[];
function draw(){
 const q=norm(input.value.trim());
 const found=news.filter(n=>norm([n.titulo,n.fecha,n.medio,n.autor,n.descripcion,...(n.etiquetas||[])].join(" ")).includes(q));
 count.textContent=q?found.length+" noticias encontradas":news.length+" noticias registradas · ordenadas por año, de la más reciente a la más antigua";
 list.replaceChildren();list.setAttribute("aria-busy","false");
 if(!found.length){list.append(el("p","estado","No encontramos noticias con esa búsqueda. Probá con otra palabra o un año."));return}
 const frag=document.createDocumentFragment();
 let activeYear="";
 for(const n of found){
  const year=String(n.fecha).slice(0,4)||"Fecha no informada";
  if(year!==activeYear){
   activeYear=year;
   const heading=el("h3","hemeroteca-anio","Año "+year);
   heading.setAttribute("aria-label","Noticias del año "+year);
   frag.append(heading);
  }
  const card=el("article","noticia");
  const meta=el("p","noticia-meta",date(n.fecha)+" · "+n.medio+(n.autor&&n.autor!=="Redacción"?" · "+n.autor:""));
  card.append(meta);
  if(n.imagen&&safeUrl(n.imagen)){
   const figure=el("figure","noticia-imagen");
   const img=el("img","");
   img.src=n.imagen;img.alt=n.imagen_alt||("Imagen relacionada con: "+n.titulo);
   img.loading="lazy";img.decoding="async";
   img.addEventListener("error",()=>figure.remove(),{once:true});
   figure.append(img);
   if(n.imagen_credito)figure.append(el("figcaption","",n.imagen_credito));
   card.append(figure);
  }
  card.append(el("h3","",""+n.titulo));card.append(el("p","",n.descripcion));
  const a=el("a","accion","Leer en el diario");
  if(safeUrl(n.url)){a.href=n.url;a.target="_blank";a.rel="noopener noreferrer";card.append(a)}
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
  draw();
 }catch(e){count.textContent="No se pudo cargar la hemeroteca.";list.replaceChildren(el("p","estado","Revisá tu conexión e intentá nuevamente."));console.error("LIBRITO Hemeroteca:",e)}
}
input.addEventListener("input",draw);start();
})();