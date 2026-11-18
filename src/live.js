/* Live data from Open-Meteo (forecast + air quality). Falls back to the built-in model when a request fails. */
const LIVE=new Map(),LIVE_TTL=20*60000,LS={ok:null,loading:0,t:0};
const WMO=c=>c===0||c===1?'Clear':c===2?'Partly cloudy':c===3?'Overcast':(c===45||c===48)?'Fog':((c>=51&&c<=57)||c===61||c===80)?'Light rain':(c===63||c===65||c===66||c===67||c===81||c===82)?'Rain':((c>=71&&c<=77)||c===85||c===86)?'Snow':c>=95?'Thunderstorm':'Partly cloudy';
const FC_CUR='temperature_2m,apparent_temperature,relative_humidity_2m,is_day,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,dew_point_2m';
const FC_HR='temperature_2m,apparent_temperature,relative_humidity_2m,is_day,weather_code,cloud_cover,precipitation_probability,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility,uv_index,dew_point_2m';
const FC_DAY='weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max';
const AQ_V='us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide';
async function getJSON(url){
  const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),15000);
  try{const r=await fetch(url,{signal:ac.signal});if(!r.ok)throw new Error('HTTP '+r.status);return await r.json()}finally{clearTimeout(tm)}
}
const asArr=j=>Array.isArray(j)?j:[j];
async function loadLive(places){
  const todo=[],seen=new Set();
  for(const p of places){if(seen.has(p.key))continue;seen.add(p.key);const L=LIVE.get(p.key);if(L&&Date.now()-L.t<LIVE_TTL)continue;if(L&&L.pend)continue;todo.push(p)}
  if(!todo.length)return;
  for(let i=0;i<todo.length;i+=40){
    const grp=todo.slice(i,i+40);grp.forEach(p=>LIVE.set(p.key,Object.assign(LIVE.get(p.key)||{},{pend:1})));
    const la=grp.map(p=>p.lat.toFixed(3)).join(','),lo=grp.map(p=>p.lon.toFixed(3)).join(',');
    const base=`latitude=${la}&longitude=${lo}&timezone=auto&timeformat=unixtime`;
    LS.loading++;renderLiveBadge();
    try{
      const [fc,aq]=await Promise.all([
        getJSON(`https://api.open-meteo.com/v1/forecast?${base}&current=${FC_CUR}&hourly=${FC_HR}&daily=${FC_DAY}&forecast_days=7&forecast_hours=72`),
        getJSON(`https://air-quality-api.open-meteo.com/v1/air-quality?${base}&current=${AQ_V}&hourly=${AQ_V}&forecast_hours=72`).catch(()=>null)
      ]);
      const F=asArr(fc),A=aq?asArr(aq):[];
      grp.forEach((p,k)=>{const f=F[k];if(!f||!f.hourly||!f.hourly.time){LIVE.delete(p.key);return}
        const a=A[k];LIVE.set(p.key,{t:Date.now(),off:f.utc_offset_seconds||0,tzn:f.timezone_abbreviation,c:f.current||null,h:f.hourly,d:f.daily||null,a:a&&a.hourly&&a.hourly.time?{c:a.current||null,h:a.hourly}:null})});
      LS.ok=true;LS.t=Date.now();
    }catch(e){grp.forEach(p=>LIVE.delete(p.key));if(LS.ok!==true)LS.ok=false}
    LS.loading--;liveVer++;renderLiveBadge();
    if(typeof liveChanged==='function')liveChanged();
  }
}
function applyLive(p,w,hrs,t0){
  const L=LIVE.get(p.key);if(!L||!L.h||Date.now()-L.t>90*60000)return w;
  const ts=Math.floor(t0/1000),H=L.h,n=H.time.length,i=clamp(Math.floor((ts-H.time[0])/3600),0,n-1),now0=hrs===0&&L.c;
  const g=k=>{const v=now0&&L.c[k]!=null?L.c[k]:(H[k]?H[k][i]:null);return v==null?null:v};
  const set=(key,v,f)=>{if(v!=null&&!Number.isNaN(v))w[key]=f?f(v):v};
  set('temp',g('temperature_2m'));set('feels',g('apparent_temperature'));set('hum',g('relative_humidity_2m'),Math.round);
  set('cloud',g('cloud_cover'),Math.round);set('wind',g('wind_speed_10m'),Math.round);set('dir',g('wind_direction_10m'),Math.round);set('gust',g('wind_gusts_10m'),Math.round);
  set('dew',g('dew_point_2m'));set('cond',g('weather_code'),WMO);set('uv',g('uv_index'));
  if(now0&&L.c.pressure_msl!=null)w.pressure=Math.round(L.c.pressure_msl);
  const pp=H.precipitation_probability?H.precipitation_probability[i]:null;if(pp!=null)w.pop=pp;
  if(H.visibility&&H.visibility[i]!=null)w.vis=Math.max(.05,H.visibility[i]/1000);
  const dayf=g('is_day');if(dayf!=null)w.night=!dayf;
  const off=L.off;w.lt=(((ts+off)/3600)%24+24)%24;w.tzLabel='local time';
  const D=L.d;
  if(D&&D.time){
    const j=clamp(Math.floor((ts-D.time[0])/86400),0,D.time.length-1);
    set('hi',D.temperature_2m_max[j]);set('lo',D.temperature_2m_min[j]);set('uvMax',D.uv_index_max[j]);
    const sr=D.sunrise[j],ss=D.sunset[j];
    if(sr&&ss){w.polar=null;w.sunrise=(((sr+off)/3600)%24+24)%24;w.sunset=(((ss+off)/3600)%24+24)%24;w.frac=clamp((ts-sr)/(ss-sr),-.08,1.08)}
    w.daily=D.time.map((t,k)=>({d:new Date((t+off)*1000).toLocaleDateString('en',{weekday:'short',timeZone:'UTC'}),cond:WMO(D.weather_code[k]),pop:D.precipitation_probability_max[k]!=null?D.precipitation_probability_max[k]:0,hi:D.temperature_2m_max[k],lo:D.temperature_2m_min[k]}));
  }
  const hh=[];for(let k=0;k<24&&i+k<n;k++){const v=H.temperature_2m[i+k];if(v!=null)hh.push({h:(w.lt+k)%24,t:v})}
  if(hh.length>12){w.hourly=hh;if(now0)w.hourly[0].t=w.temp}
  const A=L.a;
  if(A){const i2=clamp(Math.floor((ts-A.h.time[0])/3600),0,A.h.time.length-1),ga=k=>{const v=now0&&A.c&&A.c[k]!=null?A.c[k]:(A.h[k]?A.h[k][i2]:null);return v}
    const q=ga('us_aqi');if(q!=null){w.aqi=Math.round(q);set('pm25',ga('pm2_5'),Math.round);set('pm10',ga('pm10'),Math.round);set('o3',ga('ozone'),Math.round);set('no2',ga('nitrogen_dioxide'),Math.round);w.aqLive=true}}
  w.live=true;w.liveT=L.t;return w;
}
function renderLiveBadge(){
  const b=$('#livebadge');if(!b)return;
  b.dataset.s=LS.loading?'load':LS.ok===true?'on':LS.ok===false?'off':'idle';
  b.textContent=LS.loading?'Loading live data…':LS.ok===true?'Live data':LS.ok===false?'Modelled data':'Modelled data';
  b.title=LS.ok===false?'Live weather could not be reached from this page, so values are estimates.':LS.ok===true?'Live weather and air quality from Open-Meteo, refreshed every 20 minutes.':'';
}
function liveChanged(){if(state.selected)renderPanel(true);if(typeof renderChip==='function')renderChip()}
/* Load the biggest cities at start, then whatever is in view when zoomed in */
function wantLive(){const want=[];if(state.selected)want.push(state.selected);for(const p of pins){if(want.length>=40)break;if(!want.includes(p.c))want.push(p.c)}return want}
setInterval(()=>{if(!document.hidden)loadLive(wantLive())},2500);
