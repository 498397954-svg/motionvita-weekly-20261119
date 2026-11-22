/* Channel workspaces, glass navigation and source-image navigation.
   All report articles and source images stay in the document, unchanged. */
(()=>{
  let ready=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const moving=()=>!reduced.matches;
  function init(){
    const section=document.querySelector('#channels');
    if(ready||!section||!document.querySelector('.utility-search')||typeof d==='undefined'||!d)return;
    ready=true;boot.disconnect();
    const owners=[...section.querySelectorAll('.owner')],names=d.owners.map(o=>o.channel),positions=new Map();
    let active=0,all=false,scrollFrame=0;
    const header=document.querySelector('header');
    const switcher=document.createElement('div');switcher.className='work-switcher';switcher.id='work-switcher';
    switcher.innerHTML=`<div class="work-tabs" role="navigation" aria-label="渠道周报快速切换"><span class="work-glider" aria-hidden="true"></span>${names.map((name,i)=>`<button type="button" data-work-owner="${i}" aria-controls="owner-${i}" aria-pressed="${i===0}">${esc(name)}</button>`).join('')}</div><label class="work-mobile">渠道<select aria-label="选择渠道周报"><option value="all">全部渠道</option>${names.map((name,i)=>`<option value="${i}">${esc(name)}</option>`).join('')}</select></label><div class="work-actions"><button class="work-all" type="button" aria-pressed="false">全部展开</button><button class="work-gallery" type="button"><span aria-hidden="true">▧</span> 看配图 <b></b></button></div><div class="work-progress" role="progressbar" aria-label="当前渠道阅读进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>`;
    const context=document.createElement('div');context.className='work-context';context.setAttribute('aria-live','polite');
    section.querySelector('.section-head').after(switcher,context);section.classList.add('work-enhanced');
    section.querySelector('.section-head>p').textContent='直接切换渠道，查看本周工作、问题与需求';
    const buttons=[...switcher.querySelectorAll('[data-work-owner]')],select=switcher.querySelector('select'),allButton=switcher.querySelector('.work-all'),galleryButton=switcher.querySelector('.work-gallery');
    function measure(){document.documentElement.style.setProperty('--site-header-h',`${header.getBoundingClientRect().height}px`);document.documentElement.style.setProperty('--work-switch-h',`${switcher.getBoundingClientRect().height}px`);positionGlider()}
    const observer=new ResizeObserver(measure);observer.observe(header);observer.observe(switcher);
    const offset=()=>header.getBoundingClientRect().height+switcher.getBoundingClientRect().height+28;
    function save(){const owner=owners[active];if(!owner||owner.hidden)return;const top=owner.getBoundingClientRect().top+scrollY;positions.set(active,Math.max(0,scrollY+offset()-top))}
    function positionGlider(){const current=buttons[active],glider=switcher.querySelector('.work-glider');if(!current)return;glider.style.opacity=all?'0':'1';glider.style.width=`${current.offsetWidth}px`;glider.style.transform=`translate3d(${current.offsetLeft}px,0,0)`}
    function refresh(){
      buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(!all&&i===active)));select.value=all?'all':String(active);allButton.setAttribute('aria-pressed',String(all));
      const count=images.filter(im=>im.owner===active).length;
      galleryButton.querySelector('b').textContent=count;galleryButton.setAttribute('aria-label',`查看${names[active]}的${count}张原稿配图`);
      context.innerHTML=`<span><i aria-hidden="true"></i>${all?'全部渠道已展开':esc(names[active])+' · '+esc(d.owners[active].period)}</span><small>${all?'点选渠道可进入单渠道查看':'切换渠道保留阅读位置 · 再点当前渠道回到顶部'}</small>`;
      section.classList.toggle('work-all-mode',all);positionGlider();updateProgress();
    }
    function animateOwner(){if(!moving())return;owners[active].querySelectorAll('.owner-title,.lead,.brief-grid').forEach((el,i)=>el.animate([{opacity:.6,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,delay:i*35,easing:'cubic-bezier(.2,.8,.2,1)'}))}
    function show(index,opts={}){
      if(index<0||index>=owners.length)return;
      if(opts.save!==false)save();
      const repeated=index===active&&!all;active=index;all=!!opts.all;
      owners.forEach((owner,i)=>{owner.hidden=!all&&i!==active});
      if(opts.reset||repeated&&opts.user)positions.set(active,0);
      refresh();
      if(opts.history)history.pushState({mvOwner:active,mvAll:all},'',all?'#channels':`#owner-${active}`);
      if(opts.scroll!==false){const top=owners[active].getBoundingClientRect().top+scrollY;const saved=all?0:positions.get(active)||0;const max=Math.max(0,owners[active].offsetHeight-innerHeight+offset()+40);window.scrollTo({top:Math.max(0,top-offset()+Math.min(saved,max)),behavior:'instant'})}
      if(!all&&opts.animate!==false)animateOwner();
    }
    function updateProgress(){
      scrollFrame=0;
      if(all){const line=offset()+40;let index=0;owners.forEach((owner,i)=>{if(owner.getBoundingClientRect().top<line)index=i});if(index!==active){active=index;galleryButton.querySelector('b').textContent=images.filter(im=>im.owner===active).length;galleryButton.setAttribute('aria-label',`查看${names[active]}的原稿配图`)}}
      const owner=owners[active],rect=owner.getBoundingClientRect();const available=Math.max(1,rect.height-(innerHeight-offset()));const progress=Math.max(0,Math.min(1,(offset()-rect.top)/available));
      switcher.querySelector('.work-progress i').style.transform=`scaleX(${progress})`;switcher.querySelector('.work-progress').setAttribute('aria-valuenow',String(Math.round(progress*100)));
    }
    window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateProgress)},{passive:true});
    section.addEventListener('click',e=>{const button=e.target.closest('[data-work-owner]');if(button)show(+button.dataset.workOwner,{history:true,user:true,all:all&&!!button.closest('.owner-pager')})});
    switcher.querySelector('.work-tabs').addEventListener('keydown',e=>{const button=e.target.closest('[data-work-owner]');if(!button||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const i=+button.dataset.workOwner,next=e.key==='Home'?0:e.key==='End'?owners.length-1:(i+(e.key==='ArrowRight'?1:owners.length-1))%owners.length;show(next,{history:true,user:true});buttons[next].focus({preventScroll:true})});
    select.onchange=()=>select.value==='all'?toggleAll(true):show(+select.value,{history:true,user:true});
    function toggleAll(value=!all){save();if(value){all=true;owners.forEach(o=>o.hidden=false);refresh();history.pushState({mvOwner:active,mvAll:true},'','#channels');owners[active].scrollIntoView({behavior:'instant',block:'start'})}else show(active,{history:true,save:false,reset:true})}
    allButton.onclick=()=>toggleAll();
    galleryButton.onclick=()=>{const i=images.findIndex(im=>im.owner===active);if(i>=0)openImage(i)};
    owners.forEach((owner,i)=>{const pager=document.createElement('div');pager.className='owner-pager';pager.innerHTML=`${i?`<button type="button" data-work-owner="${i-1}"><small>上一渠道</small>← ${esc(names[i-1])}</button>`:'<span></span>'}${i<owners.length-1?`<button type="button" data-work-owner="${i+1}"><small>下一渠道</small>${esc(names[i+1])} →</button>`:`<button type="button" data-work-owner="0"><small>回到首个渠道</small>抖音 ↑</button>`}`;owner.append(pager)});
    function route(hash){const source=/^#source-image-(\d+)$/.exec(hash);if(source)return images[+source[1]]?.owner??null;const match=/^#(?:owner-(\d+)|chapter-(\d+)-)/.exec(hash);return match?+(match[1]??match[2]):null}
    // Reveal the right article before any original source link scrolls to it.
    document.addEventListener('click',e=>{const anchor=e.target.closest('a[href^="#"]');if(!anchor)return;const index=route(anchor.hash);if(index!==null&&!anchor.classList.contains('gallery-source')){e.preventDefault();show(index,{scroll:false,reset:true,animate:false});history.pushState({mvOwner:index},'',anchor.hash);requestAnimationFrame(()=>document.getElementById(decodeURIComponent(anchor.hash.slice(1)))?.scrollIntoView({behavior:'instant',block:'start'}))}},true);
    function restoreHash(){const index=route(location.hash);if(index===null){if(location.hash==='#channels'&&history.state?.mvAll){show(history.state.mvOwner??active,{all:true,scroll:false,animate:false});requestAnimationFrame(()=>owners[active].scrollIntoView({behavior:'instant',block:'start'}))}return;}if(index!==active||all)show(index,{scroll:false,animate:false});requestAnimationFrame(()=>{const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));target?.scrollIntoView({behavior:'instant',block:'start'})})}
    window.addEventListener('popstate',restoreHash);window.addEventListener('hashchange',restoreHash);
    const initial=route(location.hash);active=initial??0;show(active,{scroll:false,save:false,animate:false});measure();
    setupGallery(show,names);
    setupNavigation();setupTransitions();setupReflectance();
  }
  function setupGallery(show,names){
    document.querySelectorAll('.owner .picture[data-image]').forEach(button=>button.id='source-image-'+button.dataset.image);
    const modal=document.querySelector('#lightbox'),img=modal.querySelector('img'),caption=modal.querySelector('p');let scope='channel',zoom=1;
    const meta=document.createElement('div');meta.className='gallery-meta';meta.innerHTML='<strong class="gallery-name"></strong><div><select aria-label="配图浏览范围"><option value="channel">本渠道配图</option><option value="all">全部配图</option></select><div class="gallery-zoom"><button type="button" aria-label="缩小配图">−</button><button type="button" aria-label="配图适应窗口">适应</button><button type="button" aria-label="放大配图">＋</button></div></div>';
    const stage=document.createElement('div');stage.className='gallery-stage';img.before(meta,stage);stage.append(img);
    const film=document.createElement('div');film.className='gallery-film';film.setAttribute('aria-label','原稿配图缩略图');caption.after(film);
    const source=document.createElement('a');source.className='gallery-source';source.textContent='回到这张图对应的原稿位置 ↗';film.after(source);
    const indices=()=>images.map((_,i)=>i).filter(i=>scope==='all'||images[i].owner===images[imageAt].owner);
    function fit(){if(!img.complete||!img.naturalWidth)return;const scale=Math.min((stage.clientWidth-24)/img.naturalWidth,(stage.clientHeight-20)/img.naturalHeight,1);img.style.width=`${Math.max(1,img.naturalWidth*scale*zoom)}px`;img.style.maxWidth='none';img.style.maxHeight='none';stage.classList.toggle('is-zoomed',zoom>1);meta.querySelector('[aria-label="配图适应窗口"]').textContent=zoom===1?'适应':Math.round(zoom*100)+'%'}
    function redraw(){
      const ids=indices(),owner=images[imageAt].owner;meta.querySelector('.gallery-name').textContent=names[owner];modal.querySelector('#counter').textContent=`${scope==='channel'?'本渠道':'全部配图'} · ${ids.indexOf(imageAt)+1} / ${ids.length}`;
      film.innerHTML=ids.map((i,j)=>`<button type="button" class="gallery-thumb" data-image="${i}" aria-label="查看第${j+1}张原稿配图" aria-pressed="${i===imageAt}"><img src="${esc(images[i].src)}" loading="lazy" alt=""><small>${String(j+1).padStart(2,'0')}</small></button>`).join('');
      source.href=`#source-image-${imageAt}`;zoom=1;stage.scrollTop=0;stage.scrollLeft=0;fit();
      requestAnimationFrame(()=>{const current=film.querySelector('[aria-pressed="true"]');if(current)film.scrollTo({left:Math.max(0,current.offsetLeft-film.clientWidth/2+current.offsetWidth/2),behavior:moving()?'smooth':'instant'})});
    }
    const originalOpen=openImage;openImage=function(i){originalOpen(i);redraw()};
    function step(delta){const ids=indices();openImage(ids[(ids.indexOf(imageAt)+delta+ids.length)%ids.length])}
    modal.querySelector('#prev').onclick=()=>step(-1);modal.querySelector('#next').onclick=()=>step(1);
    meta.querySelector('select').onchange=e=>{scope=e.target.value;redraw()};
    const changeZoom=delta=>{zoom=Math.max(1,Math.min(4,zoom+delta));fit()};
    meta.querySelector('[aria-label="放大配图"]').onclick=()=>changeZoom(.5);meta.querySelector('[aria-label="缩小配图"]').onclick=()=>changeZoom(-.5);meta.querySelector('[aria-label="配图适应窗口"]').onclick=()=>{zoom=1;fit();stage.scrollTop=stage.scrollLeft=0};
    img.addEventListener('load',fit);new ResizeObserver(fit).observe(stage);
    source.onclick=e=>{e.preventDefault();const current=imageAt,owner=images[current].owner;closeImage();show(owner,{scroll:false,reset:true,animate:false});history.pushState({mvOwner:owner},'',`#source-image-${current}`);requestAnimationFrame(()=>{const button=document.getElementById('source-image-'+current);button?.scrollIntoView({behavior:'instant',block:'center'});button?.focus({preventScroll:true})})};
    document.addEventListener('keydown',e=>{if(!modal.open||e.ctrlKey||e.metaKey)return;if(['ArrowLeft','ArrowRight','+','=','-','0'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();if(e.key==='ArrowLeft')step(-1);else if(e.key==='ArrowRight')step(1);else if(e.key==='0'){zoom=1;fit()}else changeZoom(e.key==='-'?-.5:.5)}},true);
    let pan=null;stage.addEventListener('pointerdown',e=>{if(zoom<=1||e.button!==0)return;pan={x:e.clientX,y:e.clientY,left:stage.scrollLeft,top:stage.scrollTop};stage.setPointerCapture(e.pointerId);stage.classList.add('is-panning');e.preventDefault()});stage.addEventListener('pointermove',e=>{if(!pan)return;stage.scrollLeft=pan.left-(e.clientX-pan.x);stage.scrollTop=pan.top-(e.clientY-pan.y)});const end=()=>{pan=null;stage.classList.remove('is-panning')};stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
  }
  function setupNavigation(){
    const nav=document.querySelector('header nav'),glider=document.createElement('span');glider.className='nav-glider';glider.setAttribute('aria-hidden','true');nav.prepend(glider);
    let frame=0;function update(){frame=0;const current=nav.querySelector('a.active')||nav.querySelector('a');if(!current)return;glider.style.width=`${current.offsetWidth+20}px`;glider.style.transform=`translate3d(${current.offsetLeft-10}px,-50%,0)`;if(nav.scrollWidth>nav.clientWidth&&(current.offsetLeft<nav.scrollLeft||current.offsetLeft+current.offsetWidth>nav.scrollLeft+nav.clientWidth))nav.scrollTo({left:Math.max(0,current.offsetLeft-(nav.clientWidth-current.offsetWidth)/2),behavior:moving()?'smooth':'instant'})}
    new MutationObserver(()=>{if(!frame)frame=requestAnimationFrame(update)}).observe(nav,{subtree:true,attributes:true,attributeFilter:['class']});new ResizeObserver(update).observe(nav);update();
  }
  function setupTransitions(){
    const groups=['#bars','#online-pair','#offline-pair','#compare-channel-detail'];
    groups.forEach(selector=>{const container=document.querySelector(selector);if(!container)return;let previous=new Map();
      function record(animate){const next=new Map();container.querySelectorAll('em').forEach((bar,i)=>{const key=selector==='#bars'?bar.closest('button').querySelector('span').textContent:String(i);const width=bar.style.width;next.set(key,width);if(animate&&moving())bar.animate([{width:previous.get(key)||'0%'},{width}],{duration:620,easing:'cubic-bezier(.2,.8,.2,1)'});});previous=next}
      record(false);new MutationObserver(()=>record(true)).observe(container,{childList:true,subtree:selector==='#compare-channel-detail'});
    });
    if(!moving())return;const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const el=entry.target;el.animate([{opacity:.65,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],{duration:440,easing:'cubic-bezier(.2,.8,.2,1)'});observer.unobserve(el)}),{threshold:.1});document.querySelectorAll('.section-head,.roi-card,.product-shell').forEach(el=>observer.observe(el));
  }
  function setupReflectance(){document.querySelector('.brand-light-art')?.classList.add('brand-satin')}
  const boot=new MutationObserver(init);boot.observe(document.querySelector('#app'),{childList:true});init();
})();
