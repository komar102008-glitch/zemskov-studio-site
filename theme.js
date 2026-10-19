(()=>{
 const root=document.documentElement,key='nikita-zemskov-theme';
 let dark=false;try{dark=localStorage.getItem(key)==='dark'}catch{}
 function apply(value,save=false){
  dark=value;root.dataset.theme=dark?'dark':'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#20211f':'#f7f2e9');
  const button=document.querySelector('.theme-toggle');
  if(button){button.setAttribute('aria-pressed',String(dark));button.setAttribute('aria-label',dark?'Сменить тему на светлую':'Сменить тему на тёмную');button.title=dark?'Сейчас: графит и янтарь':'Сейчас: светлая тема';}
  if(save){try{localStorage.setItem(key,dark?'dark':'light')}catch{}window.dispatchEvent(new Event('nikita-theme-change'));}
 }
 apply(dark);
 document.addEventListener('DOMContentLoaded',()=>{apply(dark);document.querySelector('.theme-toggle')?.addEventListener('click',()=>apply(!dark,true));});
 window.addEventListener('storage',event=>{if(event.key===key)apply(event.newValue==='dark',true)});
})();
