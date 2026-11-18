/* National emergency numbers: ambulance/medical | fire | police | other lines (Label=number;...)
   Only numbers that are well established are listed. Countries not listed fall back to a generic note. */
const HL_RAW=`IN:108|101|100|Unified emergency=112;Disaster (NDMA)=1078;Women helpline=1091;Child helpline=1098
US:911|911|911|Poison control=1-800-222-1222;Suicide and crisis lifeline=988
CA:911|911|911|Poison centre (most provinces)=1-844-764-7669
GB:999|999|999|NHS non-urgent=111;Also works=112
IE:112|112|112|Also works=999
AU:000|000|000|Mobile alternative=112;Storm and flood help (SES)=132 500
NZ:111|111|111|Healthline=0800 611 116
DE:112|112|110|
FR:15|18|17|Any emergency (EU)=112
ES:112|112|112|
IT:118|115|113|Carabinieri=112
NL:112|112|112|
AT:144|122|133|Any emergency (EU)=112
CH:144|118|117|Any emergency=112
CZ:155|150|158|Any emergency (EU)=112
HU:104|105|107|Any emergency (EU)=112
PL:999|998|997|Any emergency (EU)=112
PT:112|112|112|
GR:166|199|100|Any emergency (EU)=112
SE:112|112|112|
NO:113|110|112|
FI:112|112|112|
IS:112|112|112|
FO:112|112|112|
GL:112|112|112|
SJ:113|110|112|
RU:103|101|102|Any emergency=112
UA:103|101|102|Any emergency=112
TR:112|112|112|
KZ:103|101|102|Any emergency=112
UZ:103|101|102|
MN:103|101|102|
CN:120|119|110|Traffic police=122
HK:999|999|999|
TW:119|119|110|
JP:119|119|110|Coast guard=118
KR:119|119|112|Coast guard=122
SG:995|995|999|Non-emergency ambulance=1777
MY:999|994|999|Any emergency (mobile)=112
TH:1669|199|191|Tourist police=1155
VN:115|114|113|
ID:119|113|110|Search and rescue=115
PH:911|911|911|
PK:115|16|15|Rescue (Punjab)=1122
BD:999|999|999|
LK:1990|110|119|Disaster management=117
NP:102|101|100|
AE:998|997|999|
SA:997|998|999|Any emergency=112
QA:999|999|999|
OM:9999|9999|9999|
JO:193|199|191|
IL:101|102|100|
LB:140|175|112|Civil defence=125
IR:115|125|110|
EG:123|180|122|Tourist police=126
MA:15|15|19|
DZ:14|14|17|
TN:190|198|197|
NG:112|112|112|Alternative=199
GH:193|192|191|Any emergency=112
KE:999|999|999|Any emergency=112
ET:907|939|991|
UG:999|999|999|Any emergency=112
TZ:112|112|112|
ZA:10177|10177|10111|Any mobile emergency=112
AO:112|112|113|
BR:192|193|190|Civil defence=199
AR:107|100|101|Any emergency=911
CL:131|132|133|
CO:123|123|123|
PE:106|116|105|
EC:911|911|911|
UY:911|911|911|
VE:911|911|911|
BO:118|119|110|
PY:911|911|911|
MX:911|911|911|
PA:911|911|911|
CU:104|105|106|`;
const HL={};HL_RAW.trim().split('\n').forEach(l=>{const i=l.indexOf(':'),cc=l.slice(0,i),[a,f,p,x]=l.slice(i+1).split('|');HL[cc]={amb:a,fire:f,pol:p,more:(x||'').split(';').filter(Boolean).map(s=>s.split('='))}});
const helpFor=cc=>{const h=HL[cc];return h?`Ambulance and hospitals ${h.amb}, fire ${h.fire}, police ${h.pol}.`:'In an emergency call your local emergency number. 112 works on most mobile phones worldwide.'};
const mapQ=(q,p)=>`https://www.google.com/maps/search/${q}/@${p.lat.toFixed(4)},${p.lon.toFixed(4)},14z`;
const tel=n=>`<a href="tel:${n.replace(/[^\d+]/g,'')}">${esc(n)}</a>`;
function helplinesHTML(p){
  const h=HL[p.cc];
  const rows=h?[['Ambulance and hospitals',h.amb],['Fire brigade',h.fire],['Police',h.pol]].concat(h.more):[];
  const links=[['hospital','Hospitals'],['fire+station','Fire stations'],['police+station','Police stations'],['pharmacy','Pharmacies']].map(([q,l])=>`<a class="chipbtn" href="${mapQ(q,p)}" target="_blank" rel="noopener noreferrer">${l} near here</a>`).join('');
  return `<section class="sec" id="helpsec"><h3>Emergency helplines<em>${esc(p.country)}</em></h3>
  ${h?`<div class="hl">${rows.map(r=>`<div><span>${esc(r[0])}</span><b>${tel(r[1])}</b></div>`).join('')}</div>`:`<p class="note">We do not have verified numbers for ${esc(p.country)} yet. Call your local emergency number. 112 works on most mobile phones worldwide.</p>`}
  <div class="acts" style="margin-top:10px">${links}</div>
  <p class="note" style="margin-top:10px">Numbers are national emergency lines. Individual hospitals and stations are found on the map links, so check the number there before relying on it. <button type="button" class="linkbtn" id="open-help">Helplines for every country</button></p></section>`;
}
function helpListHTML(q){
  q=(q||'').trim().toLowerCase();
  const list=Object.keys(HL).map(cc=>({cc,n:regionName(cc)})).filter(x=>!q||x.n.toLowerCase().includes(q)||x.cc.toLowerCase()===q).sort((a,b)=>a.n.localeCompare(b.n));
  if(!list.length)return '<p class="note">No country matches that search.</p>';
  return `<table class="cmp hltab"><thead><tr><th>Country</th><th>Ambulance</th><th>Fire</th><th>Police</th></tr></thead><tbody>${list.map(x=>{const h=HL[x.cc];return `<tr><th scope="row">${esc(x.n)}</th><td>${tel(h.amb)}</td><td>${tel(h.fire)}</td><td>${tel(h.pol)}</td></tr>`}).join('')}</tbody></table>`;
}
/* Quick one-tap reports and the worldwide feed */
const QUICK=[{l:'Too hot',cat:'heat',sev:2},{l:'Too cold',cat:'heat',sev:2},{l:'Smoky or bad air',cat:'air',sev:3},{l:'Strong wind',cat:'wind',sev:2},{l:'Heavy rain',cat:'rain',sev:2},{l:'Thick cloud, dark',cat:'clouds',sev:1},{l:'Storm or lightning',cat:'storm',sev:3},{l:'All fine here',cat:'weather',sev:1}];
function quickHTML(p){return `<section class="sec"><h3>How is it where you are?<em>one tap</em></h3><div class="quick">${QUICK.map((q,i)=>`<button type="button" data-quick="${i}">${esc(q.l)}</button>`).join('')}</div><p class="note" style="margin-top:8px">Adds a short report for ${esc(p.name)}. Use "Report a problem" below to add details or a photo.</p></section>`}
function feedHTML(cat){
  const rs=REPORTS.filter(r=>!r.ex&&(!cat||r.cat===cat)).slice(0,60);
  if(!rs.length)return '<p class="note">No live reports yet. Reports posted by people around the world appear here, newest first.</p>';
  return rs.map(r=>{const c=catById(r.cat),s=SEV[r.sev-1];return `<button type="button" class="feedrow" data-feed="${r.id}"><span class="cat">${catIcon(r.cat)}${c.l}</span><span class="sev" style="--c:${s.c}">${s.l}</span><span class="ft">${esc(r.text)}</span><small>${esc(r.place)} · ${ago(r.t)}</small></button>`}).join('');
}
