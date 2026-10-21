(()=>{

const sections=[
 ['Обо мне','Я Никита.','Создаю сайты для специалистов и небольшого бизнеса.','Меня вдохновляет творчество и возможность помогать другим людям.'],
 ['Услуги','Создаю сайты.','Хочу помогать людям рассказывать о своих продуктах и продвигать их через сайт.','Для меня это способ соединить творчество с конкретной пользой.'],
 ['Как работаю','Сначала — ваша задача.','Для начала мне нужно понять, чем вы занимаетесь и что хотите показать на сайте.','Затем обсуждаем разделы, оформление и то, как посетитель сможет с вами связаться.'],
 ['Вопросы','Творчество.','Меня вдохновляет возможность придумать что-то своё.','И помочь человеку показать продукт, в который он вкладывает силы.'],
 ['Портфолио','Что хочу создавать.','Хочу создавать сайты для людей, которым нужно рассказать о своём продукте.','Это направление, в котором я хочу работать.'],
 ['Связаться','Мои работы — впереди.','Готовых проектов для портфолио пока нет.','Буду добавлять их сюда по мере появления.']
];
const body=document.body,root=document.querySelector('.experience'),canvas=document.querySelector('.model'),story=document.querySelector('.story'),menu=document.querySelector('.menu'),skip=document.querySelector('.skip'),replay=document.querySelector('.replay'),caption=document.querySelector('.scene-caption'),callouts=document.querySelector('.callouts');
let interactionMode='lift',flowMode='petal',selectionRevision=0;
const mobileBloom=matchMedia('(max-width:700px)');
const motion=matchMedia('(prefers-reduced-motion:reduce)');let api=null,skipped=false,lastFocus=null,mobileHasOpened=false;const tags=[],buttons=[];
let menuExit=null;
function closeMenu(){if(!menu.open||menuExit)return;if(motion.matches){menu.close();return;}menuExit=menu.animate([{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(8px) scale(.985)'}],{duration:220,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'});menuExit.finished.then(()=>{menu.close();menuExit.cancel();menuExit=null},()=>{menuExit=null});}
menu.addEventListener('cancel',event=>{event.preventDefault();closeMenu()});menu.addEventListener('nikita-menu-dismiss',closeMenu);
const movement=document.createElement('button');movement.type='button';movement.className='text-button movement';movement.textContent='Остановить движение';movement.setAttribute('aria-pressed','false');replay.before(movement);let movementPaused=false;
movement.addEventListener('click',()=>{movementPaused=!movementPaused;api?.setAnimated(!movementPaused);movement.textContent=movementPaused?'Включить движение':'Остановить движение';movement.setAttribute('aria-pressed',String(movementPaused))});
function syncMovement(){movement.hidden=motion.matches}motion.addEventListener('change',syncMovement);syncMovement();
sections.forEach((section,i)=>{
 const tag=document.createElement('button');tag.type='button';tag.className='callout';tag.disabled=true;tag.setAttribute('aria-label',section[0]);tag.setAttribute('aria-pressed','false');tag.setAttribute('aria-controls','petal-panel-title');tag.textContent=section[0];tag.addEventListener('click',event=>show(i,tag,event.detail===0));
 tag.addEventListener('keydown',event=>{let next;if(['ArrowRight','ArrowDown'].includes(event.key))next=(i+1)%6;if(['ArrowLeft','ArrowUp'].includes(event.key))next=(i+5)%6;if(event.key==='Home')next=0;if(event.key==='End')next=5;if(next!==undefined){event.preventDefault();tags[next].focus()}});tag.addEventListener('pointerenter',()=>api?.hover(i));tag.addEventListener('pointerleave',()=>api?.hover(-1));tag.addEventListener('focus',()=>api?.hover(i));tag.addEventListener('blur',()=>api?.hover(-1));const text=document.createElement('span');text.className='petal-label-text';text.textContent=section[0];tag.replaceChildren(text);const anchor=[[50,16],[81,29],[81,65],[50,81],[19,65],[19,29]][i];tag.style.setProperty('--x',anchor[0]+'%');tag.style.setProperty('--y',anchor[1]+'%');tag.style.setProperty('--label-delay',(i*35)+'ms');tags.push(tag);callouts.append(tag);
 for(const nav of document.querySelectorAll('.section-nav,.menu-nav')){const button=document.createElement('button');button.type='button';button.dataset.index=i;button.setAttribute('aria-pressed','false');button.textContent=section[0];button.addEventListener('click',event=>{if(menu.open)closeMenu();show(i,button,event.detail===0)});nav.append(button);buttons.push(button)}
});
function complete(){mobileHasOpened=true;body.classList.add('is-ready','has-image');skip.hidden=true;replay.disabled=!api;tags.forEach(tag=>tag.disabled=false);caption.textContent=api?(matchMedia('(max-width:700px)').matches?'Выберите раздел или лепесток.':'Выберите лепесток. Цветок можно повернуть.'):'Выберите раздел.'}
function finish(){const before=root.getBoundingClientRect().top,wasPinned=body.classList.contains('scroll-bloom');skipped=true;api?.finish();body.classList.remove('scroll-bloom');if(wasPinned){const delta=root.getBoundingClientRect().top-before;if(Math.abs(delta)>1)window.scrollBy({top:delta,behavior:'instant'});}complete()}
const storyText=story.querySelector('.story-text');let activeSection=-1,contentRevision=0,textAnimation=null;
function cancelTextTransition(){contentRevision++;textAnimation?.cancel();textAnimation=null;story.removeAttribute('aria-busy')}
function close(restore=false){cancelTextTransition();activeSection=-1;root.classList.remove('has-section');story.hidden=true;api?.select(-1);tags.forEach(tag=>{tag.classList.remove('is-selected');tag.setAttribute('aria-pressed','false')});buttons.forEach(button=>button.setAttribute('aria-pressed','false'));if(restore){if(lastFocus?.isConnected&&!lastFocus.closest('.story,.menu'))lastFocus.focus({preventScroll:true});else document.querySelector('.menu-toggle').focus({preventScroll:true})}}

const panel=document.querySelector('.petal-panel'),panelContent=panel.querySelector('.petal-panel-content'),panelTitle=panel.querySelector('.panel-title');
const views=[document.querySelector('#about'),document.querySelector('#services'),document.querySelector('#process'),document.querySelector('#faq'),null,document.querySelector('#request')];
const portfolioView=document.createElement('section');portfolioView.className='petal-copy';const portfolioCopy=document.createElement('p');portfolioCopy.textContent='Готовых проектов для портфолио пока нет.';portfolioView.append(portfolioCopy);views[4]=portfolioView;
document.querySelectorAll('.workflow-step').forEach(step=>step.addEventListener('toggle',()=>{if(step.open)document.querySelectorAll('.workflow-step').forEach(other=>{if(other!==step)other.open=false})}));
views.forEach(view=>{view.hidden=true;panelContent.append(view)});
let panelOrigin=null,panelExit=null;
let readingExit=null;
async function dismissPanel(restore=true){selectionRevision++;if(readingExit)return readingExit;readingExit=(async()=>{if(panel.open&&!motion.matches){const exit=panel.animate([{opacity:1},{opacity:0}],{duration:180,easing:'ease-out'});await exit.finished.catch(()=>{});}panel.close();if(location.hash&&location.hash!=='#flower')history.replaceState(null,'',location.pathname+location.search);body.classList.remove('flow-reading','flow-content-visible','panel-open','unfold-reading');delete body.dataset.readingMode;root.inert=false;callouts.inert=false;document.querySelector('.introduction').inert=false;api?.setPresentation('idle');api?.setAnimated(!movementPaused);close();if(flowMode==='below')window.scrollTo({top:0,behavior:motion.matches?'instant':'smooth'});if(restore)panelOrigin?.focus({preventScroll:true});})();await readingExit;readingExit=null;}
async function show(i,origin=tags[i],keyboard=false){if(readingExit)await readingExit;const revision=++selectionRevision;finish();panel.close();body.classList.remove('flow-content-visible');lastFocus=origin;panelOrigin=origin;activeSection=i;views.forEach((view,j)=>view.hidden=i!==j);panelTitle.textContent=sections[i][0];panel.dataset.section=['about','services','process','faq','portfolio','request'][i];if(i!==1)history.replaceState(null,'',location.pathname+location.search+'#'+panel.dataset.section);tags.forEach((tag,j)=>{tag.classList.toggle('is-selected',i===j);tag.setAttribute('aria-pressed',String(i===j))});if(menu.open)menu.close();const bounds=(origin?.getBoundingClientRect?.()||canvas.getBoundingClientRect()),entryTop=document.querySelector('header').getBoundingClientRect().bottom;body.style.setProperty('--entry-top',`${Math.max(0,entryTop)}px`);body.style.setProperty('--wipe-x',`${bounds.left+bounds.width/2}px`);body.style.setProperty('--wipe-y',`${bounds.top+bounds.height/2-Math.max(0,entryTop)}px`);body.dataset.readingMode=flowMode;body.classList.add('flow-reading');root.inert=true;callouts.inert=flowMode!=='compact';document.querySelector('.introduction').inert=true;api?.setPresentation(flowMode,i);api?.setAnimated(false);if(!motion.matches)await new Promise(resolve=>setTimeout(resolve,flowMode==='petal'?1050:flowMode==='page'?620:650));if(revision!==selectionRevision)return;if(i===1){api?.dispose();location.assign("services.html");return;}panel.show();panel.scrollTop=0;body.classList.add('flow-content-visible');if(!motion.matches){if(flowMode==='page'){[panel.querySelector('.petal-panel-head'),panelTitle,...views[i].children].slice(0,8).forEach((node,n)=>node.animate([{opacity:0,transform:'translateY(28px)',clipPath:'inset(0 0 100% 0)'},{opacity:1,transform:'translateY(0)',clipPath:'inset(0)'}],{duration:850,delay:n*85,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));}else{const frames=flowMode==='flap'?[{opacity:0,clipPath:'inset(0 0 100% 0)',transform:'translateY(14px)'},{opacity:1,clipPath:'inset(0)',transform:'translateY(0)'}]:[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}];panel.animate(frames,{duration:550,easing:'cubic-bezier(.22,1,.36,1)'});}}if(keyboard)panelTitle.focus({preventScroll:true});if(flowMode==='below')panel.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'start'});}
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&body.classList.contains('flow-reading')){event.preventDefault();dismissPanel()}});
document.querySelector('.brand').addEventListener('click',event=>{if(body.classList.contains('flow-reading')){event.preventDefault();event.stopImmediatePropagation();dismissPanel()}},{capture:true});

document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel.open&&body.classList.contains('unfold-reading')){event.preventDefault();dismissPanel()}});panel.querySelector('.petal-panel-close').addEventListener('click',dismissPanel);panel.addEventListener('cancel',e=>{e.preventDefault();dismissPanel()});panel.addEventListener('click',e=>{if(e.target===panel){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dismissPanel()}});
document.querySelectorAll('a[href="#request"]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();show(5,link,e.detail===0)}));

// Native gestures keep working even when the single-screen page is already at its top.
function bloomGesture(delta){if(mobileBloom.matches||!api||motion.matches||body.classList.contains('flow-reading')||panel.open||menu.open||canvas.dataset.growth!=='1.000'||Math.abs(delta)<12)return;clearTimeout(play.openTimer);skipped=false;api.animateBloom(delta>0?1:0);}
let wheelAmount=0,wheelTime=0;
window.addEventListener('wheel',event=>{if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;const now=performance.now();if(now-wheelTime>140||Math.sign(wheelAmount)!==Math.sign(event.deltaY))wheelAmount=0;wheelTime=now;wheelAmount+=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);if(Math.abs(wheelAmount)>=24){bloomGesture(wheelAmount);wheelAmount=0;}},{passive:true});
document.addEventListener('keydown',event=>{if(event.target.closest('input,textarea,select,button,a,canvas,dialog'))return;if(['ArrowUp','PageUp','Home'].includes(event.key))bloomGesture(-30);if(['ArrowDown','PageDown','End'].includes(event.key))bloomGesture(30)});
const bloomWrap=document.querySelector('.bloom-scroll');let scrollRequest=0;
// Mobile follows document position, never finger direction or wheel impulses.
function updateBloom(){
 scrollRequest=0;
 if(!mobileBloom.matches||!api||skipped||motion.matches||body.classList.contains('flow-reading')||panel.open||menu.open)return;
 const available=Math.max(0,document.documentElement.scrollHeight-innerHeight);
 if(available<40){if(canvas.dataset.growth==='1.000')api.animateBloom(1);return;}
 const distance=Math.min(220,available);
 api.setScrollProgress(Math.max(0,Math.min(1,window.scrollY/distance)));
}
function queueBloom(){if(!scrollRequest)scrollRequest=requestAnimationFrame(updateBloom)}
window.addEventListener('scroll',queueBloom,{passive:true});window.addEventListener('resize',queueBloom,{passive:true});window.addEventListener('nikita-theme-change',queueBloom);
function phaseChanged(phase){queueBloom();if(skipped||motion.matches)return;if(phase==='open'){complete();return;}if(mobileBloom.matches&&mobileHasOpened&&phase!=='growing')return;body.classList.remove('is-ready');skip.hidden=false;replay.disabled=phase==='growing';tags.forEach(tag=>tag.disabled=true);caption.textContent=phase==='growing'?'Цветок растёт.':'Прокрутите вниз, чтобы раскрыть цветок. Вверх — чтобы закрыть.';}
function play(restart=false){if(!api)return;skipped=false;mobileHasOpened=false;close();bloomWrap.style.setProperty('--bloom-height',root.offsetHeight+'px');body.classList.remove('scroll-bloom');body.classList.remove('is-ready');tags.forEach(tag=>tag.disabled=true);skip.hidden=false;replay.disabled=true;caption.textContent='Цветок растёт.';api.play();clearTimeout(play.openTimer);if(!mobileBloom.matches)play.openTimer=setTimeout(()=>{if(!skipped)api.animateBloom(1)},2000);if(restart)window.scrollTo({top:Math.max(0,bloomWrap.getBoundingClientRect().top+window.scrollY),behavior:'smooth'});queueBloom();}
canvas.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&!body.classList.contains('is-ready')){event.preventDefault();finish()}});
skip.addEventListener('click',finish);replay.addEventListener('click',()=>play(true));document.querySelector('.back').addEventListener('click',()=>close(true));document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();finish();close();window.scrollTo({top:0,behavior:motion.matches?'instant':'smooth'})});document.querySelector('.menu-toggle').addEventListener('click',()=>menu.showModal());document.querySelector('.menu-close').addEventListener('click',()=>closeMenu());menu.addEventListener('click',event=>{if(event.target===menu){const r=menu.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeMenu()}});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.open&&!story.hidden){event.preventDefault();close(true)}});motion.addEventListener('change',()=>{if(motion.matches)finish()});
// Bounds are measured only when layout changes; per-frame work is compositor transforms.
let labelWidth=0,labelHeight=0;const labelSizes=tags.map(()=>({x:60,y:24}));
function measureLabelBounds(){labelWidth=callouts.clientWidth;labelHeight=callouts.clientHeight;tags.forEach((tag,i)=>{labelSizes[i].x=tag.offsetWidth*.5;labelSizes[i].y=tag.offsetHeight*.5;});}
const labelObserver=new ResizeObserver(measureLabelBounds);labelObserver.observe(callouts);document.fonts.ready.then(measureLabelBounds);measureLabelBounds();
function followPetalLabels(points){if(matchMedia('(max-width:700px)').matches||!labelWidth||!labelHeight)return;points.forEach((point,i)=>{const half=labelSizes[i],x=Math.max(half.x+12,Math.min(labelWidth-half.x-12,point.x*labelWidth/100)),y=Math.max(half.y+12,Math.min(labelHeight-half.y-12,point.y*labelHeight/100));tags[i].style.setProperty('--label-x',x.toFixed(3)+'px');tags[i].style.setProperty('--label-y',y.toFixed(3)+'px');});}
const interactionPicker=document.querySelector('.interaction-picker');
if(interactionPicker){const descriptions={glow:'Наведите на лепесток: он подсветится. Нажмите, чтобы открыть раздел.',points:'Наведите на точку или лепесток, чтобы увидеть название. Нажмите для открытия.',lift:'Лепесток чуть приподнимается при наведении. Нажмите для открытия.',unfold:'Нажмите на лепесток: он отогнётся, а текст появится рядом с цветком.'};interactionPicker.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{selectionRevision++;interactionMode=button.dataset.mode;body.dataset.petalMode=interactionMode;api?.setInteractionMode(interactionMode);interactionPicker.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelector('.interaction-help').textContent=descriptions[interactionMode];}));}
const requestedSection=location.hash.slice(1),directSections={about:0,process:2,faq:3,portfolio:4,request:5};const selectedKind={landing:'Сайт продукта или услуги',personal:'Личный сайт',update:'Обновление существующего сайта'}[new URLSearchParams(location.search).get('service')];if(selectedKind)document.querySelector('.request-form select[name=kind]').value=selectedKind;if(requestedSection==='services')location.replace('services.html');else if(Object.hasOwn(directSections,requestedSection))show(directSections[requestedSection]);else if(requestedSection==='flower')finish();
window.addEventListener('hashchange',()=>{const route=location.hash.slice(1);if(route==='services'){location.assign('services.html');return;}if(Object.hasOwn(directSections,route)){if(activeSection!==directSections[route]||!panel.open)show(directSections[route]);}else if(route==='flower'||!route){if(panel.open||body.classList.contains('flow-reading'))dismissPanel(false);finish();}});
import('./site-scene.js?v=mobile-1').then(async module=>{
 api=await module.createFlowerStage({canvas,onPhase:phaseChanged,onTypeSpread:value=>{if(matchMedia('(max-width:700px)').matches)root.style.setProperty('--word-shift',((1-value)*24).toFixed(2)+'px')},onComplete:complete,onSelect:i=>show(i),onHover:i=>tags.forEach((tag,j)=>tag.classList.toggle('is-hovered',i===j)),onLabels:followPetalLabels});
 api.setInteractionMode(interactionMode);body.classList.add('has-image','is-webgl');if(skipped||motion.matches||(location.hash&&location.hash!=='#'))finish();else play();
}).catch(error=>{canvas.dataset.error=String(error.message);console.error('3D flower unavailable:',error);complete();const positions=[[50,16],[80,28],[79,66],[49,78],[20,65],[20,29]];positions.forEach((p,i)=>{tags[i].style.setProperty('--x',`${p[0]}%`);tags[i].style.setProperty('--y',`${p[1]}%`)})});
})();












window.addEventListener("pageshow",event=>{if(event.persisted)location.reload()});




