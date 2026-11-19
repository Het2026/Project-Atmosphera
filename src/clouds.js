/* Moving cloud layer: drifting noise, shaped by the cloud cover of the cities (live when available). Motion is accelerated and illustrative. */
const CN={W:360,H:181,d:null,cov:null,key:''};
function buildCloudNoise(){
  const W=CN.W,H=CN.H,d=new Float32Array(W*H),r=rng(4242);
  [[12,6,1],[24,12,.55],[48,24,.3],[96,48,.16]].forEach(([nx,ny,amp])=>{
    const lat=new Float32Array(nx*(ny+1));for(let i=0;i<lat.length;i++)lat[i]=r();
    for(let y=0;y<H;y++){const fy=y/(H-1)*ny,y0=Math.floor(fy),ty=fy-y0,sy=ty*ty*(3-2*ty),y1=Math.min(ny,y0+1);
      for(let x=0;x<W;x++){const fx=x/W*nx,x0=Math.floor(fx)%nx,tx=fx-Math.floor(fx),sx=tx*tx*(3-2*tx),x1=(x0+1)%nx;
        const a=lat[y0*nx+x0],b=lat[y0*nx+x1],c=lat[y1*nx+x0],e=lat[y1*nx+x1];
        d[y*W+x]+=amp*((a+(b-a)*sx)*(1-sy)+(c+(e-c)*sx)*sy)}}
  });
  let mn=1e9,mx=-1e9;for(const v of d){if(v<mn)mn=v;if(v>mx)mx=v}
  for(let i=0;i<d.length;i++)d[i]=(d[i]-mn)/(mx-mn);
  CN.d=d;
}
function cnSample(lon,lat){
  const W=CN.W,H=CN.H,x=((lon%360)+360)%360,y=clamp(lat+90,0,180),x0=Math.floor(x),y0=Math.min(H-2,Math.floor(y)),tx=x-x0,ty=y-y0,x1=(x0+1)%W,d=CN.d;
  return (d[y0*W+x0]*(1-tx)+d[y0*W+x1]*tx)*(1-ty)+(d[(y0+1)*W+x0]*(1-tx)+d[(y0+1)*W+x1]*tx)*ty;
}
const CSTEP=2,CSPRITE=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,"rgba(236,243,255,1)");gr.addColorStop(.5,"rgba(236,243,255,.5)");gr.addColorStop(1,"rgba(236,243,255,0)");g.fillStyle=gr;g.fillRect(0,0,64,64);return c})();
function cloudCover(){
  const key=liveVer+':'+state.hrs+':'+Math.floor(Date.now()/9e4);if(CN.key===key&&CN.cov)return CN.cov;
  const nx=Math.round(360/CSTEP),ny=Math.round(180/CSTEP)+1,cov=new Float32Array(nx*ny),pts=CITIES.map(c=>({lo:c.lon,la:c.lat,v:weather(c,state.hrs).cloud/100}));
  for(let j=0;j<ny;j++){const la=-90+j*CSTEP,cs=Math.max(.2,Math.cos(la*RAD));
    for(let i=0;i<nx;i++){const lo=-180+i*CSTEP;let sw=0,sv=0;
      for(const p of pts){let dl=Math.abs(p.lo-lo);if(dl>180)dl=360-dl;const dx=dl*cs,dy=p.la-la,d2=dx*dx+dy*dy+4;if(d2>3600)continue;const wgt=1/(d2*d2);sw+=wgt;sv+=wgt*p.v}
      cov[j*nx+i]=sw?sv/sw:.45}}
  CN.cov=cov;CN.key=key;return cov;
}
function drawClouds(now,r,cx,cy,sl,cl,l0){
  if(!CN.d)buildCloudNoise();
  const cov=cloudCover(),nx=Math.round(360/CSTEP),t=now/1000,rad=r*CSTEP*RAD*1.25,s1=t*1.3,s2=-t*.55;
  ctx.save();
  for(let la=-87;la<=87;la+=CSTEP){
    const sla=Math.sin(la*RAD),cla=Math.cos(la*RAD),j=Math.round((la+90)/CSTEP);
    for(let lo=-180;lo<180;lo+=CSTEP){
      const dot=sl*sla+cl*cla*Math.cos(lo*RAD-l0);if(dot<.02)continue;
      const xy=proj([lo,la]);if(!xy)continue;const x=xy[0],y=xy[1];
      if(x<-rad||x>W+rad||y<-rad||y>H+rad)continue;
      const n=cnSample(lo-s1,la)*.68+cnSample(lo-s2+90,la*.9)*.32,c=cov[j*nx+Math.round((lo+180)/CSTEP)%nx],th=1.02-c*.62-.1,a=clamp((n-th)/.2,0,1)*.62*(.3+.7*dot);
      if(a<.04)continue;
      ctx.globalAlpha=a;ctx.drawImage(CSPRITE,x-rad,y-rad,rad*2,rad*2);
    }
  }
  ctx.restore();
}
