(()=>{
const stage=document.querySelector('.service-layers');if(!stage)return;
const scroller=stage.closest('.reading'),motion=matchMedia('(prefers-reduced-motion:reduce)');
let target=motion.matches?1:0,current=target,frame=0,measureFrame=0,last=0,visible=true;
function draw(){stage.style.setProperty('--spread',current.toFixed(4));stage.style.setProperty('--layer-label',Math.max(0,Math.min(1,(current-.15)/.6)).toFixed(4));}
function animate(now){frame=0;const delta=last?Math.min(50,now-last):16;last=now;current+=(target-current)*(1-Math.exp(-delta/105));if(Math.abs(target-current)<.001){current=target;last=0;}draw();if(current!==target&&visible&&!document.hidden)frame=requestAnimationFrame(animate);}
function measure(){measureFrame=0;if(stage.getClientRects().length===0)return;if(motion.matches){target=current=1;cancelAnimationFrame(frame);frame=0;draw();return;}
const box=stage.getBoundingClientRect(),root=scroller.getBoundingClientRect(),bottom=Math.min(innerHeight,root.bottom),top=Math.max(0,root.top);visible=box.bottom>top&&box.top<bottom;target=Math.max(0,Math.min(1,(bottom-box.top-box.height*1.05)/(box.height*.55)));
if(!visible){cancelAnimationFrame(frame);frame=0;current=target;last=0;draw();return;}if(!frame&&Math.abs(current-target)>.001)frame=requestAnimationFrame(animate);}
function queue(){if(!measureFrame)measureFrame=requestAnimationFrame(measure);}
window.addEventListener('scroll',queue,{passive:true});scroller.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue,{passive:true});window.addEventListener('nikita-service-change',queue);motion.addEventListener('change',queue);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else queue();});
new ResizeObserver(queue).observe(stage);draw();queue();
})();


