const projects=[
{title:'Форма',type:'01 / САЙТ АРХИТЕКТУРНОГО БЮРО',desc:'Концепция сайта бюро, которое занимается архитектурой, интерьерами и предметным дизайном.',task:'Показать проекты крупно, сохранив удобный доступ к описанию и деталям каждой работы.',solution:'Простая сетка, большие фотографии и короткие подписи. Внимание остаётся на архитектуре.'},
{title:'Мори',type:'02 / ИНТЕРНЕТ-МАГАЗИН ЧАЯ',desc:'Концепция магазина японского чая с небольшой коллекцией сортов и аксессуаров.',task:'Помочь покупателю разобраться в видах чая и выбрать подходящий сорт.',solution:'Светлый фон, спокойный зелёный цвет и понятные карточки: вкус, происхождение, способ приготовления.'},
{title:'Сдвиг',type:'03 / САЙТ ФЕСТИВАЛЯ',desc:'Концепция сайта фестиваля независимой музыки и современного искусства.',task:'Собрать программу, участников и информацию о посещении в одном месте.',solution:'Плакатная типографика задаёт тон. Расписание, площадки и условия участия оформлены отдельными разделами.'}
];
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const caseDialog=document.querySelector('#case-dialog');
const briefDialog=document.querySelector('#brief-dialog');
const ease='cubic-bezier(.22,1,.36,1)';
const closingDialogs=new WeakSet();
function openDialog(dialog){
  dialog.showModal();document.body.style.overflow='hidden';
  if(!reducedMotion.matches)dialog.animate([{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:480,easing:ease});
}
async function closeDialog(dialog){
  if(closingDialogs.has(dialog)||!dialog.open)return;
  closingDialogs.add(dialog);
  if(!reducedMotion.matches)await dialog.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(10px)'}],{duration:230,easing:'ease-in',fill:'forwards'}).finished.catch(()=>{});
  dialog.close();dialog.getAnimations().forEach(animation=>animation.cancel());closingDialogs.delete(dialog);
}
document.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>{
  const project=projects[Number(button.dataset.project)];
  const preview=button.querySelector('.architecture-site,.tea-site,.festival-site').cloneNode(true);
  const previewSlot=caseDialog.querySelector('.case-preview');
  previewSlot.replaceChildren(preview);
  previewSlot.dataset.project=button.dataset.project;
  for(const [id,key] of [['case-type','type'],['case-title','title'],['case-desc','desc'],['case-task','task'],['case-solution','solution']])document.getElementById(id).textContent=project[key];
  openDialog(caseDialog);caseDialog.scrollTop=0;
}));
document.querySelector('#contact-open').addEventListener('click',()=>openDialog(briefDialog));
document.querySelector('#case-contact').addEventListener('click',async()=>{await closeDialog(caseDialog);openDialog(briefDialog)});
document.querySelectorAll('dialog').forEach(dialog=>{
  dialog.querySelector('.close').addEventListener('click',()=>closeDialog(dialog));
  dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog(dialog)});
  dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.style.overflow=''});
  let outsideStart=false;
  const isOutside=event=>{const rect=dialog.getBoundingClientRect();return event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom};
  dialog.addEventListener('pointerdown',event=>{outsideStart=event.target===dialog&&isOutside(event)});
  dialog.addEventListener('click',event=>{if(outsideStart&&event.target===dialog&&isOutside(event))closeDialog(dialog);outsideStart=false});
});
document.querySelectorAll('details').forEach(details=>{
  const summary=details.querySelector('summary');let animation=null;
  summary.addEventListener('click',event=>{
    if(reducedMotion.matches)return;
    event.preventDefault();if(animation)return;
    const start=details.getBoundingClientRect().height;
    const willOpen=!details.open;
    if(willOpen)details.open=true;
    const end=willOpen?details.getBoundingClientRect().height:summary.getBoundingClientRect().height;
    animation=details.animate({height:[`${start}px`,`${end}px`]},{duration:480,easing:ease});
    animation.onfinish=()=>{details.open=willOpen;animation=null};
  });
});
if(!reducedMotion.matches&&'IntersectionObserver' in window){
  document.documentElement.classList.add('motion-ready');
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target)}})},{threshold:.08});
  document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));
}
document.querySelector('#brief-form').addEventListener('submit',event=>{
  event.preventDefault();const data=new FormData(event.target);
  const text=`Zemskov studio\nБРИФ НА РАЗРАБОТКУ САЙТА\n\nИмя: ${data.get('name')}\nКонтакт: ${data.get('contact')}\n\nЗадача:\n${data.get('idea')}\n`;
  const url=URL.createObjectURL(new Blob(['\uFEFF'+text],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='Бриф — Zemskov studio.txt';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  document.querySelector('#form-status').textContent='Бриф готов. Передайте скачанный файл студии.';
});
