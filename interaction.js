(()=>{
 const selectors='nav a,.text-link,.solid-button,.flower-collapse,.flower-topic,.open-case,footer>a:last-child';
 document.querySelectorAll(selectors).forEach(element=>element.classList.add('ui-button'));
 const timers=new WeakMap();
 function feedback(element){if(!element)return;clearTimeout(timers.get(element));element.classList.add('is-pressed');timers.set(element,setTimeout(()=>element.classList.remove('is-pressed'),420))}
 const target=event=>event.target instanceof Element?event.target.closest('.ui-button,.project,.petal-label'):null;
 document.addEventListener('pointerdown',event=>feedback(target(event)),{passive:true});
 document.addEventListener('pointercancel',event=>{const element=target(event);if(element){clearTimeout(timers.get(element));element.classList.remove('is-pressed')}},{passive:true});
 document.addEventListener('click',event=>feedback(target(event)));
 document.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')feedback(target(event))});
})();
