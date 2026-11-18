/* Interaction: drag, pinch, wheel, keys, search, units, layers, report form */
const ptrs=new Map();let drag=null,pinch=null;
const rel=e=>{const b=gcv.getBoundingClientRect();return[e.clientX-b.left,e.clientY-b.top]};
const touch=()=>{state.lastInteract=performance.now();state.fly=null};
gcv.addEventListener('pointerdown',e=>{
  gcv.setPointerCapture(e.pointerId);const[x,y]=rel(e);ptrs.set(e.pointerId,{x,y});touch();$('#hint').classList.add('gone');
  if(ptrs.size===1){drag={sx:x,sy:y,lx:x,ly:y,moved:false};state.dragging=true;state.vx=state.vy=0;gcv.classList.add('dragging')}
  else if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),k:state.kT};drag=null}
});
gcv.addEventListener('pointermove',e=>{
  const[x,y]=rel(e);
  if(ptrs.has(e.pointerId))ptrs.set(e.pointerId,{x,y});
  if(pinch&&ptrs.size>=2){const[a,b]=[...ptrs.values()];state.kT=state.k=clamp(pinch.k*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d,1,KMAX);touch();return}
  if(drag){
    const dx=x-drag.lx,dy=y-drag.ly,s=1/(R*state.k)/RAD;
    if(Math.hypot(x-drag.sx,y-drag.sy)>4)drag.moved=true;
    if(drag.moved){state.lon0-=dx*s;state.lat0+=dy*s;state.vx=-dx*s;state.vy=dy*s;touch()}
    drag.lx=x;drag.ly=y;return;
  }
  if(e.pointerType==='mouse'){const h=pickPin(x,y,12);state.hover=h;gcv.classList.toggle('pointer',!!h)}
});
function endPtr(e){
  const[x,y]=rel(e);ptrs.delete(e.pointerId);
  if(pinch&&ptrs.size<2)pinch=null;
  if(drag&&ptrs.size===0){
    const d=drag;drag=null;state.dragging=false;gcv.classList.remove('dragging');
    if(!d.moved&&e.type==='pointerup'){
      state.vx=state.vy=0;
      const c=pickPin(x,y,16);
      if(c)select(c);else{const ll=pickPoint(x,y);if(ll)select(pointPlace(ll))}
    }
  }
}
gcv.addEventListener('pointerup',endPtr);
gcv.addEventListener('pointercancel',endPtr);
gcv.addEventListener('pointerleave',()=>{if(!state.dragging){state.hover=null;gcv.classList.remove('pointer')}});
gcv.addEventListener('wheel',e=>{e.preventDefault();touch();
  const f=Math.exp(-e.deltaY*.0018);
  if(f>1&&state.kT>1.5){const[x,y]=rel(e),ll=proj.invert([x,y]);if(ll&&isFinite(ll[0])){const a=Math.min(.22,(f-1)*3);state.lon0+=((ll[0]-state.lon0+540)%360-180)*a;state.lat0+=(ll[1]-state.lat0)*a;state.fly=null}}
  state.kT=clamp(state.kT*f,1,KMAX)},{passive:false});
stage.addEventListener('keydown',e=>{
  const st=10/state.k;let h=true;
  if(e.key==='ArrowLeft')state.lon0-=st;else if(e.key==='ArrowRight')state.lon0+=st;else if(e.key==='ArrowUp')state.lat0+=st;else if(e.key==='ArrowDown')state.lat0-=st;
  else if(e.key==='+'||e.key==='=')state.kT=clamp(state.kT*1.4,1,KMAX);else if(e.key==='-')state.kT=clamp(state.kT/1.4,1,KMAX);
  else h=false;
  if(h){e.preventDefault();touch()}
});
$('#b-in').onclick=()=>{touch();const nk=clamp(state.kT*1.6,1,KMAX),s=state.selected;if(s&&nk>3)flyTo(s.lon,s.lat,nk);else state.kT=nk};
$('#b-out').onclick=()=>{touch();state.kT=clamp(state.kT/1.6,1,KMAX)};
$('#b-reset').onclick=()=>{flyTo(state.lon0,18,1);setSpin(true);state.lastInteract=0};
$('#b-spin').onclick=()=>{setSpin(!state.spin);state.lastInteract=performance.now()};
$('#b-rep').onclick=e=>{state.showReports=!state.showReports;e.currentTarget.setAttribute('aria-pressed',String(state.showReports))};
$('#chip').onclick=()=>{$('#panel').scrollIntoView({behavior:'smooth',block:'start'})};
$('#layers').addEventListener('click',e=>{const b=e.target.closest('button[data-layer]');if(b)setLayer(b.dataset.layer)});

function setUnits(metric){U.metric=metric;$('#u-metric').setAttribute('aria-pressed',String(metric));$('#u-imp').setAttribute('aria-pressed',String(!metric));renderPanel();renderLegend()}
$('#u-metric').onclick=()=>setUnits(true);$('#u-imp').onclick=()=>setUnits(false);
$('#legend');

/* Search */
const q=$('#q'),resBox=$('#results');let resItems=[],resIdx=-1;
const coordRe=/^\s*(-?\d{1,2}(?:\.\d+)?)\s*[,\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/;
const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
function runSearch(){
  const v=norm(q.value.trim());resItems=[];
  if(v){
    const cm=q.value.match(coordRe);
    if(cm&&Math.abs(+cm[1])<=90&&Math.abs(+cm[2])<=180)resItems.push({coord:[+cm[2],+cm[1]],label:'Go to '+fLL(+cm[1],+cm[2]),sub:'coordinates'});
    const hits=CITIES.map(c=>{const n=norm(c.name),co=norm(c.country),rg=norm(c.region||'');return{c,s:n.startsWith(v)?0:n.includes(v)?1:rg.startsWith(v)?2:co.startsWith(v)?3:rg.includes(v)?4:co.includes(v)?5:9}}).filter(x=>x.s<9).sort((a,b)=>a.s-b.s||a.c.tier-b.c.tier||(b.c.pop||0)-(a.c.pop||0)).slice(0,10);
    hits.forEach(h=>resItems.push({c:h.c,label:h.c.name,sub:(h.c.region?h.c.region+', ':'')+h.c.country}));
  }
  resIdx=resItems.length?0:-1;
  resBox.innerHTML=resItems.map((r,i)=>`<li role="option" id="opt${i}" data-i="${i}" aria-selected="${i===resIdx}"><span>${esc(r.label)}</span><small>${esc(r.sub)}</small></li>`).join('')||(v?'<li style="cursor:default"><span>No match. Try a nearby city or type lat, lon.</span></li>':'');
  resBox.hidden=!v;q.setAttribute('aria-expanded',String(!!v));
}
function pickResult(i){
  const r=resItems[i];if(!r)return;
  if(r.c)select(r.c);else select(pointPlace(r.coord));
  q.value='';resBox.hidden=true;q.setAttribute('aria-expanded','false');q.blur();
}
q.addEventListener('input',runSearch);
q.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){if(!resItems.length)return;e.preventDefault();resIdx=(resIdx+(e.key==='ArrowDown'?1:-1)+resItems.length)%resItems.length;resBox.querySelectorAll('li').forEach((li,i)=>li.setAttribute('aria-selected',String(i===resIdx)))}
  else if(e.key==='Enter'){e.preventDefault();pickResult(Math.max(0,resIdx))}
  else if(e.key==='Escape'){q.value='';runSearch()}
});
resBox.addEventListener('mousedown',e=>{const li=e.target.closest('li[data-i]');if(li){e.preventDefault();pickResult(+li.dataset.i)}});
q.addEventListener('blur',()=>setTimeout(()=>{resBox.hidden=true},120));
q.addEventListener('focus',()=>{if(q.value)runSearch()});

/* Panel clicks: report button and "Same here" */
$('#panel').addEventListener('click',e=>{
  if(e.target.closest('#panel-report'))return openReport();
  const qk=e.target.closest('button[data-quick]');
  if(qk){const q=QUICK[+qk.dataset.quick],p=state.selected,now=Date.now();QLAST[p.key]=QLAST[p.key]||{};if(now-(QLAST[p.key][q.l]||0)<6e5){toast('You already sent that for '+p.name+' a moment ago.');return}QLAST[p.key][q.l]=now;
    postReport({place:p.name,lat:p.lat,lon:p.lon,cat:q.cat,sev:q.sev,text:'Quick report: '+q.l.toLowerCase()+' in '+p.name+' right now.',t:now,quick:1},false);return}
  if(e.target.closest('#open-feed')){openFeed();return}
  if(e.target.closest('#open-help')){openHelp();return}
  const go=e.target.closest('button[data-go]');if(go)return select(CITIES[+go.dataset.go]);
  const act=e.target.closest('button[data-act]');
  if(act){if(act.dataset.act==='save')toggleSaved(state.selected);else toggleCmp(state.selected);return}
  const sm=e.target.closest('button[data-same]');
  if(sm){
    const id=sm.dataset.same,r=REPORTS.find(x=>x.id===id);if(!r)return;
    if(r.shared&&DBH&&UID){
      const ref=DBH.doc('confirms/'+id+'__'+UID);
      (repMine(r)?ref.delete():ref.set({rid:id,uid:UID,t:Date.now()})).catch(()=>toast('Could not save your confirmation. Try again.'));
    }else{confirmed.has(id)?confirmed.delete(id):confirmed.add(id);renderPanel(true)}
    return;
  }
  const cp=e.target.closest('button[data-copy]');
  if(cp){
    const r=REPORTS.find(x=>x.id===cp.dataset.copy);if(!r)return;
    const txt=reportText(r)+'\n\n'+helpFor((nearestCity(r.lat,r.lon).c||{}).cc);
    (navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>toast('Copied. Paste it into your city helpline app, email or message.')).catch(()=>toast('Copy was blocked here. Select the report text and copy it manually.'));
    return;
  }
  const del=e.target.closest('button[data-del]');
  if(del&&DBH){const id=del.dataset.del;DBH.doc('reports/'+id).delete().then(()=>DBH.doc('status/'+id).delete()).catch(()=>toast('Could not delete that report.'));return}
});
$('#panel').addEventListener('change',e=>{
  const s=e.target.closest('select[data-status]');
  if(s&&DBH)DBH.doc('status/'+s.dataset.status).set({status:s.value}).catch(()=>toast('Only editors can change a report status.'));
});

/* Saved places popover and compare modal */
const savedPop=$('#saved-pop'),cmpModal=$('#cmpmodal');
$('#open-saved').onclick=e=>{e.stopPropagation();renderSaved();const open=savedPop.hidden;savedPop.hidden=!open;e.currentTarget.setAttribute('aria-expanded',String(open))};
document.addEventListener('click',e=>{if(!savedPop.hidden&&!e.target.closest('#saved-pop')&&!e.target.closest('#open-saved'))savedPop.hidden=true});
savedPop.addEventListener('click',e=>{
  const o=e.target.closest('button[data-open]'),x=e.target.closest('button[data-rm]');
  if(o){const p=resolveKey(o.dataset.open);if(p){savedPop.hidden=true;select(p)}}
  if(x){SAVED=SAVED.filter(k=>k!==x.dataset.rm);saveSaved();renderSaved();renderPanel(true)}
});
function openCmp(){$('#cmpbody').innerHTML=cmpHTML();cmpModal.hidden=false;$('#cmp-close').focus()}
$('#open-cmp').onclick=openCmp;
$('#cmp-close').onclick=()=>{cmpModal.hidden=true};
cmpModal.addEventListener('mousedown',e=>{if(e.target===cmpModal)cmpModal.hidden=true});
$('#cmpbody').addEventListener('click',e=>{const r=e.target.closest('button[data-cmp-rm]');if(r){state.cmp=state.cmp.filter(k=>k!==r.dataset.cmpRm);renderCmpBtn();renderPanel(true);if(state.cmp.length<1)cmpModal.hidden=true;else $('#cmpbody').innerHTML=cmpHTML()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){cmpModal.hidden=true;savedPop.hidden=true}});

/* Report form */
const modal=$('#modal'),form=$('#repform');let photoData=null,lastFocus=null;
$('#rep-cats').innerHTML=CATS.map((c,i)=>`<label><input type="radio" name="rcat" value="${c.id}"${i===0?' checked':''}>${catIcon(c.id)}<span>${c.l}</span></label>`).join('');
function sevUpdate(){const s=SEV[+$('#rep-sev').value-1];const o=$('#rep-sevout');o.textContent=s.l;o.style.color=s.c}
$('#rep-sev').addEventListener('input',sevUpdate);
$('#rep-desc').addEventListener('input',e=>{$('#rep-count').textContent=e.target.value.length+' / 280'});
$('#rep-photo').addEventListener('change',e=>{
  const f=e.target.files[0],th=$('#rep-thumb');photoData=null;th.hidden=true;
  if(!f)return;
  if(f.size>3e6){$('#rep-err').textContent='That photo is over 3 MB. Choose a smaller one.';e.target.value='';return}
  const rd=new FileReader();rd.onload=()=>{
    const im=new Image();im.onload=()=>{const s=Math.min(1,480/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);photoData=c.toDataURL('image/jpeg',.6);th.src=photoData;th.hidden=false;$('#rep-err').textContent=''};
    im.src=rd.result};rd.readAsDataURL(f);
});
function openReport(){
  lastFocus=document.activeElement;const p=state.selected;
  form.reset();photoData=null;$('#rep-thumb').hidden=true;$('#rep-err').textContent='';$('#rep-count').textContent='0 / 280';
  $('#rep-place').value=p.name;$('#rep-help').textContent=helpFor(p.cc);sevUpdate();modal.hidden=false;$('#rep-cats input:checked').focus();
}
function closeReport(){modal.hidden=true;if(lastFocus&&lastFocus.focus)lastFocus.focus()}
$('#open-report').onclick=openReport;$('#rep-cancel').onclick=closeReport;
modal.addEventListener('mousedown',e=>{if(e.target===modal)closeReport()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeReport()});
let toastT;function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true},3400)}
function postReport(rep,fromForm){
  const place=rep.place;
  state.showReports=true;$('#b-rep').setAttribute('aria-pressed','true');
  const done=()=>{if(fromForm)closeReport()};
  const local=(m)=>{LOCAL.unshift(Object.assign({id:'u'+Date.now(),n:0,ex:0},rep));saveLocal();rebuildReports();done();renderPanel(true);toast(m)};
  if(DBH&&CAN_WRITE){
    DBH.collection('reports').add(rep).then(()=>{done();toast('Report posted for '+place+'. Everyone viewing this page can see it.')}).catch(()=>local('Saved on this device only. Ask the page owner to share it as Contributor so reports reach everyone.'));
  }else local('Report posted for '+place+'. It is saved in this browser and shows on your globe.');
}
form.addEventListener('submit',e=>{
  e.preventDefault();
  const text=$('#rep-desc').value.trim(),place=$('#rep-place').value.trim()||state.selected.name;
  if(text.length<10){$('#rep-err').textContent='Describe what you see in at least 10 characters so others can act on it.';$('#rep-desc').focus();return}
  const p=state.selected;
  const rep={place,lat:p.lat,lon:p.lon,cat:form.rcat.value,sev:+$('#rep-sev').value,text,t:Date.now()};
  if(photoData&&photoData.length<200000)rep.photo=photoData;
  postReport(rep,true);
});

const QLAST={};
const feedModal=$('#feedmodal'),helpModal=$('#helpmodal');let feedCat='';
function renderFeed(){$('#feedchips').innerHTML=['',...CATS.map(c=>c.id)].map(id=>`<button type="button" aria-pressed="${feedCat===id}" data-fc="${id}">${id?catById(id).l:'All'}</button>`).join('');$('#feedlist').innerHTML=feedHTML(feedCat)}
function openFeed(){renderFeed();feedModal.hidden=false;$('#feed-close').focus()}
function openHelp(){$('#helplist').innerHTML=helpListHTML('');$('#helpq').value='';helpModal.hidden=false;$('#helpq').focus()}
$('#feed-close').onclick=()=>{feedModal.hidden=true};$('#help-close').onclick=()=>{helpModal.hidden=true};
$('#feedchips').addEventListener('click',e=>{const b=e.target.closest('[data-fc]');if(!b)return;feedCat=b.dataset.fc;renderFeed()});
$('#feedlist').addEventListener('click',e=>{const b=e.target.closest('[data-feed]');if(!b)return;const r=REPORTS.find(x=>x.id===b.dataset.feed);if(!r)return;feedModal.hidden=true;const n=nearestCity(r.lat,r.lon).c;if(n)select(n)});
$('#helpq').addEventListener('input',e=>{$('#helplist').innerHTML=helpListHTML(e.target.value)});
[feedModal,helpModal].forEach(m=>m.addEventListener('mousedown',e=>{if(e.target===m)m.hidden=true}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){feedModal.hidden=true;helpModal.hidden=true}});
$('#open-help-top').onclick=openHelp;
/* Boot: Pune selected, globe turned to show South Asia while it spins */
setLayer('temp');setSpin(!matchMedia('(prefers-reduced-motion: reduce)').matches);
state.selected=CITIES.find(c=>c.name==='Pune');state.lon0=40;state.lat0=18;
rebuildReports();renderSaved();renderCmpBtn();updHrs();
if(!fromHash())renderPanel();
resize();requestAnimationFrame(frame);
renderLiveBadge();initShared();
