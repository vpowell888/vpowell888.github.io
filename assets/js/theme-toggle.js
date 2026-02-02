// Shared theme toggle script (local)
(function(){
  const key = 'site-theme';
  const apply = (theme)=>{
    if(theme==='dark') document.documentElement.setAttribute('data-theme','dark');
    else document.documentElement.removeAttribute('data-theme');
    document.querySelectorAll('#theme-toggle').forEach(btn=>{
      // support either <i class="fas fa-moon"> fallback or inline SVG icons
      const iconElem = btn.querySelector('i');
      if(iconElem){
        if(theme==='dark'){
          iconElem.classList.remove('fa-moon'); iconElem.classList.add('fa-sun');
        } else {
          iconElem.classList.remove('fa-sun'); iconElem.classList.add('fa-moon');
        }
      } else {
        const moon = btn.querySelector('.icon-moon');
        const sun = btn.querySelector('.icon-sun');
        if(moon && sun){
          if(theme==='dark'){
            moon.style.display='none'; sun.style.display='block';
          } else {
            moon.style.display='block'; sun.style.display='none';
          }
        }
      }
    });
  };

  document.addEventListener('DOMContentLoaded', ()=>{
    const toggles = Array.from(document.querySelectorAll('#theme-toggle'));
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const saved = localStorage.getItem(key) || (prefersDark ? 'dark' : 'light');
    apply(saved);

    toggles.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const current = document.documentElement.getAttribute('data-theme')==='dark' ? 'dark' : 'light';
        const next = current==='dark' ? 'light' : 'dark';
        apply(next);
        try{ localStorage.setItem(key,next); }catch(e){}
      });
    });
  });
})();
