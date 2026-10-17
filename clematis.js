(()=>{
'use strict';
const sections=[
 {id:'about',label:'Обо мне',title:'Я Никита.',copy:'Создаю сайты под именем Zemskov studio.',detail:'Меня вдохновляет творчество и возможность помогать другим людям.'},
 {id:'practice',label:'Что делаю',title:'Создаю сайты.',copy:'Хочу помогать людям рассказывать о своих продуктах и продвигать их через сайт.',detail:'Для меня это способ соединить творчество с конкретной пользой.'},
 {id:'approach',label:'Подход',title:'Живой и понятный.',copy:'Таким я хочу видеть сайт. Мне важны содержание, внимание к деталям и плавная работа.',detail:'Хочу, чтобы за оформлением был виден человек и то, что он делает.'},
 {id:'inspiration',label:'Вдохновение',title:'Творчество.',copy:'Меня вдохновляет возможность придумать что-то своё.',detail:'И помочь человеку показать продукт, в который он вкладывает силы.'},
 {id:'plans',label:'Планы',title:'Помогать через дизайн.',copy:'Хочу создавать сайты для людей, которым нужно рассказать о своём продукте.',detail:'Это направление, в котором я хочу работать.'},
 {id:'work',label:'Работы',title:'Ещё впереди.',copy:'Готовых проектов для портфолио пока нет.',detail:'Буду добавлять их сюда по мере появления.'}
];
// Regions follow the six individual sepals in the photographic master, not a generic radial icon.
const paths=[
'M490 455C420 330 340 180 500 7C515 105 651 170 631 310L556 457Z',
'M540 451C650 350 790 225 970 245C895 302 930 409 799 474L569 500Z',
'M565 498C735 463 850 504 957 756C857 706 793 766 673 708L527 547Z',
'M490 523C591 634 644 736 550 914C517 810 353 757 397 629L455 516Z',
'M454 491C359 574 182 755 32 716C102 662 75 542 247 468L437 461Z',
'M458 441C282 451 123 324 43 187C142 239 228 171 338 248L494 424Z'];
const positions=[[50,16],[80,28],[79,66],[49,78],[20,65],[20,29]];
const body=document.body,root=document.querySelector('.experience'),poster=document.querySelector('.poster'),film=document.querySelector('.film'),map=document.querySelector('.petal-map'),callouts=document.querySelector('.callouts'),story=document.querySelector('.story'),menu=document.querySelector('.menu'),skip=document.querySelector('.skip'),replay=document.querySelector('.replay'),caption=document.querySelector('.scene-caption');
const motion=matchMedia('(prefers-reduced-motion:reduce)'),connection=navigator.connection;
let generation=0,playing=false,selected=-1,lastFocus=null,filmReady=false;
const targets=[],tags=[],navButtons=[];
for(let i=0;i<sections.length;i++){
 const section=sections[i],hit=document.createElementNS('http://www.w3.org/2000/svg','path');hit.setAttribute('d',paths[i]);hit.setAttribute('aria-hidden','true');hit.setAttribute('tabindex','-1');hit.setAttribute('aria-disabled','true');hit.setAttribute('aria-label',section.label);hit.setAttribute('aria-pressed','false');hit.setAttribute('aria-controls','section-title');hit.classList.add('petal-target');map.append(hit);targets.push(hit);
 const tag=document.createElement('button');tag.type='button';tag.disabled=true;tag.setAttribute('aria-label',section.label);tag.setAttribute('aria-controls','section-title');tag.setAttribute('aria-pressed','false');tag.className='callout';tag.style.setProperty('--x',`${positions[i][0]}%`);tag.style.setProperty('--y',`${positions[i][1]}%`);tag.innerHTML=`<small>0${i+1}</small>${section.label}`;callouts.append(tag);tags.push(tag);
 hit.addEventListener('click',event=>showSection(i,tag,event.detail===0));tag.addEventListener('click',event=>showSection(i,tag,event.detail===0));tag.addEventListener('keydown',event=>{
  
  let next;if(['ArrowRight','ArrowDown'].includes(event.key))next=(i+1)%6;if(['ArrowLeft','ArrowUp'].includes(event.key))next=(i+5)%6;if(event.key==='Home')next=0;if(event.key==='End')next=5;if(next!==undefined){event.preventDefault();tags[next].focus()}
 });
 for(const container of [document.querySelector('.section-nav'),document.querySelector('.menu-nav')]){
  const button=document.createElement('button');button.type='button';button.dataset.section=section.id;button.setAttribute('aria-pressed','false');if(container.classList.contains('menu-nav'))button.innerHTML=`<span>0${i+1}</span>${section.label}`;else button.textContent=section.label;
  button.addEventListener('click',event=>{if(menu.open)menu.close();showSection(i,button,event.detail===0)});container.append(button);navButtons.push(button);
 }
}
function setAccessible(value){targets.forEach(target=>target.setAttribute('aria-disabled',String(!value)));tags.forEach(tag=>tag.disabled=!value)}
function settle(){playing=false;film.pause();body.classList.remove('is-playing');body.classList.add('has-image','is-ready');setAccessible(true);skip.hidden=true;replay.disabled=false;caption.textContent='Выберите лепесток.';film.dataset.state='finished'}
function stopIntro(){generation++;settle()}
function closeSection(restore=false){root.classList.remove('has-section');story.hidden=true;selected=-1;targets.forEach(target=>target.setAttribute('aria-pressed','false'));tags.forEach(tag=>{tag.classList.remove('is-selected');tag.setAttribute('aria-pressed','false')});navButtons.forEach(button=>button.setAttribute('aria-pressed','false'));if(restore){if(lastFocus?.isConnected&&!lastFocus.closest('.story,.menu'))lastFocus.focus({preventScroll:true});else document.querySelector('.menu-toggle').focus({preventScroll:true})}}
function showSection(i,origin,keyboard=false){stopIntro();lastFocus=origin;selected=i;const section=sections[i];story.hidden=false;story.querySelector('.section-index').textContent=`0${i+1} / 06`;story.querySelector('h2').textContent=section.title;story.querySelector('.section-copy').textContent=section.copy;story.querySelector('.section-detail').textContent=section.detail;targets.forEach((target,j)=>target.setAttribute('aria-pressed',String(j===i)));tags.forEach((tag,j)=>{tag.classList.toggle('is-selected',j===i);tag.setAttribute('aria-pressed',String(j===i))});navButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.section===section.id)));requestAnimationFrame(()=>{root.classList.add('has-section');if(keyboard)story.querySelector('h2').focus({preventScroll:true});if(matchMedia('(max-width:700px)').matches)story.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'nearest'})})}
async function loadFilm(){if(filmReady)return true;film.src='clematis-opening.mp4';film.load();return new Promise(resolve=>{let done=false;const finish=value=>{if(done)return;done=true;clearTimeout(timeout);film.removeEventListener('canplaythrough',good);film.removeEventListener('error',bad);resolve(value)};const good=()=>{filmReady=true;finish(true)},bad=()=>finish(false),timeout=setTimeout(()=>finish(false),2200);film.addEventListener('canplaythrough',good,{once:true});film.addEventListener('error',bad,{once:true})})}
async function playIntro(manual=false){const ticket=++generation;closeSection();replay.disabled=true;const lightMode=motion.matches||connection?.saveData||navigator.deviceMemory&&navigator.deviceMemory<=2||navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2||connection?.effectiveType==='2g';if(lightMode){settle();return}body.classList.remove('is-ready');setAccessible(false);skip.hidden=false;caption.textContent='Цветок раскрывается.';const loaded=await loadFilm();if(ticket!==generation)return;if(!loaded){settle();return}film.currentTime=0;film.dataset.state='playing';playing=true;body.classList.add('has-image','is-playing');try{await film.play()}catch{if(ticket===generation)settle()}}
film.addEventListener('ended',settle);film.addEventListener('error',()=>{if(playing)settle()});skip.addEventListener('click',stopIntro);replay.addEventListener('click',()=>playIntro(true));document.querySelector('.back').addEventListener('click',()=>closeSection(true));document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();stopIntro();closeSection();window.scrollTo({top:0,behavior:motion.matches?'instant':'smooth'})});
document.querySelector('.menu-toggle').addEventListener('click',()=>menu.showModal());document.querySelector('.menu-close').addEventListener('click',()=>menu.close());menu.addEventListener('click',event=>{if(event.target===menu){const rect=menu.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)menu.close()}});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.open&&!story.hidden){event.preventDefault();closeSection(true)}});motion.addEventListener('change',()=>{if(motion.matches)stopIntro()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)stopIntro()});
// Text navigation is available immediately through the header, independently of image/video loading.
(async()=>{await Promise.allSettled([poster.decode()]);if(generation!==0)return;body.classList.add('has-image');await playIntro()})();
})();
