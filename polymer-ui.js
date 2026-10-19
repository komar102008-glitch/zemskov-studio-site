(()=>{
const sections=[
 ['Обо мне','Я Никита.','Создаю сайты для специалистов и небольшого бизнеса.','Меня вдохновляет творчество и возможность помогать другим людям.'],
 ['Создание сайтов','Создаю сайты.','Хочу помогать людям рассказывать о своих продуктах и продвигать их через сайт.','Для меня это способ соединить творчество с конкретной пользой.'],
 ['Как работаю','Сначала — ваша задача.','Для начала мне нужно понять, чем вы занимаетесь и что хотите показать на сайте.','Затем обсуждаем разделы, оформление и то, как посетитель сможет с вами связаться.'],
 ['Вдохновение','Творчество.','Меня вдохновляет возможность придумать что-то своё.','И помочь человеку показать продукт, в который он вкладывает силы.'],
 ['Идеи и планы','Что хочу создавать.','Хочу создавать сайты для людей, которым нужно рассказать о своём продукте.','Это направление, в котором я хочу работать.'],
 ['Портфолио','Мои работы — впереди.','Готовых проектов для портфолио пока нет.','Буду добавлять их сюда по мере появления.']
];
const body=document.body,root=document.querySelector('.experience'),canvas=document.querySelector('.model'),story=document.querySelector('.story'),menu=document.querySelector('.menu'),skip=document.querySelector('.skip'),replay=document.querySelector('.replay'),caption=document.querySelector('.scene-caption'),callouts=document.querySelector('.callouts');
const motion=matchMedia('(prefers-reduced-motion:reduce)');let api=null,skipped=false,lastFocus=null;const tags=[],buttons=[];
let menuExit=null;
function closeMenu(){if(!menu.open||menuExit)return;if(motion.matches){menu.close();return;}menuExit=menu.animate([{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(8px) scale(.985)'}],{duration:220,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'});menuExit.finished.then(()=>{menu.close();menuExit.cancel();menuExit=null},()=>{menuExit=null});}
menu.addEventListener('cancel',event=>{event.preventDefault();closeMenu()});menu.addEventListener('nikita-menu-dismiss',closeMenu);
const movement=document.createElement('button');movement.type='button';movement.className='text-button movement';movement.textContent='Остановить движение';movement.setAttribute('aria-pressed','false');replay.before(movement);let movementPaused=false;
movement.addEventListener('click',()=>{movementPaused=!movementPaused;api?.setAnimated(!movementPaused);movement.textContent=movementPaused?'Включить движение':'Остановить движение';movement.setAttribute('aria-pressed',String(movementPaused))});
function syncMovement(){movement.hidden=motion.matches}motion.addEventListener('change',syncMovement);syncMovement();
sections.forEach((section,i)=>{
 const tag=document.createElement('button');tag.type='button';tag.className='callout';tag.disabled=!matchMedia('(max-width:700px)').matches;tag.setAttribute('aria-label',section[0]);tag.setAttribute('aria-pressed','false');tag.setAttribute('aria-controls','section-title');tag.innerHTML=`<small>0${i+1}</small>${section[0]}`;tag.addEventListener('click',event=>show(i,tag,event.detail===0));
 tag.addEventListener('keydown',event=>{let next;if(['ArrowRight','ArrowDown'].includes(event.key))next=(i+1)%6;if(['ArrowLeft','ArrowUp'].includes(event.key))next=(i+5)%6;if(event.key==='Home')next=0;if(event.key==='End')next=5;if(next!==undefined){event.preventDefault();tags[next].focus()}});tags.push(tag);callouts.append(tag);
 for(const nav of document.querySelectorAll('.section-nav,.menu-nav')){const button=document.createElement('button');button.type='button';button.dataset.index=i;button.setAttribute('aria-pressed','false');button.innerHTML=nav.classList.contains('menu-nav')?`<span>0${i+1}</span>${section[0]}`:section[0];button.addEventListener('click',event=>{if(menu.open)closeMenu();show(i,button,event.detail===0)});nav.append(button);buttons.push(button)}
});
function complete(){body.classList.add('is-ready','has-image');skip.hidden=true;replay.disabled=!api;tags.forEach(tag=>tag.disabled=false);caption.textContent=api?(matchMedia('(max-width:700px)').matches?'Выберите раздел или лепесток.':'Выберите лепесток. Цветок можно повернуть.'):'Выберите раздел.'}
function finish(){const before=root.getBoundingClientRect().top,wasPinned=body.classList.contains('scroll-bloom');skipped=true;api?.finish();body.classList.remove('scroll-bloom');if(wasPinned){const delta=root.getBoundingClientRect().top-before;if(Math.abs(delta)>1)window.scrollBy({top:delta,behavior:'instant'});}complete()}
const storyText=story.querySelector('.story-text');let activeSection=-1,contentRevision=0,textAnimation=null;
function cancelTextTransition(){contentRevision++;textAnimation?.cancel();textAnimation=null;story.removeAttribute('aria-busy')}
function close(restore=false){cancelTextTransition();activeSection=-1;root.classList.remove('has-section');story.hidden=true;api?.select(-1);tags.forEach(tag=>{tag.classList.remove('is-selected');tag.setAttribute('aria-pressed','false')});buttons.forEach(button=>button.setAttribute('aria-pressed','false'));if(restore){if(lastFocus?.isConnected&&!lastFocus.closest('.story,.menu'))lastFocus.focus({preventScroll:true});else document.querySelector('.menu-toggle').focus({preventScroll:true})}}
async function show(i,origin=tags[i],keyboard=false){
 if(i===activeSection&&!story.hidden)return;
 const switching=!story.hidden;cancelTextTransition();const revision=contentRevision;activeSection=i;finish();lastFocus=origin;story.hidden=false;story.setAttribute('aria-busy','true');
 api?.select(i);tags.forEach((tag,j)=>{tag.classList.toggle('is-selected',j===i);tag.setAttribute('aria-pressed',String(i===j))});buttons.forEach(button=>button.setAttribute('aria-pressed',String(+button.dataset.index===i)));
 root.classList.add('has-section');
 if(switching&&!motion.matches){textAnimation=storyText.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-6px)'}],{duration:190,easing:'ease-in',fill:'forwards'});await textAnimation.finished.catch(()=>{});if(revision!==contentRevision)return}
 const section=sections[i];story.querySelector('.section-index').textContent=`0${i+1} / 06`;story.querySelector('h2').textContent=section[1];story.querySelector('.section-copy').textContent=section[2];story.querySelector('.section-detail').textContent=section[3];textAnimation?.cancel();story.removeAttribute('aria-busy');
 if(!motion.matches){textAnimation=storyText.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:460,easing:'cubic-bezier(.22,1,.36,1)'})}
 if(keyboard)story.querySelector('h2').focus({preventScroll:true});
 if(matchMedia('(max-width:1100px)').matches&&!switching)story.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'nearest'});
}
const bloomWrap=document.querySelector('.bloom-scroll');let scrollRequest=0;
function updateBloom(){scrollRequest=0;if(!api||skipped||motion.matches)return;const measured=root.offsetHeight+'px';if(bloomWrap.style.getPropertyValue('--bloom-height')!==measured)bloomWrap.style.setProperty('--bloom-height',measured);const y=window.scrollY;let start,distance;if(matchMedia('(min-width:1101px)').matches){start=bloomWrap.getBoundingClientRect().top+y;distance=Math.max(1,bloomWrap.offsetHeight-root.offsetHeight);}else{const visual=root.querySelector('.visual');start=Math.max(0,visual.getBoundingClientRect().top+y-innerHeight*.62);distance=Math.max(180,Math.min(360,innerHeight*.42));}api.setScrollProgress(Math.max(0,Math.min(1,(y-start)/distance)));}
function queueBloom(){if(!scrollRequest)scrollRequest=requestAnimationFrame(updateBloom)}
window.addEventListener('scroll',queueBloom,{passive:true});window.addEventListener('resize',queueBloom,{passive:true});window.addEventListener('nikita-theme-change',queueBloom);
function phaseChanged(phase){if(skipped||motion.matches)return;if(phase==='open'){complete();return;}body.classList.remove('is-ready');skip.hidden=false;replay.disabled=phase==='growing';tags.forEach(tag=>tag.disabled=!matchMedia('(max-width:700px)').matches);caption.textContent=phase==='growing'?'Цветок растёт.':'Прокрутите вниз — лепестки раскроются.';}
function play(restart=false){if(!api)return;skipped=false;close();bloomWrap.style.setProperty('--bloom-height',root.offsetHeight+'px');body.classList.add('scroll-bloom');body.classList.remove('is-ready');tags.forEach(tag=>tag.disabled=!matchMedia('(max-width:700px)').matches);skip.hidden=false;replay.disabled=true;caption.textContent='Цветок растёт.';api.play();if(restart)window.scrollTo({top:Math.max(0,bloomWrap.getBoundingClientRect().top+window.scrollY),behavior:'smooth'});queueBloom();}
canvas.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&!body.classList.contains('is-ready')){event.preventDefault();finish()}});
skip.addEventListener('click',finish);replay.addEventListener('click',()=>play(true));document.querySelector('.back').addEventListener('click',()=>close(true));document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();finish();close();window.scrollTo({top:0,behavior:motion.matches?'instant':'smooth'})});document.querySelector('.menu-toggle').addEventListener('click',()=>menu.showModal());document.querySelector('.menu-close').addEventListener('click',()=>closeMenu());menu.addEventListener('click',event=>{if(event.target===menu){const r=menu.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeMenu()}});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.open&&!story.hidden){event.preventDefault();close(true)}});motion.addEventListener('change',()=>{if(motion.matches)finish()});
import('./polymer-scene.js?v=scroll-1').then(async module=>{
 api=await module.createFlowerStage({canvas,onPhase:phaseChanged,onTypeSpread:value=>{if(matchMedia('(max-width:700px)').matches)root.style.setProperty('--word-shift',((1-value)*24).toFixed(2)+'px')},onComplete:complete,onSelect:i=>show(i),onLabels:points=>points.forEach((p,i)=>{tags[i].style.setProperty('--x',`${50+(p.x-50)*1.12}%`);tags[i].style.setProperty('--y',`${44+(p.y-44)*1.12}%`)})});
 body.classList.add('has-image','is-webgl');if(skipped||motion.matches||(location.hash&&location.hash!=='#'))finish();else play();
}).catch(error=>{canvas.dataset.error=String(error.message);console.error('3D flower unavailable:',error);complete();const positions=[[50,16],[80,28],[79,66],[49,78],[20,65],[20,29]];positions.forEach((p,i)=>{tags[i].style.setProperty('--x',`${p[0]}%`);tags[i].style.setProperty('--y',`${p[1]}%`)})});
})();




