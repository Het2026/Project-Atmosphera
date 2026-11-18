/* 3D globe: orthographic projection drawn on canvas. Land outlines are hand-simplified for this prototype. */
function mkPoly(ring){let c=ring.concat([ring[0]]);if(d3.geoArea({type:'Polygon',coordinates:[c]})>2*Math.PI)c=c.slice().reverse();return[c]}
const LAND={type:'MultiPolygon',coordinates:LAND_POLYS.map(mkPoly)};
const LAKES={type:'MultiPolygon',coordinates:LAKE_POLYS.map(mkPoly)};
const SPHERE={type:'Sphere'};
const gcv=$('#globe'),ctx=gcv.getContext('2d'),scv=$('#stars'),sctx=scv.getContext('2d'),stage=$('#stage'),tip=$('#tip');
let W=0,H=0,dpr=1,R=300,BOT=100;
const proj=d3.geoOrthographic().clipAngle(90).precision(.6);
const gpath=d3.geoPath(proj,ctx);
const grat={};const gratFor=s=>grat[s]||(grat[s]=d3.geoGraticule().step([s,s])());

const tempScale=d3.scaleLinear().domain([-25,-5,8,18,28,36,45]).range(['#6f8cff','#4fb0ff','#5ee0c4','#c5ea6a','#ffc94a','#ff8a3d','#ff4b5c']).clamp(true);
const aqiScale=d3.scaleLinear().domain([0,50,100,150,200,300]).range(['#3ddc97','#3ddc97','#ffd84d','#ff9f43','#ff5c7a','#b58cff']).clamp(true);
const windScale=d3.scaleLinear().domain([0,15,30,50]).range(['#4fd0ff','#5ee0c4','#ffc94a','#ff5cc8']).clamp(true);
const LAYERS={
  temp:{name:'Temperature',lo:-25,hi:45,val:w=>w.temp,col:v=>tempScale(v),alpha:()=>.34,fmt:v=>fT(v)},
  aqi:{name:'Air quality (US AQI)',lo:0,hi:300,val:w=>w.aqi,col:v=>aqiScale(v),alpha:()=>.4,fmt:v=>String(Math.round(v))},
  wind:{name:'Wind speed',lo:0,hi:50,val:w=>w.wind,col:v=>windScale(v),alpha:()=>.26,fmt:v=>fW(v)},
  rain:{name:'Chance of rain',lo:0,hi:100,val:w=>w.pop,col:()=>'#5bb8ff',alpha:v=>.05+v/100*.5,fmt:v=>Math.round(v)+'%'},
  cloud:{name:'Cloud cover',lo:0,hi:100,val:w=>w.cloud,col:()=>'#e8eefc',alpha:v=>.04+v/100*.42,fmt:v=>Math.round(v)+'%'}
};
function rgba(c,a){const k=d3.color(c);k.opacity=a;return k.formatRgb()}
function renderLegend(){
  const L=LAYERS[state.layer],st=[];
  for(let i=0;i<=10;i++){const v=L.lo+(L.hi-L.lo)*i/10;st.push(state.layer==='rain'||state.layer==='cloud'?rgba(L.col(v),L.alpha(v)*1.6+.1):L.col(v))}
  $('#legend').innerHTML=`<p>${L.name}</p><div class="bar" style="background:linear-gradient(90deg,${st.join(',')})"></div><div class="lbl"><span>${L.fmt(L.lo)}</span><span>${L.fmt((L.lo+L.hi)/2)}</span><span>${L.fmt(L.hi)}${state.layer==='aqi'?'+':''}</span></div>`;
}
function setLayer(l){state.layer=l;$('#layers').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layer===l)));renderLegend()}

function drawStars(){
  sctx.setTransform(dpr,0,0,dpr,0,0);sctx.clearRect(0,0,W,H);
  const r=rng(7);for(let i=0;i<Math.round(W*H/2600);i++){const x=r()*W,y=r()*H,s=r();sctx.fillStyle=`rgba(${s>.8?'190,210,255':'255,255,255'},${.15+r()*.6})`;sctx.beginPath();sctx.arc(x,y,s>.93?1.3:.7,0,6.283);sctx.fill()}
}
function resize(){
  dpr=Math.min(2,window.devicePixelRatio||1);W=stage.clientWidth;H=stage.clientHeight;
  for(const c of [gcv,scv]){c.width=Math.round(W*dpr);c.height=Math.round(H*dpr)}
  BOT=window.innerWidth<=900?118:92;R=Math.min(W,H-BOT)*(window.innerWidth<=900?.47:.485);drawStars();
}
new ResizeObserver(resize).observe(stage);

let pins=[],lastTipId=-1;
const KMAX=48;
const showPinTier=k=>k>=3.6?4:k>=2.3?3:k>=1.25?2:1;
const showLabelTier=k=>k>=5?4:k>=3.2?3:k>=1.8?2:1;

function draw(now){
  const k=state.k,r=R*k,cx=W/2,cy=(H-BOT)/2+6,L=LAYERS[state.layer];
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  proj.translate([cx,cy]).scale(r).rotate([-state.lon0,-state.lat0]);
  // atmosphere
  let g=ctx.createRadialGradient(cx,cy,r*.97,cx,cy,r*1.2);
  g.addColorStop(0,'rgba(91,184,255,.5)');g.addColorStop(.35,'rgba(91,184,255,.16)');g.addColorStop(1,'rgba(91,184,255,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,r*1.2,0,6.283);ctx.fill();
  // ocean
  g=ctx.createRadialGradient(cx-r*.3,cy-r*.35,r*.05,cx,cy,r);
  g.addColorStop(0,'#17407a');g.addColorStop(.55,'#0d2750');g.addColorStop(1,'#050f26');
  ctx.beginPath();gpath(SPHERE);ctx.fillStyle=g;ctx.fill();
  // graticule
  const gs=k>32?.5:k>20?1:k>12?2:k>6?5:k>3?10:k>1.8?15:30;
  ctx.beginPath();gpath(gratFor(gs));ctx.strokeStyle='rgba(120,170,255,.13)';ctx.lineWidth=.7;ctx.stroke();
  // land
  ctx.beginPath();gpath(LAND);ctx.fillStyle='#245a74';ctx.fill();
  ctx.strokeStyle='rgba(140,220,230,.55)';ctx.lineWidth=1;ctx.stroke();
  ctx.beginPath();gpath(LAKES);ctx.fillStyle='#0d2750';ctx.fill();
  // night side from the real sun position
  const nd=new Date(Date.now()+state.hrs*36e5),utcH=nd.getUTCHours()+nd.getUTCMinutes()/60,sunLon=-(utcH-12)*15;
  const anti=[sunLon+180,15.5];
  [[98,.14],[92,.16],[88,.16]].forEach(([rad,a])=>{ctx.beginPath();gpath(d3.geoCircle().center(anti).radius(rad).precision(2)());ctx.fillStyle=`rgba(2,6,22,${a})`;ctx.fill()});
  // limb shading + rim
  g=ctx.createRadialGradient(cx-r*.25,cy-r*.3,r*.3,cx,cy,r);
  g.addColorStop(0,'rgba(255,255,255,.05)');g.addColorStop(.62,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,4,16,.55)');
  ctx.beginPath();gpath(SPHERE);ctx.fillStyle=g;ctx.fill();
  ctx.strokeStyle='rgba(150,205,255,.4)';ctx.lineWidth=1.2;ctx.stroke();

  // cities in view
  const sl=Math.sin(state.lat0*RAD),cl=Math.cos(state.lat0*RAD),l0=state.lon0*RAD,pt=showPinTier(k),lt=showLabelTier(k);
  pins=[];
  for(const c of CITIES){
    const dot=sl*Math.sin(c.la)+cl*Math.cos(c.la)*Math.cos(c.lo-l0);
    if(dot<.03||c.tier>pt&&c!==state.selected)continue;
    const xy=proj([c.lon,c.lat]);if(!xy)continue;
    if(xy[0]<-40||xy[0]>W+40||xy[1]<-40||xy[1]>H+40)continue;
    pins.push({c,x:xy[0],y:xy[1],dot});
  }
  const sf=R/300*Math.sqrt(k)*.8;
  // layer blobs
  ctx.save();
  for(const p of pins){
    const w=weather(p.c,state.hrs),v=L.val(w),base=[62,44,32,24][p.c.tier-1]*sf*(.45+.55*p.dot);
    const gr=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,base),col=L.col(v),a=L.alpha(v);
    gr.addColorStop(0,rgba(col,a));gr.addColorStop(1,rgba(col,0));
    ctx.fillStyle=gr;ctx.beginPath();ctx.arc(p.x,p.y,base,0,6.283);ctx.fill();
    if(state.layer==='wind'&&p.c.tier<=pt){
      const to=(w.dir+180)*RAD,len=(8+w.wind*.55)*Math.max(.7,sf*.9);
      ctx.strokeStyle=rgba(col,.9);ctx.lineWidth=1.6;ctx.lineCap='round';ctx.setLineDash([5,5]);ctx.lineDashOffset=-now*.02*(.4+w.wind/25);
      ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.sin(to)*len,p.y-Math.cos(to)*len);ctx.stroke();ctx.setLineDash([]);
    }
  }
  ctx.restore();
  // community report markers
  if(state.showReports){
    for(const rp of REPORTS){
      const dot=sl*Math.sin(rp.lat*RAD)+cl*Math.cos(rp.lat*RAD)*Math.cos(rp.lon*RAD-l0);if(dot<.05)continue;
      const xy=proj([rp.lon,rp.lat]);if(!xy)continue;
      const s=6+Math.min(3,Math.sqrt(k)),col=SEV[rp.sev-1].c,x=xy[0],y=xy[1]-s-4;
      ctx.fillStyle=col;ctx.strokeStyle='#050912';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x,y-s);ctx.lineTo(x+s*.95,y+s*.7);ctx.lineTo(x-s*.95,y+s*.7);ctx.closePath();ctx.stroke();ctx.fill();
      ctx.fillStyle='#050912';ctx.fillRect(x-.8,y-s*.3,1.6,s*.6);
    }
  }
  // pins
  const pulse=(Math.sin(now/340)+1)/2;
  for(const p of pins){
    const t=p.c.tier,rad=[4.4,3.6,3,2.5][t-1]+Math.min(1.5,k*.18),sel=p.c===state.selected;
    ctx.beginPath();ctx.arc(p.x,p.y,rad,0,6.283);ctx.fillStyle=sel?'#ffb84a':'#f4f7ff';ctx.fill();ctx.lineWidth=1.4;ctx.strokeStyle='#050912';ctx.stroke();
    if(sel){ctx.beginPath();ctx.arc(p.x,p.y,rad+5+pulse*7,0,6.283);ctx.strokeStyle=`rgba(255,184,74,${.8-pulse*.6})`;ctx.lineWidth=2;ctx.stroke()}
  }
  // selected free point
  const sp=state.selected;
  if(sp&&sp.isPoint){
    const dot=sl*Math.sin(sp.lat*RAD)+cl*Math.cos(sp.lat*RAD)*Math.cos(sp.lon*RAD-l0),xy=dot>.03&&proj([sp.lon,sp.lat]);
    if(xy){ctx.strokeStyle='#ffb84a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(xy[0],xy[1],6+pulse*5,0,6.283);ctx.stroke();ctx.fillStyle='#ffb84a';ctx.beginPath();ctx.arc(xy[0],xy[1],3,0,6.283);ctx.fill();sp._xy=xy}else sp._xy=null;
  }
  // labels with simple collision rejection
  ctx.font='500 11.5px "DM Sans",system-ui,sans-serif';ctx.textBaseline='middle';
  const boxes=[],order=pins.filter(p=>p.c.tier<=lt||p.c===state.selected||p.c===state.hover).sort((a,b)=>(b.c===state.selected)-(a.c===state.selected)||(b.c===state.hover)-(a.c===state.hover)||a.c.tier-b.c.tier);
  for(const p of order){
    const w=weather(p.c,state.hrs),txt=p.c.name,tt=fT(w.temp),tw=ctx.measureText(txt).width,t2=ctx.measureText(tt).width,bw=tw+t2+20,bh=18,bx=p.x+9,by=p.y-bh/2;
    if(bx+bw>W-4)continue;
    const force=p.c===state.selected||p.c===state.hover;
    if(!force&&boxes.some(b=>bx<b[0]+b[2]+3&&bx+bw+3>b[0]&&by<b[1]+b[3]+2&&by+bh+2>b[1]))continue;
    boxes.push([bx,by,bw,bh]);
    ctx.fillStyle='rgba(5,9,18,.72)';ctx.beginPath();ctx.roundRect(bx,by,bw,bh,9);ctx.fill();
    ctx.fillStyle=force?'#fff':'#dbe5ff';ctx.textAlign='left';ctx.fillText(txt,bx+8,p.y+.5);
    ctx.fillStyle='#ffb84a';ctx.fillText(tt,bx+tw+14,p.y+.5);
  }
  // hover tooltip
  if(state.hover&&!state.dragging){
    const hp=pins.find(p=>p.c===state.hover);
    if(hp){
      if(lastTipId!==hp.c.id+':'+state.hrs){const w=weather(hp.c,state.hrs);tip.innerHTML=`<b>${esc(hp.c.name)}</b> <span>${esc(hp.c.country)}</span><br><span>${w.cond} · ${fT(w.temp)} · AQI ${w.aqi} · ${fW(w.wind)}</span>`;lastTipId=hp.c.id+':'+state.hrs}
      tip.hidden=false;tip.style.left=Math.min(hp.x,W-250)+'px';tip.style.top=(hp.y+30)+'px';
    }else tip.hidden=true;
  }else{tip.hidden=true;lastTipId=-1}
  const span=Math.round(W*6371/r*Math.PI/Math.PI);$('#zoomread').textContent=k.toFixed(1)+'× · '+pins.length+' places · view ≈ '+(span>=100?Math.round(span/10)*10:span)+' km wide';
}

let last=performance.now();
function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  const f=state.fly;
  if(f){
    const kk=1-Math.exp(-dt*5);let dl=((f.lon-state.lon0+540)%360)-180;
    state.lon0+=dl*kk;state.lat0+=(f.lat-state.lat0)*kk;state.kT=f.k;state.k+=(f.k-state.k)*kk;
    if(Math.abs(dl)<.05&&Math.abs(f.lat-state.lat0)<.05&&Math.abs(f.k-state.k)<.015)state.fly=null;
  }else{
    state.k+=(state.kT-state.k)*(1-Math.exp(-dt*9));
    if(!state.dragging){
      if(Math.abs(state.vx)>.002||Math.abs(state.vy)>.002){state.lon0+=state.vx;state.lat0+=state.vy;state.vx*=.93;state.vy*=.93}
      else if(state.spin&&state.k<2.6&&now-state.lastInteract>1200)state.lon0+=5*dt;
    }
  }
  state.lon0=((state.lon0+540)%360)-180;state.lat0=clamp(state.lat0,-85,85);
  if(W>0)draw(now);
  requestAnimationFrame(frame);
}

function pickPin(x,y,maxD){let best=null,bd=maxD||14;for(const p of pins){const d=Math.hypot(p.x-x,p.y-y);if(d<bd){bd=d;best=p.c}}return best}
function pickPoint(x,y){
  const cx=W/2,cy=(H-BOT)/2+6,r=R*state.k;if(Math.hypot(x-cx,y-cy)>r)return null;
  const ll=proj.invert([x,y]);return ll&&isFinite(ll[0])&&isFinite(ll[1])?ll:null;
}
function nearestCity(lat,lon){let b=null,bd=1e9;for(const c of CITIES){const d=km({lat,lon},c);if(d<bd){bd=d;b=c}}return{c:b,d:bd}}
function pointPlace(ll){
  const lon=((ll[0]+540)%360)-180,lat=ll[1],n=nearestCity(lat,lon),land=d3.geoContains(LAND,[lon,lat])&&!d3.geoContains(LAKES,[lon,lat]);
  return{name:land?'Near '+n.c.name:'Open waters',country:Math.round(n.d).toLocaleString('en')+' km from '+n.c.name,lat,lon,tier:4,isPoint:true,key:'pt:'+lat.toFixed(1)+','+lon.toFixed(1),aqiBase:land?16+hash(lat.toFixed(1)+lon.toFixed(1))%40:8,cc:n.c.cc};
}
function flyTo(lon,lat,k){state.fly={lon,lat,k:clamp(k,1,KMAX)};state.vx=state.vy=0}
function setSpin(on){state.spin=on;const b=$('#b-spin');b.setAttribute('aria-pressed',String(on));b.innerHTML=on?'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>':'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';b.title=b.ariaLabel=on?'Pause auto-rotate':'Resume auto-rotate'}
function select(p,opt){
  state.selected=p;renderPanel();setHash(p);loadLive([p]);
  if(!opt||opt.fly!==false){flyTo(p.lon,p.lat,Math.max(state.kT,p.isPoint?2.4:[2.2,2.6,3.6,5][p.tier-1]));setSpin(false)}
}
