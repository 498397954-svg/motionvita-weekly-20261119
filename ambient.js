/* A single viewport light field. No custom cursor, content movement or data mutations. */
(()=>{
  let ready=false;
  function init(){
    const button=document.querySelector('.motion-toggle'),hero=document.querySelector('#report-hero');
    if(ready||!hero||!button||typeof button.onclick!=='function')return;
    ready=true;observer.disconnect();
    const atmosphere=document.createElement('div');atmosphere.className='site-atmosphere';atmosphere.setAttribute('aria-hidden','true');atmosphere.innerHTML='<div class="atmosphere-mesh"></div><div class="atmosphere-ribs"></div>';
    const viewport=document.createElement('div');viewport.className='viewport-light';viewport.setAttribute('aria-hidden','true');viewport.innerHTML='<div class="cursor-trail-origin"><div class="cursor-trail"></div></div><div class="cursor-origin"><div class="cursor-bloom"></div></div>';
    document.body.prepend(atmosphere);document.body.append(viewport,button);
    const core=viewport.querySelector('.cursor-origin'),trail=viewport.querySelector('.cursor-trail-origin');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
    let paused=hero.classList.contains('motion-paused'),frame=0,active=false,target={x:innerWidth*.6,y:innerHeight*.5},point={...target},wake={...target},surface=null;
    const selector='.roi-card,.priority,.brief,.channel-detail,.compare-channel-detail';
    const markSurfaces=()=>document.querySelectorAll(selector).forEach(el=>el.classList.add('light-surface'));
    markSurfaces();new MutationObserver(markSurfaces).observe(document.querySelector('#detail'),{childList:true});
    function paintState(){
      document.body.classList.toggle('page-motion-paused',paused||reduced.matches);
      if(paused||reduced.matches){if(frame)cancelAnimationFrame(frame);frame=0;surface?.classList.remove('light-near');}
      else {if(surface&&active)surface.classList.add('light-near');if(active&&fine.matches&&!frame)frame=requestAnimationFrame(render);}
    }
    window.addEventListener('mv-motion-change',event=>{paused=event.detail.paused;paintState()});
    reduced.addEventListener('change',paintState);fine.addEventListener('change',()=>{if(!fine.matches){active=false;document.body.classList.remove('has-pointer-light')}paintState()});
    function setSurface(next){if(next===surface)return;surface?.classList.remove('light-near');surface=next;if(surface){surface.classList.add('light-surface');if(!paused&&!reduced.matches)surface.classList.add('light-near')}}
    function position(el,p){el.style.transform=`translate3d(${p.x.toFixed(2)}px,${p.y.toFixed(2)}px,0)`}
    function render(){
      frame=0;if(paused||reduced.matches||!fine.matches||document.hidden)return;
      point.x+=(target.x-point.x)*.17;point.y+=(target.y-point.y)*.17;
      wake.x+=(target.x-wake.x)*.065;wake.y+=(target.y-wake.y)*.065;
      position(core,point);position(trail,wake);
      const hit=document.elementFromPoint(target.x,target.y);setSurface(hit?.closest(selector)||null);
      if(surface&&surface.isConnected){const box=surface.getBoundingClientRect();surface.style.setProperty('--surface-x',`${target.x-box.left}px`);surface.style.setProperty('--surface-y',`${target.y-box.top}px`)}
      if(Math.abs(target.x-point.x)+Math.abs(target.y-point.y)+Math.abs(target.x-wake.x)+Math.abs(target.y-wake.y)>.35)frame=requestAnimationFrame(render);
    }
    document.addEventListener('pointermove',e=>{
      if(e.pointerType==='touch'||!fine.matches)return;
      target={x:e.clientX,y:e.clientY};
      if(!active){active=true;point={...target};wake={...target};position(core,point);position(trail,wake);document.body.classList.add('has-pointer-light')}
      const next=e.target instanceof Element?e.target.closest(selector):null;
      setSurface(next);
      if(!paused&&!reduced.matches&&!frame)frame=requestAnimationFrame(render);
    },{passive:true});
    document.documentElement.addEventListener('pointerleave',()=>{active=false;document.body.classList.remove('has-pointer-light');surface?.classList.remove('light-near');if(frame)cancelAnimationFrame(frame);frame=0});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0}else if(active&&!paused&&!reduced.matches&&!frame)frame=requestAnimationFrame(render)});
    window.addEventListener('scroll',()=>{if(surface&&!paused&&!reduced.matches&&!frame)frame=requestAnimationFrame(render)},{passive:true});
    paintState();
  }
  const observer=new MutationObserver(init);observer.observe(document.querySelector('#app'),{childList:true});init();
})();
