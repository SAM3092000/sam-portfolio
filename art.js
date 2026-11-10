/* Four illustrative motifs for the project cards. Numeric findings are shown in the lab. */
(() => {
  const strokes={contour:'#786299',airpaths:'#467451',grid:'#88815a',rosette:'#ac745c'};
  function render(el){
    const w=el.clientWidth,h=el.clientHeight;if(!w||!h) return;
    const scale=Math.min(2,window.devicePixelRatio||1);
    el.width=Math.round(w*scale);el.height=Math.round(h*scale);
    const c=el.getContext('2d');if(!c)return;
    c.scale(w*scale/100,h*scale/75);c.lineWidth=1.05;c.strokeStyle=strokes[el.dataset.thumb];
    const stroke=pts=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke()};
    const tau=2*Math.PI;
    if(el.dataset.thumb==='contour'){
      for(let j=0;j<7;j++){
        const pts=[];for(let i=0;i<=95;i++){const t=tau*i/95,r=8+j*4+(1+j*.43)*Math.sin(3*t+.3);
          pts.push([55+Math.cos(t)*r*1.17,36+Math.sin(t)*r*.79]);}stroke(pts);
      }
    }else if(el.dataset.thumb==='airpaths'){
      for(let i=0;i<6;i++){c.beginPath();c.moveTo(3,53+i*3);c.bezierCurveTo(33,49+i*2,38,5+i,95,13+i*2);c.stroke();}
      c.beginPath();c.arc(57,25,3.3,0,tau);c.fillStyle=c.strokeStyle;c.fill();
    }else if(el.dataset.thumb==='grid'){
      for(let col=0;col<5;col++)for(let row=0;row<3;row++){
        const x=15+col*13, y=14+row*14;c.strokeRect(x,y,10,10);
        if((col+2*row)%4===0) stroke([[x+1,y+4],[x+4,y+7],[x+9,y+1]]);
      }
    }else{
      for(let j=0;j<4;j++){const pts=[];for(let i=0;i<=160;i++){const t=tau*i/160,r=14+3*j+5*Math.cos(8*t);pts.push([54+r*Math.cos(t),35+r*Math.sin(t)]);}stroke(pts);}
      c.beginPath();c.arc(54,35,5,0,tau);c.stroke();
    }
  }
  const observer=new ResizeObserver(entries=>entries.forEach(e=>render(e.target)));
  document.querySelectorAll('[data-thumb]').forEach(el=>observer.observe(el));
})();
