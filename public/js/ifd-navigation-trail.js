/* IFD Navigation Trail v1.0 */
(function () {
  "use strict";
  if (window.__IFD_NAV_TRAIL__) return;
  window.__IFD_NAV_TRAIL__ = true;
  const KEY="ifd.navigationTrail.v1", SCROLL_KEY="ifd.navigationTrail.scroll.v1", LIMIT=30;
  const gateways={"/understand.html":"UNDERSTAND","/research-gateway.html":"RESEARCH","/library-gateway.html":"LIBRARY","/museum-gateway.html":"MUSEUM","/experience-gateway.html":"EXPERIENCE","/participate-gateway.html":"PARTICIPATE"};
  const here=location.pathname+location.search+location.hash;
  const title=(document.title||location.pathname||"Untitled page").replace(/\s*[·|—-]\s*Identity Field Dynamics\s*$/i,"").trim();
  const sameOrigin=value=>{try{return new URL(value,location.href).origin===location.origin;}catch(_){return false;}};
  const cleanPath=value=>{try{const u=new URL(value,location.href);return u.pathname+u.search+u.hash;}catch(_){return "/";}};
  const gatewayFor=path=>gateways[cleanPath(path).split(/[?#]/)[0]]||null;
  const read=(key,fallback)=>{try{return JSON.parse(sessionStorage.getItem(key))||fallback;}catch(_){return fallback;}};
  const write=(key,value)=>{try{sessionStorage.setItem(key,JSON.stringify(value));}catch(_){}};
  let state=read(KEY,null);
  if(!state||!Array.isArray(state.visits))state={origin:{url:here,title:title},category:null,visits:[]};
  const referrer=sameOrigin(document.referrer)?cleanPath(document.referrer):null;
  const currentGateway=gatewayFor(here), referrerGateway=referrer?gatewayFor(referrer):null;
  if(currentGateway)state.category={url:here,title:currentGateway};
  else if(referrerGateway)state.category={url:referrer,title:referrerGateway};
  else if(!state.category){
    const p=location.pathname;
    if(p.startsWith("/research"))state.category={url:"/research-gateway.html",title:"RESEARCH"};
    else if(p.startsWith("/current-ifd")||p.startsWith("/tools")||p.startsWith("/living-corpus")||p.startsWith("/archive"))state.category={url:"/library-gateway.html",title:"LIBRARY"};
    else if(p.startsWith("/quiz")||p.startsWith("/the-encounter")||p.startsWith("/hard-shark"))state.category={url:"/experience-gateway.html",title:"EXPERIENCE"};
    else if(p.startsWith("/salon")||p.startsWith("/write-club")||p.startsWith("/lu-basement"))state.category={url:"/participate-gateway.html",title:"PARTICIPATE"};
    else state.category={url:"/understand.html",title:"UNDERSTAND"};
  }
  const nav=performance.getEntriesByType&&performance.getEntriesByType("navigation")[0];
  const isTraversal=!!(nav&&nav.type==="back_forward"), last=state.visits[state.visits.length-1];
  if(!isTraversal&&(!last||last.url!==here)){state.visits.push({url:here,title:title||here});if(state.visits.length>LIMIT)state.visits.splice(0,state.visits.length-LIMIT);}
  write(KEY,state);
  let entryId=history.state&&history.state.ifdTrailEntryId;
  if(!entryId){entryId="ifd-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,9);try{history.replaceState(Object.assign({},history.state||{},{ifdTrailEntryId:entryId}),"",location.href);}catch(_){}}
  try{history.scrollRestoration="manual";}catch(_){}
  const saveScroll=()=>{const positions=read(SCROLL_KEY,{});positions[entryId]=window.scrollY||window.pageYOffset||0;write(SCROLL_KEY,positions);};
  let scrollSavePending=false;
  window.addEventListener("scroll",()=>{if(scrollSavePending)return;scrollSavePending=true;requestAnimationFrame(()=>{scrollSavePending=false;saveScroll();});},{passive:true});
  window.addEventListener("pagehide",saveScroll);
  window.addEventListener("beforeunload",saveScroll);
  window.addEventListener("pageshow",event=>{const y=read(SCROLL_KEY,{})[entryId];if(typeof y==="number"&&(event.persisted||isTraversal))requestAnimationFrame(()=>window.scrollTo(0,y));});
  const style=document.createElement("style");
  style.textContent="#ifd-navtrail{position:relative;z-index:1;display:block;width:max-content;max-width:calc(100% - 20px);margin:22px auto 28px;padding:0;border:0;background:transparent;box-shadow:none;font:12px/1.45 system-ui,-apple-system,Segoe UI,sans-serif;color:#eeeae1;text-align:center}"+
  "#ifd-navtrail *{box-sizing:border-box}#ifd-navtrail button,#ifd-navtrail a{font:inherit}"+
  "#ifd-navtrail .toggle{display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(214,177,90,.38);border-radius:2px;background:transparent;color:#b9a16c;padding:5px 9px;letter-spacing:.12em;font-size:10px;cursor:pointer;box-shadow:none;transition:color .2s,border-color .2s,text-shadow .2s}"+
  "#ifd-navtrail .toggle:hover{color:#fff0b5;border-color:rgba(243,218,140,.72);text-shadow:0 0 7px rgba(243,218,140,.45)}"+
  "#ifd-navtrail .panel{display:none;width:min(330px,calc(100vw - 32px));max-height:min(60vh,460px);overflow:auto;margin:0 0 8px auto;padding:14px;background:rgba(8,8,7,.98);border:1px solid rgba(214,177,90,.48);box-shadow:0 8px 30px #000b;text-align:left}"+
  "#ifd-navtrail[data-open=true] .panel{display:block}#ifd-navtrail .heading{margin:0 0 8px;color:#d6b15a;font-size:10px;letter-spacing:.18em;text-transform:uppercase}"+
  "#ifd-navtrail .actions{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 12px}#ifd-navtrail .actions a,#ifd-navtrail .actions button{display:inline-block;padding:5px 7px;border:1px solid #5c4a28;color:#f3da8c;background:transparent;text-decoration:none;cursor:pointer}"+
  "#ifd-navtrail ol{list-style:none;padding:0;margin:0;display:grid;gap:5px}#ifd-navtrail li a{display:block;padding:5px 7px;color:#eeeae1;text-decoration:none;border-left:2px solid #574522;background:#ffffff08}"+
  "#ifd-navtrail li a[aria-current=page]{border-left-color:#f3da8c;color:#f3da8c}#ifd-navtrail .empty{color:#aaa69b}"+
  "@media(max-width:600px){#ifd-navtrail{width:max-content;max-width:calc(100% - 20px);margin:18px auto 20px;padding:0}#ifd-navtrail .panel{max-height:55vh}}";
  document.head.appendChild(style);
  const root=document.createElement("aside");root.id="ifd-navtrail";root.setAttribute("aria-label","Navigation trail");root.dataset.open="false";
  const esc=value=>String(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const visits=state.visits.slice(-12).reverse();
  const items=visits.length?visits.map(item=>"<li><a href=\""+esc(item.url)+"\""+(item.url===here?" aria-current=\"page\"":"")+">"+esc(item.title||item.url)+"</a></li>").join(""):"<li class=\"empty\">Your path will appear here as you explore.</li>";
  const origin=state.origin||{url:here,title:title}, category=state.category||{url:"/",title:"CATHEDRAL"};
  root.innerHTML="<div class=\"panel\" id=\"ifd-navtrail-panel\" aria-label=\"Visited pages\">"+
    "<p class=\"heading\">WAYFINDING</p><div class=\"actions\">"+
    "<a href=\""+esc(origin.url)+"\" title=\"Return to the first page in this tab\">Point of Origin</a>"+
    "<a href=\""+esc(category.url)+"\" title=\"Return to the most recently visited Cathedral gateway\">Return to "+esc(category.title)+"</a>"+
    "<button type=\"button\" data-step=\"-1\" title=\"Previous page\">← Back</button>"+
    "<button type=\"button\" data-step=\"1\" title=\"Next page\">Forward →</button></div>"+
    "<p class=\"heading\">YOUR RECENT PATH</p><ol>"+items+"</ol></div>"+
    "<button class=\"toggle\" type=\"button\" aria-label=\"Open Navigation Trail\" aria-expanded=\"false\" aria-controls=\"ifd-navtrail-panel\"><span aria-hidden=\"true\">⌖</span><span>NAV TRAIL · "+state.visits.length+"</span></button>";
  const footer=document.querySelector("footer.ifd-footer");
  if(footer&&footer.parentElement===document.body)document.body.insertBefore(root,footer);
  else document.body.appendChild(root);
  const toggle=root.querySelector(".toggle");
  toggle.addEventListener("click",()=>{const open=root.dataset.open!=="true";root.dataset.open=String(open);toggle.setAttribute("aria-expanded",String(open));});
  root.querySelectorAll("[data-step]").forEach(button=>button.addEventListener("click",()=>{if(button.dataset.step==="-1")history.back();else history.forward();}));
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&root.dataset.open==="true"){root.dataset.open="false";toggle.setAttribute("aria-expanded","false");toggle.focus();}});
})();