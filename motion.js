(()=>{
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const easing='cubic-bezier(.22,1,.36,1)';
 document.addEventListener('click',event=>{
  const target=event.target.closest('button,a.intro-link,a.package-link,summary');
  if(!target||target.disabled||reduced.matches||target.classList.contains('callout')&&!matchMedia('(max-width:700px)').matches)return;
  target.getAnimations().filter(animation=>animation.id==='bubble-press').forEach(animation=>animation.cancel());
  target.animate([{scale:'1 1'},{scale:'.975 1.04',offset:.28},{scale:'1.012 .99',offset:.58},{scale:'1 1'}],{id:'bubble-press',duration:620,easing});
  const orb=target.closest('.service-list article');
  if(orb){orb.getAnimations().filter(animation=>animation.id==='orb-press').forEach(animation=>animation.cancel());const base=getComputedStyle(orb).transform,transform=base==='none'?'':base;orb.animate([{transform},{transform:transform+' scale(.987,1.016)',offset:.3},{transform}],{id:'orb-press',duration:760,easing});}
 });
 const targets=[...document.querySelectorAll('.section-intro,.faq-layout>h2,.request-intro')];
 if(!reduced.matches&&'IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;entry.target.classList.remove('soft-waiting');entry.target.classList.add('soft-arrived');observer.unobserve(entry.target)}},{threshold:.08});
  targets.forEach(target=>{target.classList.add('soft-waiting');observer.observe(target)});
  reduced.addEventListener('change',()=>{if(reduced.matches){observer.disconnect();targets.forEach(target=>target.classList.remove('soft-waiting','soft-arrived'))}});
 }
})();
