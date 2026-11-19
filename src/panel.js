const state={layer:'temp',hrs:0,cmp:[],lon0:60,lat0:18,k:1,kT:1,spin:true,selected:null,hover:null,showReports:true,clouds:false,lastInteract:0,fly:null,vx:0,vy:0,dragging:false};
const ago=ms=>{const m=Math.round((Date.now()-ms)/60000);if(m<1)return 'just now';if(m<60)return m+' min ago';const h=Math.round(m/60);return h<24?h+' h ago':Math.round(h/24)+' d ago'};

/* Community reports. Shared reports live in the page database when the viewer can use it.
   Reports posted without it stay in this browser. The first six are labelled examples. */
const MIN=60000;
const SEED=[
 {id:'s1',place:'Delhi',lat:28.61,lon:77.21,cat:'air',sev:3,text:'Thick smog since early morning. Visibility under 200 m on the ring road and eyes burning.',t:Date.now()-38*MIN,n:41,ex:1},
 {id:'s2',place:'Mumbai',lat:19.08,lon:72.88,cat:'flood',sev:2,text:'Water pooling at the Andheri subway after the evening shower. Cars are taking the flyover instead.',t:Date.now()-95*MIN,n:17,ex:1},
 {id:'s3',place:'Pune',lat:18.52,lon:73.86,cat:'road',sev:2,text:'Cluster of potholes near the FC Road junction, one lane blocked by repair barriers.',t:Date.now()-3*60*MIN,n:9,ex:1},
 {id:'s4',place:'London',lat:51.51,lon:-0.13,cat:'building',sev:2,text:'Loose scaffolding sheet flapping above the pavement on a corner building. Wind picking up.',t:Date.now()-5*60*MIN,n:6,ex:1},
 {id:'s5',place:'Jakarta',lat:-6.21,lon:106.85,cat:'flood',sev:4,text:'Canal overflowing into two streets, residents moving belongings upstairs.',t:Date.now()-26*MIN,n:58,ex:1},
 {id:'s6',place:'Los Angeles',lat:34.05,lon:-118.24,cat:'air',sev:3,text:'Smoke haze from the hills, ash on parked cars. Sunset is orange-brown.',t:Date.now()-7*60*MIN,n:23,ex:1}
];
let LOCAL=[],SHARED=[],REPORTS=SEED.slice();
const STATUS={},CONF={},confirmed=new Set();
let UID=null,CAN_EDIT=false,DBH=null;
try{const raw=localStorage.getItem('atmosphera.reports.v1');if(raw){const m=JSON.parse(raw);if(Array.isArray(m))LOCAL=m}}catch(e){}
function saveLocal(){try{localStorage.setItem('atmosphera.reports.v1',JSON.stringify(LOCAL))}catch(e){}}
function rebuildReports(){REPORTS=SHARED.concat(LOCAL,SEED).sort((a,b)=>b.t-a.t)}
const repCount=r=>r.shared?(CONF[r.id]?CONF[r.id].size:0):(r.n||0)+(confirmed.has(r.id)?1:0);
const repMine=r=>r.shared?!!(UID&&CONF[r.id]&&CONF[r.id].has(UID)):confirmed.has(r.id);
function nearbyReports(p){return REPORTS.filter(r=>km(p,r)<(p.tier>=3||p.isPoint?160:220)||r.place===p.name).sort((a,b)=>b.t-a.t)}
const STAT={open:'Open',seen:'Seen by authority',fixed:'Fixed'};

function hourlySVG(w){
  const W=372,H=132,pl=10,pr=10,pt=26,pb=24,ts=w.hourly.map(h=>h.t);
  let mn=Math.min(...ts),mx=Math.max(...ts);if(mx-mn<4){mn-=2;mx+=2}
  const X=i=>pl+i*(W-pl-pr)/23, Y=t=>pt+(1-(t-mn)/(mx-mn))*(H-pt-pb);
  const pts=ts.map((t,i)=>[X(i),Y(t)]);
  let d='M'+pts[0][0].toFixed(1)+' '+pts[0][1].toFixed(1);
  for(let i=1;i<pts.length;i++){const mx2=(pts[i-1][0]+pts[i][0])/2;d+=` C${mx2.toFixed(1)} ${pts[i-1][1].toFixed(1)} ${mx2.toFixed(1)} ${pts[i][1].toFixed(1)} ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`}
  const area=d+` L${X(23)} ${H-pb} L${X(0)} ${H-pb}Z`;
  const iMax=ts.indexOf(Math.max(...ts)),iMin=ts.indexOf(Math.min(...ts));
  let lab='';[0,6,12,18,23].forEach(i=>{lab+=`<text x="${X(i)}" y="${H-6}" fill="#7584b0" font-family="IBM Plex Mono,monospace" font-size="11" text-anchor="${i===0?'start':i===23?'end':'middle'}">${i===0?'Now':fHour(w.hourly[i].h)}</text>`});
  const tag=(i,up)=>`<text x="${X(i)}" y="${Y(ts[i])+(up?-9:17)}" fill="#eaf0ff" font-family="IBM Plex Mono,monospace" font-size="12" text-anchor="${i<3?'start':i>20?'end':'middle'}">${fT(ts[i])}</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Temperature over the next 24 hours, from ${fT(Math.min(...ts))} to ${fT(Math.max(...ts))}">
  <defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb84a" stop-opacity=".38"/><stop offset="1" stop-color="#ffb84a" stop-opacity="0"/></linearGradient></defs>
  ${[0,1,2].map(i=>`<line x1="${pl}" x2="${W-pr}" y1="${pt+i*(H-pt-pb)/2}" y2="${pt+i*(H-pt-pb)/2}" stroke="#1e2c52" stroke-width="1"/>`).join('')}
  <path d="${area}" fill="url(#hg)"/><path d="${d}" fill="none" stroke="#ffb84a" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="5" fill="#ffb84a" stroke="#0a1226" stroke-width="2.5"/>
  ${iMax>1?tag(iMax,true):''}${iMin>1&&iMin!==iMax?tag(iMin,true):''}${lab}</svg>`;
}
function windSVG(w){
  const to=(w.dir+180)%360;let ticks='';
  for(let i=0;i<36;i++){const a=i*10*RAD,l=i%9===0?7:3.5;ticks+=`<line x1="${(42+Math.sin(a)*(38-l)).toFixed(1)}" y1="${(42-Math.cos(a)*(38-l)).toFixed(1)}" x2="${(42+Math.sin(a)*38).toFixed(1)}" y2="${(42-Math.cos(a)*38).toFixed(1)}" stroke="#2a3b69" stroke-width="1.2"/>`}
  return `<svg viewBox="0 0 84 84" role="img" aria-label="Wind from ${compass(w.dir)}"><circle cx="42" cy="42" r="38" fill="none" stroke="#1e2c52"/>${ticks}
  <text x="42" y="19" fill="#eaf0ff" font-size="9" font-family="IBM Plex Mono,monospace" text-anchor="middle">N</text>
  <g transform="rotate(${to} 42 42)"><path d="M42 20 49 46H42.6V62h-1.2V46H35z" fill="#5ee0c4"/></g><circle cx="42" cy="42" r="3" fill="#0a1226" stroke="#5ee0c4" stroke-width="1.5"/></svg>`;
}
function sunSVG(w){
  const W=372,H=96,cx=W/2,cy=84,rx=150,ry=62;
  const frac=w.frac;
  const ang=Math.PI*(1-(frac==null?.5:frac)), sx=cx+Math.cos(ang)*rx, sy=cy-Math.sin(ang)*ry;
  const up=frac!=null&&frac>=0&&frac<=1;
  return `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><line x1="10" x2="${W-10}" y1="${cy}" y2="${cy}" stroke="#2a3b69"/>
  <path d="M${cx-rx} ${cy} A${rx} ${ry} 0 0 1 ${cx+rx} ${cy}" fill="none" stroke="#2a3b69" stroke-width="2" stroke-dasharray="3 5"/>
  ${frac!=null?`<circle cx="${sx.toFixed(1)}" cy="${Math.min(cy,sy).toFixed(1)}" r="8" fill="${up?'#ffb84a':'#5b6a96'}" stroke="#101b38" stroke-width="3"/>`:''}</svg>`;
}
const ICO={
 star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
 cmp:'<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
 alert:'<path d="M12 3 2.5 20h19z"/><path d="M12 10v4M12 17v.5"/>'
};
const svgI=(k,fill)=>`<svg viewBox="0 0 24 24" fill="${fill||'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICO[k]}</svg>`;

const fD=k=>U.metric?Math.round(k).toLocaleString('en')+' km':Math.round(k*.621371).toLocaleString('en')+' mi';
function fPop(k){if(k==null)return null;if(k>=1000)return (k/1000).toFixed(k>=10000?0:1)+' million';if(k>=10)return Math.round(k*1000).toLocaleString('en');return k<1?'Under 1,000':Math.round(k*1000).toLocaleString('en')}
function aboutHTML(p,w){
  const near=CITIES.filter(c=>c!==p).map(c=>({c,d:km(p,c)})).sort((a,b)=>a.d-b.d).slice(0,5);
  const rows=[];
  if(p.region)rows.push(['State or region',p.region]);
  rows.push(['Country',p.isPoint?(p.cc?regionName(p.cc):'–'):p.country]);
  if(p.pop!=null)rows.push(['Population (approx.)',fPop(p.pop)]);
  if(!p.isPoint&&w.alt!=null)rows.push(['Elevation',U.metric?w.alt+' m':Math.round(w.alt*3.281)+' ft']);
  rows.push(['Time zone',p.tzName||'Local solar time']);
  rows.push(['Coordinates',fLL(p.lat,p.lon)]);
  rows.push(['Daylight today',w.sunrise!=null?((w.sunset-w.sunrise+24)%24).toFixed(1)+' hours':(w.polar==='day'?'24 hours':'0 hours')]);
  return `<section class="sec"><h3>About ${esc(p.isPoint?'this place':p.name)}</h3>
  <dl class="about">${rows.map(r=>`<dt>${r[0]}</dt><dd>${esc(r[1])}</dd>`).join('')}</dl></section>
  <section class="sec"><h3>Nearby places<em>tap to open</em></h3><div class="near">${near.map(n=>{const nw=weather(n.c);return `<button type="button" data-go="${n.c.id}"><span>${esc(n.c.name)}<small>${esc(n.c.region||n.c.country)}</small></span><span class="d">${fD(n.d)}</span><span class="t">${fT(nw.temp)}</span></button>`}).join('')}</div></section>`;
}

function renderPanel(keep){
  const p=state.selected,w=weather(p),ac=aqiCat(w.aqi);
  const rep=nearbyReports(p);
  const days=w.daily,dmin=Math.min(...days.map(d=>d.lo)),dmax=Math.max(...days.map(d=>d.hi));
  const sunTxt=w.polar==='night'?'Sun stays below the horizon':w.polar==='day'?'Sun stays up all day':'';
  const al=alertsFor(p,w,rep),adv=adviceFor(p,w);
  const saved=isSaved(p),inCmp=state.cmp.includes(placeKey(p));
  const html=`
  <div>
    <p class="eyebrow">${esc(p.isPoint?'Selected point':(p.region?p.region+' · ':'')+p.country)}</p>
    <h2>${esc(p.name)}</h2>
    <p class="meta">${esc(p.isPoint?p.country+' · ':'')}${fLL(p.lat,p.lon)}${w.alt?' · '+(U.metric?w.alt+' m':Math.round(w.alt*3.281)+' ft'):''} · ${fClock(w.lt)} ${w.tzLabel}</p>
    <div class="acts"><button type="button" class="chipbtn" data-act="save" aria-pressed="${saved}">${svgI('star',saved?'currentColor':'none')}${saved?'Saved':'Save place'}</button><button type="button" class="chipbtn" data-act="cmp" aria-pressed="${inCmp}">${svgI('cmp')}${inCmp?'In compare':'Compare'}</button></div>
  </div>
  ${al.length?`<div class="alerts">${al.map(a=>`<div class="alert" style="--c:${a.c}" role="alert">${svgI('alert')}<div><b>${esc(a.t)}</b><span>${esc(a.d)}</span></div></div>`).join('')}</div>`:''}
  <div class="now">
    <div class="temp">${fTn(w.temp)}<sup>°${U.metric?'C':'F'}</sup></div>
    <div class="cond">${icon(w.cond,w.night)}<div><b>${w.cond}</b><span>Feels like ${fT(w.feels)}</span></div></div>
    <div class="hilo"><span>High <b>${fT(w.hi)}</b></span><span>Low <b>${fT(w.lo)}</b></span><span>Rain <b>${w.pop}%</b></span></div>
  </div>
  <section class="sec"><h3>What to do today</h3><div class="advice">${adv.map(a=>`<div class="adv"><span class="ai" style="--c:${a.c}">${a.i}</span><div><b>${esc(a.t)}</b><span>${esc(a.d)}</span></div></div>`).join('')}</div></section>
  <section class="sec hourly"><h3>Next 24 hours<em>temperature</em></h3>${hourlySVG(w)}</section>
  <section class="sec"><h3>Conditions<em>${w.live?'Live · Open-Meteo · '+new Date(w.liveT).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'Modelled estimate'}</em></h3><div class="grid">
    <div class="tile wide"><h4>Air quality · US AQI</h4>
      <div class="aqi-top"><div class="big">${w.aqi}<small>${esc(ac.l)}</small></div><span class="pill" style="--c:${ac.c}">${w.aqi>150?'Avoid exertion':w.aqi>100?'Sensitive groups':w.aqi>50?'Acceptable':'Clean'}</span></div>
      <div class="aqibar" role="img" aria-label="AQI ${w.aqi} on a 0 to 300 scale"><i style="left:${clamp(w.aqi/300,0,1)*100}%"></i></div>
      <div class="pol"><div><b>${w.pm25}</b>PM2.5</div><div><b>${w.pm10}</b>PM10</div><div><b>${w.o3}</b>O₃</div><div><b>${w.no2}</b>NO₂</div></div>
      <div class="sub">${esc(ac.tip)}</div></div>
    <div class="tile wide"><h4>Wind</h4><div class="wind-row">${windSVG(w)}<div><div class="big">${fW(w.wind).split(' ')[0]}<small>${fW(w.wind).split(' ')[1]}</small></div><div class="sub">From the ${compass(w.dir)} (${w.dir}°)<br>Gusts to ${fW(w.gust)}</div></div></div></div>
    <div class="tile"><h4>Humidity</h4><div class="big">${w.hum}<small>%</small></div><div class="sub">Dew point ${fT(w.dew)}</div></div>
    <div class="tile"><h4>UV index</h4><div class="big">${w.uv.toFixed(1)}</div><div class="sub">${uvCat(w.uv)} now · peak ${w.uvMax.toFixed(0)}</div></div>
    <div class="tile"><h4>Visibility</h4><div class="big">${fV(w.vis).split(' ')[0]}<small>${fV(w.vis).split(' ')[1]}</small></div><div class="sub">${w.vis<2?'Poor':w.vis<6?'Reduced':'Clear'}</div></div>
    <div class="tile"><h4>Pressure</h4><div class="big">${fP(w.pressure).split(' ')[0]}<small>${fP(w.pressure).split(' ')[1]}</small></div><div class="sub">${w.pressure<1008?'Low, unsettled':w.pressure>1020?'High, settled':'Normal'}</div></div>
    <div class="tile wide sunarc"><h4>Sun</h4>${sunSVG(w)}<div class="row"><span>${w.sunrise!=null?'Sunrise '+fClock(w.sunrise):sunTxt}</span><span>${w.sunset!=null?'Sunset '+fClock(w.sunset):''}</span></div></div>
  </div></section>
  <section class="sec"><h3>7-day outlook</h3><div class="days">${days.map(d=>`<div class="day"><span class="dn">${d.d}</span>${icon(d.cond,false)}<span class="pop">${d.pop}%</span><span class="lo">${fTn(d.lo)}°</span><span class="range"><i style="left:${(d.lo-dmin)/(dmax-dmin)*100}%;right:${100-(d.hi-dmin)/(dmax-dmin)*100}%"></i></span><span class="hi">${fTn(d.hi)}°</span></div>`).join('')}</div></section>
  ${bestTimeHTML(p)}
  ${aboutHTML(p,w)}
  ${quickHTML(p)}
  <section class="sec"><h3>Community reports<em>${rep.length?rep.length+' nearby':''}</em></h3><div class="reports" id="replist">${
    rep.length?rep.slice(0,8).map(reportCard).join(''):`<div class="empty">No reports near ${esc(p.name)} yet. If something is wrong here, be the first to flag it.</div>`}
    <button type="button" class="btn primary" id="panel-report" style="align-self:flex-start"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2.5 20h19z"/><path d="M12 10v4M12 17v.5"/></svg>Report a problem here</button>
    <p class="note" id="repnote">${DBH?'Reports are shared with everyone who opens this page.':'Reports you post are saved only in this browser.'} Reports marked Example are placeholders.</p><button type="button" class="linkbtn" id="open-feed">See reports from around the world</button></div></section>
  ${helplinesHTML(p)}`;
  const panel=$('#panel'),top=panel.scrollTop;panel.innerHTML=html;panel.scrollTop=keep?top:0;
  renderChip();
}
function reportCard(r){
  const s=SEV[r.sev-1],c=catById(r.cat),mine=repMine(r),st=STATUS[r.id]||'open',n=repCount(r);
  const stat=r.ex?'':(CAN_EDIT&&r.shared?`<select class="stsel" data-status="${r.id}" aria-label="Report status">${Object.keys(STAT).map(k=>`<option value="${k}"${k===st?' selected':''}>${STAT[k]}</option>`).join('')}</select>`:`<span class="stat s-${st}">${STAT[st]}</span>`);
  return `<article class="rep"><div class="rep-h"><span class="cat">${catIcon(r.cat)}${c.l}</span><span class="sev" style="--c:${s.c}">${s.l}</span>${r.ex?'<span class="tag">Example</span>':''}${stat}</div>
  <p>${esc(r.text)}</p>${r.photo?`<img src="${r.photo}" alt="Photo attached to the report">`:''}
  <div class="rep-f"><span>${esc(r.place)} · ${ago(r.t)}</span><span class="rep-btns"><button type="button" data-same="${r.id}" aria-pressed="${mine}">${mine?'Confirmed':'Same here'} · ${n}</button><button type="button" data-copy="${r.id}">Copy for authority</button>${CAN_EDIT&&r.shared?`<button type="button" data-del="${r.id}" aria-label="Delete report">Delete</button>`:''}</span></div></article>`;
}
function renderChip(){
  const p=state.selected,w=weather(p);
  $('#chip').innerHTML=`${icon(w.cond,w.night)}<div style="min-width:0"><b>${esc(p.name)}</b><span>${w.cond} · AQI ${w.aqi} · ${fW(w.wind)}</span></div><span class="t">${fT(w.temp)}</span>`;
}
