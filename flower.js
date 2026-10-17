(()=>{
 const stage=document.querySelector('.flower-stage');if(!stage)return;
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 const mobile=window.matchMedia('(max-width: 700px), (pointer: coarse)');
 const toggle=stage.querySelector('.flower-toggle');
 const controls=stage.querySelector('.petal-controls');
 const labels=[...stage.querySelectorAll('.petal-label')];
 const topicList=document.querySelector('.flower-topics');
 const topicButtons=[...topicList.querySelectorAll('.flower-topic')];
 const collapse=document.querySelector('.flower-collapse');
 const hint=document.querySelector('.flower-hint');
 const story=document.querySelector('#flower-story');
 const heading=story.querySelector('h2'),copy=story.querySelector('.story-copy'),index=story.querySelector('.story-index'),link=story.querySelector('.story-contact');
 const content=window.zemskovFlowerContent||{};
 let expanded=false,readyTimer=null,swapTimer=null,storyAnimation=null;
 let mobileArtPromise=null;
 function prepareMobileArt(){
   if(!mobile.matches){stage.classList.remove('use-raster');return Promise.resolve()}
   if(!mobileArtPromise)mobileArtPromise=Promise.all([...stage.querySelectorAll('.flower-fast-art img')].map(async image=>{
     image.src=image.dataset.src;
     await image.decode();
   })).then(()=>{if(mobile.matches)stage.classList.add('use-raster')}).catch(()=>{/* The vector remains available without expensive mobile filters. */});
   return mobileArtPromise.then(()=>{if(mobile.matches&&[...stage.querySelectorAll('.flower-fast-art img')].every(image=>image.complete&&image.naturalWidth))stage.classList.add('use-raster')});
 }
 prepareMobileArt();mobile.addEventListener('change',prepareMobileArt);
 function setTopicsReady(ready){
   topicList.hidden=false;topicList.setAttribute('aria-hidden',String(!ready));topicList.inert=!ready;
   topicButtons.forEach(button=>{button.disabled=!ready;if(!ready)button.setAttribute('aria-pressed','false')});
 }
 const petals=new Map([...stage.querySelectorAll('[data-petal]')].map(petal=>[petal.dataset.petal,petal]));
 function cancelStoryTransition(){clearTimeout(swapTimer);storyAnimation?.cancel();storyAnimation=null;story.style.opacity='';}
 function renderIntro(open){
   cancelStoryTransition();index.hidden=true;link.hidden=true;link.removeAttribute('href');
   heading.innerHTML=open?'Я Никита.':'Давайте познакомимся.';
   copy.textContent=open?'Выберите лепесток — расскажу немного о себе.':'Раскройте цветок и выберите тему.';
   copy.classList.remove('is-pending');
 }
 function setExpanded(open){
   clearTimeout(readyTimer);expanded=open;stage.dataset.state=open?'opening':'closing';stage.classList.add('is-animating');
   stage.classList.toggle('is-open',open);stage.classList.remove('is-ready');
   toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Свернуть цветок':'Раскрыть цветок: давайте познакомимся');
   toggle.querySelector('span').textContent=open?'Свернуть цветок':'Раскрыть цветок';
   controls.inert=true;labels.forEach(button=>{button.disabled=true;button.setAttribute('aria-pressed','false')});
   setTopicsReady(false);
   petals.forEach(petal=>petal.classList.remove('is-selected','is-hovered'));
   collapse.hidden=!open;hint.textContent=open?'Цветок раскрывается…':'Нажмите на бутон';renderIntro(open);
   const complete=()=>{
     stage.dataset.state=open?'open':'closed';stage.classList.remove('is-animating');
     if(open){stage.classList.add('is-ready');controls.inert=false;labels.forEach(button=>button.disabled=false);setTopicsReady(true);hint.textContent='Выберите лепесток'}
   };
   if(motion.matches)complete();else readyTimer=setTimeout(complete,mobile.matches?(open?1100:680):(open?1430:800));
 }
 let preparing=false;
 toggle.addEventListener('click',async()=>{if(preparing)return;preparing=true;try{if(mobile.matches)await prepareMobileArt();setExpanded(!expanded)}finally{preparing=false}});
 collapse.addEventListener('click',()=>{toggle.focus({preventScroll:true});setExpanded(false)});
 labels.forEach((button,position)=>{
   const topic=button.dataset.flowerTopic;
   button.addEventListener('pointerenter',()=>petals.get(topic)?.classList.add('is-hovered'));
   button.addEventListener('pointerleave',()=>petals.get(topic)?.classList.remove('is-hovered'));
   button.addEventListener('focus',()=>petals.get(topic)?.classList.add('is-hovered'));
   button.addEventListener('blur',()=>petals.get(topic)?.classList.remove('is-hovered'));
   button.addEventListener('click',()=>{
     if(!expanded||button.disabled)return;
     labels.forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
     topicButtons.forEach(other=>other.setAttribute('aria-pressed',String(other.dataset.flowerLegend===topic)));
     petals.forEach((petal,key)=>petal.classList.toggle('is-selected',key===topic));
     cancelStoryTransition();
     const data=content[topic]||{};
     const update=()=>{
       index.textContent=`0${position+1} / 06`;index.hidden=false;
       heading.textContent=data.title||button.getAttribute('aria-label').replace(/^0\d\.\s*/, '');
       const pending=!data.text?.trim();copy.textContent=pending?'Этот текст появится после уточнения личных сведений.':data.text;copy.classList.toggle('is-pending',pending);
       const safeLink=typeof data.href==='string'&&/^(https:\/\/|mailto:|tel:)/i.test(data.href);
       link.hidden=!safeLink;
       if(safeLink){link.href=data.href;link.textContent=data.linkText||'Написать мне'}else link.removeAttribute('href');
       if(!motion.matches)storyAnimation=story.animate([{opacity:0,transform:'translate3d(0,4px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{duration:mobile.matches?300:420,easing:'cubic-bezier(.22,1,.36,1)'});
     };
     if(motion.matches)update();else{storyAnimation=story.animate([{opacity:1},{opacity:0}],{duration:120,fill:'forwards'});swapTimer=setTimeout(()=>{storyAnimation?.cancel();update()},120)}
   });
   button.addEventListener('keydown',event=>{
     let destination;
     if(event.key==='ArrowRight'||event.key==='ArrowDown')destination=(position+1)%labels.length;
     if(event.key==='ArrowLeft'||event.key==='ArrowUp')destination=(position+labels.length-1)%labels.length;
     if(event.key==='Home')destination=0;if(event.key==='End')destination=labels.length-1;
     if(event.key==='Escape'){event.preventDefault();toggle.focus({preventScroll:true});setExpanded(false);return}
     if(destination!==undefined){event.preventDefault();labels[destination].focus({preventScroll:true})}
   });
 });
 topicButtons.forEach(button=>{
   const topic=button.dataset.flowerLegend;
   button.addEventListener('click',()=>labels.find(label=>label.dataset.flowerTopic===topic)?.click());
   for(const event of ['pointerenter','focus'])button.addEventListener(event,()=>petals.get(topic)?.classList.add('is-hovered'));
   for(const event of ['pointerleave','blur'])button.addEventListener(event,()=>petals.get(topic)?.classList.remove('is-hovered'));
   button.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();toggle.focus({preventScroll:true});setExpanded(false)}});
 });
 motion.addEventListener('change',()=>{if(motion.matches){clearTimeout(readyTimer);stage.classList.remove('is-animating');if(expanded){stage.dataset.state='open';stage.classList.add('is-ready');controls.inert=false;labels.forEach(button=>button.disabled=false);setTopicsReady(true);hint.textContent='Выберите лепесток'}else stage.dataset.state='closed'}});
})();
