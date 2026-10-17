const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
if(!reducedMotion.matches&&'IntersectionObserver' in window){
 document.documentElement.classList.add('motion-ready');
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target)}},{threshold:.08});
 document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));
}
