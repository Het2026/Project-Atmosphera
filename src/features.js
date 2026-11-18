/* Advice, alerts, best time to visit, saved places, compare, time slider, shared reports, share links */
const AI={
 umbrella:'<path d="M12 3a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9zM12 12v6a2 2 0 0 0 4 0"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 mask:'<path d="M4 10c0-2 2-3 8-3s8 1 8 3v3c0 3-3 5-8 5s-8-2-8-5zM8 12h8"/>',
 therm:'<path d="M10 14.5V5a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0z"/>',
 wind:'<path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>',
 run:'<circle cx="14" cy="4.5" r="1.8"/><path d="m9 21 3-6-2.5-3 3-3.5 3 3 3 1M5.5 12.5 9 9"/>',
 car:'<path d="M5 16V11l2-5h10l2 5v5M3 16h18M7 19v-3M17 19v-3"/><circle cx="8" cy="13" r=".8"/><circle cx="16" cy="13" r=".8"/>',
 ok:'<path d="m5 12 4.5 4.5L19 7"/>',
 drop:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>'
};
const aiSvg=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${AI[k]}</svg>`;
const hr12=h=>{const x=Math.round(h)%24;return ((x%12)||12)+(x>=12?' PM':' AM')};

function adviceFor(p,w){
  const out=[],add=(k,c,t,d)=>out.push({i:aiSvg(k),c,t,d});
  if(/storm/i.test(w.cond))add('umbrella','#ff9f43','Stay off open ground','Thunderstorm in the area. Avoid trees, water and hilltops until it passes.');
  else if(w.pop>=50)add('umbrella','#5bb8ff','Carry an umbrella',w.pop+'% chance of rain today.');
  if(w.aqi>150)add('mask','#ff5c7a','Wear a mask outdoors','AQI is '+w.aqi+'. Cut back on outdoor exercise and keep windows closed.');
  else if(w.aqi>100)add('mask','#ff9f43','Sensitive people: take care','AQI is '+w.aqi+'. Children, older adults and people with asthma should limit long time outside.');
  if(w.uvMax>=6)add('sun','#ffb84a','Use sunscreen and a hat','UV peaks at '+w.uvMax.toFixed(0)+' around midday. Stay in shade from late morning to mid-afternoon.');
  else if(w.uvMax>=3&&out.length<3)add('sun','#ffb84a','Sunscreen if out for long','UV peaks at '+w.uvMax.toFixed(0)+' today.');
  if(w.hi>=35||w.feels>=38)add('drop','#ff9f43','Drink water, avoid midday heat','High near '+fT(w.hi)+'. Keep outdoor work for early morning or evening.');
  else if(w.lo<=5||w.feels<=3)add('therm','#5bb8ff','Dress in layers','Feels like '+fT(w.feels)+' now and drops to '+fT(w.lo)+'.');
  if(w.temp<=0&&w.pop>=30)add('therm','#8fb2ff','Watch for ice','Freezing temperatures with moisture. Roads and steps may be slippery.');
  if(w.gust>=45)add('wind','#5ee0c4','Gusty wind','Gusts to '+fW(w.gust)+'. Secure loose items and take care on two wheels.');
  if(w.vis<2)add('car','#cfd9f5','Drive slowly','Visibility is about '+fV(w.vis)+'. Use low beams and leave extra distance.');
  if(w.aqi<=150&&w.pop<60&&out.length<4){
    let best=null;
    w.hourly.forEach((h,i)=>{const day=w.sunrise==null?w.polar==='day':(h.h>=w.sunrise&&h.h<=w.sunset-.5);if(!day)return;const s=Math.abs(h.t-20)+(i>12?.5:0);if(!best||s<best.s)best={s,h:h.h}});
    if(best)add('run','#3ddc97','Best time outside',hr12(best.h)+' to '+hr12(best.h+2)+' looks most comfortable ('+fT(w.hourly.find(x=>x.h===best.h).t)+').');
  }
  if(out.length<2)add('ok','#3ddc97','Easy conditions','Nothing special to plan for around '+p.name+' today.');
  return out.slice(0,4);
}
function alertsFor(p,w,rep){
  const a=[];
  if(w.aqi>=200)a.push({c:'#ff5c7a',t:'Very unhealthy air',d:'AQI '+w.aqi+'. Everyone should limit time outdoors.'});
  else if(w.aqi>=150)a.push({c:'#ff9f43',t:'Unhealthy air quality',d:'AQI '+w.aqi+'. Sensitive groups should stay indoors.'});
  if(w.temp>=38||w.feels>=40)a.push({c:'#ff5c7a',t:'Heat warning',d:'Feels like '+fT(w.feels)+'. Avoid strenuous outdoor activity.'});
  if(w.temp<=-15)a.push({c:'#8fb2ff',t:'Extreme cold',d:'Frostbite risk on exposed skin within minutes.'});
  if(/storm/i.test(w.cond))a.push({c:'#ff9f43',t:'Thunderstorm',d:'Lightning and heavy rain in the area.'});
  if(w.gust>=60)a.push({c:'#ff9f43',t:'Strong wind',d:'Gusts to '+fW(w.gust)+'.'});
  if(w.cond==='Fog'&&w.vis<1)a.push({c:'#cfd9f5',t:'Dense fog',d:'Visibility under '+fV(1)+'.'});
  const crit=rep.filter(r=>!r.ex&&r.sev>=3&&Date.now()-r.t<864e5);
  if(crit.length)a.push({c:'#ff5c7a',t:crit.length+' serious report'+(crit.length>1?'s':'')+' nearby',d:'People reported severe problems in the last 24 hours. See community reports below.'});
  return a.slice(0,3);
}

/* Best time to visit, modelled from latitude, altitude and seasonal rain patterns */
const MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function monthly(p){
  const alt=ALT[p.name]||0,dry=DRY.has(p.name),aqb=POLL[p.name]!=null?POLL[p.name]:30;
  const monsoon=p.lat>5&&p.lat<32&&p.lon>65&&p.lon<100;
  const out=[];
  for(let m=0;m<12;m++){
    const doy=m*30.4+15,dec=-23.44*Math.cos(2*Math.PI*(doy+10)/365),sh=dec*.39;
    const d=Math.abs(p.lat-sh)*RAD;
    let t=29-38*Math.pow(1-Math.cos(d),.9)-alt/1000*6.5;
    if(monsoon&&(m===3||m===4||m===5))t+=3;
    if(monsoon&&m>=6&&m<=8)t-=1.5;
    let pop;
    if(dry)pop=6;
    else if(monsoon)pop=m>=5&&m<=8?78:m===9?35:m===3||m===4?14:5;
    else if(Math.abs(p.lat)<15){const wet=p.lat>=0?(m>=4&&m<=9):(m>=10||m<=3);pop=wet?58:20}
    else pop=30+(hash(p.key+m)%12)-4;
    let aqi=aqb;
    if(aqb>=90&&p.lat>15&&p.lat<42&&(m>=10||m<=1))aqi=aqb*1.35;
    if(monsoon&&m>=6&&m<=8)aqi=aqb*.55;
    const ts=Math.max(0,100-Math.abs(t-22)*5),rs=100-pop,as=Math.max(0,100-aqi/3);
    out.push({m,t,pop,aqi,score:Math.round(.5*ts+.25*rs+.25*as)});
  }
  return out;
}
function bestMonths(p){const ms=monthly(p),mx=Math.max(...ms.map(x=>x.score));return ms.filter(x=>x.score>=mx-7).sort((a,b)=>b.score-a.score).slice(0,5).sort((a,b)=>a.m-b.m).map(x=>MN[x.m])}
function bestTimeHTML(p){
  const ms=monthly(p),W=372,H=118,bw=22,gap=(W-12*bw)/11,top=8,base=84;
  let bars='';
  ms.forEach((x,i)=>{
    const h=Math.max(4,(base-top)*x.score/100),xx=i*(bw+gap),col=x.score>=70?'#3ddc97':x.score>=55?'#ffd84d':x.score>=40?'#ff9f43':'#ff5c7a';
    bars+=`<g><title>${MN[x.m]}: comfort ${x.score}/100, about ${fT(x.t)}, ${Math.round(x.pop)}% rain days, AQI ${Math.round(x.aqi)}</title><rect x="${xx.toFixed(1)}" y="${(base-h).toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" rx="5" fill="${col}" opacity="${x.m===new Date().getMonth()?1:.78}"/>
    <text x="${(xx+bw/2).toFixed(1)}" y="${base+14}" fill="${x.m===new Date().getMonth()?'#ffb84a':'#7584b0'}" font-family="IBM Plex Mono,monospace" font-size="10.5" text-anchor="middle">${MN[x.m][0]}</text>
    <text x="${(xx+bw/2).toFixed(1)}" y="${base+28}" fill="#a3b1d6" font-family="IBM Plex Mono,monospace" font-size="10" text-anchor="middle">${fTn(x.t)}°</text></g>`;
  });
  const best=bestMonths(p);
  return `<section class="sec"><h3>Best time to visit<em>comfort by month</em></h3>
  <svg viewBox="0 0 ${W} ${H+14}" style="display:block;width:100%;height:auto" role="img" aria-label="Comfort score by month. Best months: ${best.join(', ')}">${bars}</svg>
  <p class="sub" style="margin-top:8px"><b style="color:var(--ink)">Best months: ${best.join(', ')}.</b> Scored from temperature, rain and air quality. Modelled from seasonal patterns, not historical records.</p></section>`;
}

/* Saved places and compare list (kept in this browser) */
const placeKey=p=>p.isPoint?'pt:'+p.lat.toFixed(2)+','+p.lon.toFixed(2):'c:'+p.name;
function resolveKey(k){if(k.startsWith('c:'))return CITIES.find(c=>c.name===k.slice(2));const[la,lo]=k.slice(3).split(',').map(Number);return pointPlace([lo,la])}
let SAVED=[];
try{const s=JSON.parse(localStorage.getItem('atmosphera.saved.v1')||'[]');if(Array.isArray(s))SAVED=s.filter(x=>typeof x==='string')}catch(e){}
const saveSaved=()=>{try{localStorage.setItem('atmosphera.saved.v1',JSON.stringify(SAVED))}catch(e){}};
const isSaved=p=>SAVED.includes(placeKey(p));
function toggleSaved(p){const k=placeKey(p),i=SAVED.indexOf(k);if(i>=0)SAVED.splice(i,1);else SAVED.unshift(k);saveSaved();renderSaved();renderPanel(true)}
function toggleCmp(p){const k=placeKey(p),i=state.cmp.indexOf(k);if(i>=0)state.cmp.splice(i,1);else{state.cmp.push(k);if(state.cmp.length>3)state.cmp.shift()}renderCmpBtn();renderPanel(true)}
function renderCmpBtn(){const b=$('#open-cmp');b.hidden=state.cmp.length===0;b.querySelector('span').textContent='Compare ('+state.cmp.length+')'}
function renderSaved(){
  $('#saved-n').textContent=SAVED.length;
  const box=$('#saved-list');
  if(!SAVED.length){box.innerHTML='<p class="empty" style="margin:0">No saved places yet. Open a place and tap Save place to keep it here.</p>';return}
  box.innerHTML=SAVED.map(k=>{const p=resolveKey(k);if(!p)return '';const w=weather(p),ac=aqiCat(w.aqi);return `<div class="srow"><button type="button" data-open="${esc(k)}"><span>${esc(p.name)}<small>${esc(p.region||p.country)}</small></span><span class="aq" style="--c:${ac.c}">AQI ${w.aqi}</span><span class="t">${fT(w.temp)}</span></button><button type="button" class="x" data-rm="${esc(k)}" aria-label="Remove ${esc(p.name)} from saved">×</button></div>`}).join('');
}
function cmpHTML(){
  const ps=state.cmp.map(resolveKey).filter(Boolean),ws=ps.map(p=>weather(p));
  if(ps.length<2)return '<p class="empty">Add at least two places with the Compare button in the weather panel. You have '+ps.length+' so far.</p>';
  const rows=[
    ['Temperature',(w)=>fT(w.temp),w=>Math.abs(w.temp-22),'low'],
    ['Feels like',w=>fT(w.feels),w=>Math.abs(w.feels-22),'low'],
    ['Conditions',w=>w.cond,null],
    ['Air quality (AQI)',w=>w.aqi+' · '+aqiCat(w.aqi).l,w=>w.aqi,'low'],
    ['Wind',w=>fW(w.wind),w=>w.wind,'low'],
    ['Chance of rain',w=>w.pop+'%',w=>w.pop,'low'],
    ['Humidity',w=>w.hum+'%',w=>Math.abs(w.hum-50),'low'],
    ['UV index now',w=>w.uv.toFixed(1),w=>w.uv,'low'],
    ['Visibility',w=>fV(w.vis),w=>-w.vis,'low'],
    ['Best months',(w,p)=>bestMonths(p).join(', '),null]
  ];
  let h='<div class="cmpwrap"><table class="cmp"><thead><tr><th></th>'+ps.map(p=>`<th scope="col"><b>${esc(p.name)}</b><small>${esc(p.region||p.country)}</small><button type="button" data-cmp-rm="${esc(placeKey(p))}">Remove</button></th>`).join('')+'</tr></thead><tbody>';
  for(const r of rows){
    let best=-1;if(r[2]){const v=ws.map(w=>r[2](w));best=v.indexOf(Math.min(...v));if(v.every(x=>x===v[0]))best=-1}
    h+=`<tr><th scope="row">${r[0]}</th>`+ws.map((w,i)=>`<td${i===best?' class="best"':''}>${esc(r[1](w,ps[i]))}</td>`).join('')+'</tr>';
  }
  return h+'</tbody></table></div><p class="note" style="margin-top:12px">Highlighted cells are the most comfortable or safest value in each row. Uses live data where available.</p>';
}

/* Time slider for the globe layers */
const hr=$('#hrs'),hl=$('#hrs-l');let hrTimer=null;
function updHrs(){state.hrs=+hr.value;hl.textContent=state.hrs?'+'+state.hrs+' h · '+new Date(Date.now()+state.hrs*36e5).toLocaleString('en',{weekday:'short',hour:'numeric'}):'Now'}
hr.addEventListener('input',updHrs);
$('#hrs-now').onclick=()=>{hr.value=0;updHrs()};
$('#hrs-play').onclick=e=>{
  const b=e.currentTarget;if(hrTimer){clearInterval(hrTimer);hrTimer=null;b.setAttribute('aria-pressed','false');return}
  b.setAttribute('aria-pressed','true');hrTimer=setInterval(()=>{hr.value=(+hr.value+3)>48?0:+hr.value+3;updHrs()},800);
};

/* Share links: the page address follows the selected city */
const slug=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
let hashLock=false;
function setHash(p){if(p.isPoint)return;hashLock=true;try{location.hash=slug(p.name)}catch(e){}setTimeout(()=>{hashLock=false},50)}
function fromHash(){const h=(location.hash||'').slice(1);if(!h)return false;const c=CITIES.find(c=>slug(c.name)===h);if(c){select(c);return true}return false}
window.addEventListener('hashchange',()=>{if(!hashLock)fromHash()});

/* Contacts for the report form and "Copy for authority" */
function reportText(r){const c=catById(r.cat),s=SEV[r.sev-1];return 'Problem report (via Atmosphera)\nType: '+c.l+', '+s.l+'\nPlace: '+r.place+' ('+fLL(r.lat,r.lon)+')\nReported: '+new Date(r.t).toLocaleString('en',{dateStyle:'medium',timeStyle:'short'})+'\nDetails: '+r.text}

/* Shared reports through the page database, when the viewer can use it */
let CAN_WRITE=true;
async function initShared(){
  if(!window.claude||!window.claude.use)return;
  let db=null,user=null;
  try{db=await window.claude.use('db');user=await window.claude.use('user')}catch(e){}
  if(!db)return;
  DBH=db;
  try{if(user){UID=await user.id();CAN_EDIT=!!user.canEdit();CAN_WRITE=user.can('data.write')!==false}}catch(e){}
  const fail=()=>{};
  db.collection('reports').orderBy('t','desc').limit(300).onSnapshot(s=>{SHARED=s.docs.map(d=>Object.assign({id:d.id,shared:true},d.data()));rebuildReports();renderPanel(true)},fail);
  db.collection('status').onSnapshot(s=>{for(const k in STATUS)delete STATUS[k];s.docs.forEach(d=>{STATUS[d.id]=(d.data()||{}).status||'open'});renderPanel(true)},fail);
  db.collection('confirms').onSnapshot(s=>{for(const k in CONF)delete CONF[k];s.docs.forEach(d=>{const x=d.data()||{};if(!x.rid)return;(CONF[x.rid]=CONF[x.rid]||new Set()).add(x.uid)});renderPanel(true)},fail);
}
