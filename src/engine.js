const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const RAD=Math.PI/180;
const regionName=(()=>{try{const d=new Intl.DisplayNames(['en'],{type:'region'});return cc=>d.of(cc)||cc}catch(e){return cc=>cc}})();
const CITIES=CITY_RAW.trim().split('\n').map((l,i)=>{const [name,cc,lat,lon,tier]=l.split('|');return {id:i,name,cc,country:regionName(cc),lat:+lat,lon:+lon,tier:+tier,key:name,la:+lat*RAD,lo:+lon*RAD}});

/* Append India, USA and Canada places, attach region, population, elevation and time zone */
CITY_X.trim().split('\n').forEach(l=>{
  const [name,cc,lat,lon,region,pop,alt]=l.split('|');
  const p=+pop,lim=cc==='IN'?1000:cc==='US'?900:700;
  CITIES.push({id:CITIES.length,name,cc,country:regionName(cc),lat:+lat,lon:+lon,tier:p>=lim?3:4,key:name,la:+lat*RAD,lo:+lon*RAD,region,pop:p});
  ALT[name]=+alt;
});
for(const c of CITIES){
  if(INFO[c.name]){c.region=INFO[c.name][0];c.pop=INFO[c.name][1]}
  const tz=(c.region&&TZ_REGION[c.region]&&(c.cc==='US'||c.cc==='CA'))?TZ_REGION[c.region]:TZ_CC[c.cc];
  if(tz){c.tz=tz[0];c.tzName=tz[1]+' · UTC'+(tz[0]<0?'−':'+')+Math.floor(Math.abs(tz[0]))+(Math.abs(tz[0])%1?':'+String(Math.round(Math.abs(tz[0])%1*60)).padStart(2,'0'):'')}
}

function hash(s){let h=2166136261;s=String(s);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){let s=seed>>>0;return()=>(s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296}
function km(a,b){const s=Math.sin((b.lat-a.lat)*RAD/2)**2+Math.cos(a.lat*RAD)*Math.cos(b.lat*RAD)*Math.sin((b.lon-a.lon)*RAD/2)**2;return 12742*Math.asin(Math.sqrt(s))}

/* Demo weather model: climate by latitude, altitude and season, plus a daily seeded variation.
   It is not live data. Same place + same day always gives the same numbers. */
let liveVer=0;
function weather(p,hrs){
  hrs=hrs||0;
  const t0=Date.now()+hrs*36e5, nowD=new Date(t0), bucket=Math.floor(t0/600000);
  p._wc=p._wc||{};
  if(p._wc[hrs]&&p._wc[hrs].b===bucket&&p._wc[hrs].v===liveVer)return p._wc[hrs].w;
  const day=Math.floor(nowD/86400000), r=rng(hash(p.key+'|'+day)), rb=rng(hash(p.key+'|b'+Math.floor(t0/216e5)));
  const alt=ALT[p.name]||0, dry=DRY.has(p.name);
  const dec=-15.5*RAD, latR=p.lat*RAD;
  const d=Math.abs(p.lat+6)*RAD;
  const Tm=29-38*Math.pow(1-Math.cos(d),0.9)-alt/1000*6.5+(r()-.5)*6;
  const amp=3.5+r()*2.5+(dry?4:0)+(alt>2000?2:0);
  const utcH=nowD.getUTCHours()+nowD.getUTCMinutes()/60;
  const solarOff=p.lon/15,tzv=p.tz!=null?p.tz:solarOff,off=tzv-solarOff;
  const ls=((utcH+solarOff)%24+24)%24, lt=((utcH+tzv)%24+24)%24;
  const tAt=h=>Tm+amp*Math.sin(2*Math.PI*(h-9)/24);
  const hum=clamp(Math.round(62+(20-Math.abs(p.lat))*.5+(r()-.5)*40-(dry?28:0)-amp*1.2),18,97);
  const cr=rb(), aqiBase=POLL[p.name]!=null?POLL[p.name]:(p.aqiBase!=null?p.aqiBase:16+r()*50);
  const aqi=Math.round(aqiBase*(.85+rb()*.3));
  let cond,cloud,pop;
  if(dry&&cr<.7){cond='Clear';cloud=8;pop=0}
  else if(cr<.26){cond='Clear';cloud=10;pop=2}
  else if(cr<.5){cond='Partly cloudy';cloud=40;pop=8}
  else if(cr<.7){cond='Overcast';cloud=85;pop=20}
  else if(cr<.88){cond=Tm<1?'Snow':'Light rain';cloud=90;pop=65}
  else{cond=Tm<1?'Snow':(Tm>18?'Thunderstorm':'Rain');cloud=95;pop=85}
  if(aqi>170&&cr<.6){cond='Haze';cloud=60;pop=3}
  else if(hum>88&&cr<.5&&Math.abs(Tm)<14){cond='Fog';cloud=100;pop=10}
  const wind=Math.round(5+rb()*22+(Math.abs(p.lat)>50?6:0)), dir=Math.round(rb()*359), gust=Math.round(wind*(1.3+rb()*.5));
  const cosH=-Math.tan(latR)*Math.tan(dec);
  let sunrise=null,sunset=null,polar=null,frac=null;
  if(cosH>1)polar='night';else if(cosH<-1)polar='day';else{const H=Math.acos(cosH)/RAD/15,sr=12-H,ss=12+H;sunrise=((sr+off)%24+24)%24;sunset=((ss+off)%24+24)%24;frac=clamp((ls-sr)/(ss-sr),-.08,1.08)}
  const sinE=h=>Math.sin(latR)*Math.sin(dec)+Math.cos(latR)*Math.cos(dec)*Math.cos((h-12)*15*RAD);
  const night=sinE(ls)<0;
  const uvAt=h=>Math.max(0,Math.round(sinE(h)*13*(1-cloud/160)*(1+alt/10000)*10)/10);
  let vis=10;
  if(cond==='Fog')vis=.6+r()*.8;else if(cond==='Haze')vis=Math.max(.8,6-aqi/60);else if(/rain|storm/i.test(cond))vis=6;else if(cond==='Snow')vis=3;
  vis=Math.min(vis,Math.max(.5,12-aqi/22));
  const temp=tAt(ls), rn=rng(hash(p.key+'h'+day));
  const hourly=[];for(let i=0;i<24;i++){hourly.push({h:(lt+i)%24,t:tAt(ls+i)+(rn()-.5)*1.2})}
  hourly[0].t=temp;
  const daily=[];
  for(let i=0;i<7;i++){
    const m=Tm+(r()-.5)*6, c=r(); let dc,dp;
    if(c<.3){dc='Clear';dp=3}else if(c<.55){dc='Partly cloudy';dp=10}else if(c<.75){dc='Overcast';dp=22}else if(c<.9){dc=m<1?'Snow':'Light rain';dp=60}else{dc=m<1?'Snow':(m>18?'Thunderstorm':'Rain');dp=82}
    if(i===0){dc=cond==='Haze'||cond==='Fog'?'Partly cloudy':cond;dp=pop}
    daily.push({d:new Date(nowD.getTime()+i*864e5).toLocaleDateString('en',{weekday:'short'}),cond:dc,pop:dp,hi:m+amp,lo:m-amp});
  }
  const w={temp,feels:temp+(temp>24?(hum-50)*.04:0)-(temp<12?wind*.12:0),hi:Tm+amp,lo:Tm-amp,cond,cloud,pop,hum,wind,dir,gust,aqi,
    pm25:Math.round(aqi*.42),pm10:Math.round(aqi*.42*1.7),o3:Math.round(20+r()*60),no2:Math.round(8+r()*40*Math.min(1.6,aqi/90)),
    pressure:Math.round(1013+(r()-.5)*26-alt*.11),vis,dew:temp-(100-hum)/5,uv:uvAt(ls),uvMax:uvAt(12),night,lt,tzLabel:p.tz!=null?'local time':'local solar time',frac,sunrise,sunset,polar,hourly,daily,alt};
  applyLive(p,w,hrs,t0);p._wc[hrs]={b:bucket,v:liveVer,w};return w;
}

/* Formatting, always from metric base values */
const U={metric:true};
const fT=c=>Math.round(U.metric?c:c*9/5+32)+'°';
const fTn=c=>Math.round(U.metric?c:c*9/5+32);
const fW=k=>U.metric?Math.round(k)+' km/h':Math.round(k*.621371)+' mph';
const fV=k=>U.metric?(k>=10?'10+':k.toFixed(1))+' km':(k*.621371>=6?'6+':(k*.621371).toFixed(1))+' mi';
const fP=h=>U.metric?Math.round(h)+' hPa':(h*.02953).toFixed(2)+' inHg';
function fClock(hf){if(hf==null)return '–';let h=Math.floor(hf)%24,m=Math.round((hf-Math.floor(hf))*60);if(m===60){m=0;h=(h+1)%24}const ap=h>=12?'PM':'AM';return ((h%12)||12)+':'+String(m).padStart(2,'0')+' '+ap}
function fHour(h){const x=Math.floor(h)%24;return ((x%12)||12)+(x>=12?'p':'a')}
function fLL(lat,lon){return Math.abs(lat).toFixed(2)+'°'+(lat>=0?'N':'S')+' '+Math.abs(lon).toFixed(2)+'°'+(lon>=0?'E':'W')}
const compass=d=>['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'][Math.round(d/22.5)%16];

function aqiCat(v){
  if(v<=50)return{l:'Good',c:'#3ddc97',tip:'Air is clean. Outdoor activity is fine for everyone.'};
  if(v<=100)return{l:'Moderate',c:'#ffd84d',tip:'Acceptable. Unusually sensitive people may notice effects.'};
  if(v<=150)return{l:'Unhealthy for sensitive groups',c:'#ff9f43',tip:'Children, older adults and people with asthma should limit long outdoor effort.'};
  if(v<=200)return{l:'Unhealthy',c:'#ff5c7a',tip:'Everyone may feel effects. Cut back on outdoor exercise and consider a mask.'};
  if(v<=300)return{l:'Very unhealthy',c:'#b58cff',tip:'Stay indoors where you can and keep windows closed.'};
  return{l:'Hazardous',c:'#c0305f',tip:'Health emergency conditions. Avoid going outside.'};
}
function uvCat(v){return v<3?'Low':v<6?'Moderate':v<8?'High':v<11?'Very high':'Extreme'}

/* Condition icons, 64x64 viewBox */
function icon(cond,night){
  const SUN='#ffb84a',CL='#cfd9f5',CL2='#8b9bc9',BL='#5bb8ff';
  const cloud=(f,x=0,y=0)=>`<path transform="translate(${x} ${y})" d="M20 46h26a9 9 0 0 0 1.5-17.9A14 14 0 0 0 20.5 24 11 11 0 0 0 20 46z" fill="${f}"/>`;
  const sun=(cx,cy,r)=>{let s=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${SUN}"/>`;for(let i=0;i<8;i++){const a=i*Math.PI/4,x1=cx+Math.cos(a)*(r+4),y1=cy+Math.sin(a)*(r+4),x2=cx+Math.cos(a)*(r+9),y2=cy+Math.sin(a)*(r+9);s+=`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${SUN}" stroke-width="3" stroke-linecap="round"/>`}return s};
  const moon=(x,y,s)=>`<path transform="translate(${x} ${y}) scale(${s})" d="M40 14a18 18 0 1 0 10 28 14 14 0 0 1-10-28z" fill="#e6ecff"/>`;
  const rain=`<g stroke="${BL}" stroke-width="3" stroke-linecap="round"><line x1="24" y1="50" x2="21" y2="58"/><line x1="33" y1="50" x2="30" y2="58"/><line x1="42" y1="50" x2="39" y2="58"/></g>`;
  let b='';
  switch(cond){
    case 'Clear':b=night?moon(-6,-2,1.15):sun(32,32,10);break;
    case 'Partly cloudy':b=(night?moon(-14,-12,.8):sun(24,22,8))+cloud(CL,2,2);break;
    case 'Overcast':b=cloud(CL2,-6,-6)+cloud(CL,2,2);break;
    case 'Light rain':case 'Rain':b=cloud(CL,0,-4)+rain;break;
    case 'Thunderstorm':b=cloud(CL2,0,-4)+`<path d="M34 40 26 52h7l-3 10 12-15h-7l3-7z" fill="${SUN}"/>`;break;
    case 'Snow':b=cloud(CL,0,-4)+`<g fill="#fff"><circle cx="24" cy="54" r="2.6"/><circle cx="33" cy="58" r="2.6"/><circle cx="42" cy="54" r="2.6"/></g>`;break;
    case 'Haze':b=`<g opacity=".55">${sun(32,26,9)}</g><g stroke="${CL2}" stroke-width="3" stroke-linecap="round"><line x1="12" y1="46" x2="52" y2="46"/><line x1="16" y1="53" x2="48" y2="53"/></g>`;break;
    case 'Fog':b=cloud(CL2,0,-8)+`<g stroke="${CL}" stroke-width="3" stroke-linecap="round"><line x1="12" y1="46" x2="52" y2="46"/><line x1="18" y1="53" x2="46" y2="53"/></g>`;break;
    default:b=cloud(CL)
  }
  return `<svg viewBox="0 0 64 64" aria-hidden="true">${b}</svg>`;
}

/* Report categories and icons (24px stroke icons) */
const CATS=[
 {id:'weather',l:'Weather',d:'M7 18h9a4 4 0 0 0 .6-7.96A5.5 5.5 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18z'},
 {id:'air',l:'Air quality',d:'M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7'},
 {id:'flood',l:'Flooding',d:'M3 10c2 0 2-2 4.5-2s2.5 2 4.5 2 2.5-2 4.5-2 2.5 2 4.5 2M3 16c2 0 2-2 4.5-2s2.5 2 4.5 2 2.5-2 4.5-2 2.5 2 4.5 2'},
 {id:'rain',l:'Rain',d:'M7 14h9a4 4 0 0 0 .6-7.96A5.5 5.5 0 0 0 6 5.5 4.3 4.3 0 0 0 7 14zM8 17l-1 3M12 17l-1 3M16 17l-1 3'},
 {id:'wind',l:'Wind',d:'M3 9h11a3 3 0 1 0-3-3M3 14h15a3 3 0 1 1-3 3'},
 {id:'clouds',l:'Clouds',d:'M7 18h9a4 4 0 0 0 .6-7.96A5.5 5.5 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18z'},
 {id:'storm',l:'Storm',d:'M7 14h9a4 4 0 0 0 .6-7.96A5.5 5.5 0 0 0 6 5.5 4.3 4.3 0 0 0 7 14zM12 14l-2 4h3l-2 4'},
 {id:'heat',l:'Temperature',d:'M10 14.5V5a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0z'},
 {id:'building',l:'Buildings',d:'M5 21V4h9v17M14 9h5v12M3 21h18M8 8h3M8 12h3M8 16h3'},
 {id:'road',l:'Roads',d:'M8 3 5 21M16 3l3 18M12 4v3M12 11v3M12 18v3'},
 {id:'water',l:'Water supply',d:'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z'},
 {id:'waste',l:'Waste',d:'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6'}
];
const catById=id=>CATS.find(c=>c.id===id)||CATS[0];
const catIcon=id=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${catById(id).d}"/></svg>`;
const SEV=[{l:'Minor',c:'#3ddc97'},{l:'Moderate',c:'#ffd84d'},{l:'Severe',c:'#ff9f43'},{l:'Critical',c:'#ff5c7a'}];
