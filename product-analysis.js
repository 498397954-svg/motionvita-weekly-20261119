/* Independent product analysis. Never changes report.json sales totals. */
(()=>{
  let data,root,activeChannel='all',activePeriod='total',activeProduct='isotonic-gel',productPicked=false,ready=false;
  const fmt=n=>n==null?'':Number(n).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
  const share=(v,total)=>total>0&&v!=null?`${(v/total*100).toFixed(2)}%`:'';
  const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const nsum=values=>values.some(v=>v!=null)?Math.round(values.reduce((a,b)=>a+(b||0),0)*1000)/1000:null;
  const currentPeriod=()=>data.periods.find(p=>p.id===activePeriod);
  const value=r=>activePeriod==='total'?r.total:r.weeks[currentPeriod().index];
  const channelName=id=>id==='all'?'全渠道':data.channels.find(c=>c.id===id)?.name||id;
  function entries(channel=activeChannel){return data.products.map(p=>({...p,value:nsum(data.rows.filter(r=>(channel==='all'||r.channel===channel)&&r.product===p.id).map(value))}));}
  const ordered=items=>[...items].sort((a,b)=>(b.value??-1)-(a.value??-1));
  function init(){
    root=document.querySelector('#products');if(ready||!root)return;
    ready=true;boot.disconnect();
    root.innerHTML='<div class="pd-loading" role="status">正在加载产品销售结构…</div>';
    load();
  }
  async function load(){
    try{const res=await fetch('product-structure.json?v=8');if(!res.ok)throw new Error('Product data unavailable');data=await res.json();mount();}
    catch(error){root.innerHTML='<div class="pd-loading" role="status">产品结构暂未加载成功。<button type="button" class="pd-retry">重新加载</button></div>';root.querySelector('button').onclick=load;console.error(error);}
  }
  function mount(){
    root.innerHTML=`<div class="section-head pd-heading"><div><div class="label">PRODUCT MIX / SALES COMPOSITION</div><h2>产品销售结构</h2><p>产品卖了多少，在哪些渠道卖。点选产品查看金额、占比和渠道分布。</p></div><div class="pd-period" aria-label="产品结构统计期间">${data.periods.map(p=>`<button type="button" data-pd-period="${p.id}" aria-pressed="${p.id===activePeriod}">${safe(p.label)}</button>`).join('')}</div></div><div class="pd-shell"><div class="pd-topline"><div><h3 id="pd-view-title">全渠道 · 产品占比</h3><p id="pd-period-label"></p></div><span class="pd-status"><i></i> 金山原表 · 10款产品</span></div><div class="pd-channel-list" aria-label="选择产品分析渠道"><button type="button" data-pd-channel="all" aria-pressed="true">全渠道</button>${data.channels.map(c=>`<button type="button" data-pd-channel="${c.id}" class="${c.id==='combined'?'pd-combined':''}" aria-pressed="false">${safe(c.name)}</button>`).join('')}</div><div id="pd-analysis" aria-live="polite" aria-atomic="false"></div><div id="pd-focus"></div></div><div class="pd-overview"><div class="pd-overview-title"><div><h3>各渠道卖什么</h3><p>每条代表一个渠道的产品结构 · 点击切换查看</p></div><button type="button" id="pd-export">导出明细 ↓</button></div><div id="pd-composition" class="pd-composition"></div><div class="pd-stack-key">${data.products.map(p=>`<span><i style="background:${p.color}"></i>${safe(p.name)}</span>`).join('')}</div></div><p class="pd-note">来源：金山「11月产品结构」。累计按原表合计展示，分周使用原表日期；快手／得物／视频号合报，暂未拆分。采购与分公司未提供产品明细。<a href="${safe(data.meta.sourceUrl)}" target="_blank" rel="noopener">查看原表 ↗</a></p><details class="pd-details"><summary>渠道 × 产品 · 完整金额与占比 ＋</summary><div id="pd-matrix" class="tablewrap"></div><p>占比为该产品在本渠道已报产品销售额中的比例。空白表示未填报；0.00表示原表为0。产品表的期间与覆盖范围独立于上方销售总览，未用总动销金额分摊。</p></details>`;
    root.addEventListener('click',onClick);
    root.addEventListener('keydown',e=>{if(e.target.matches('.pd-arc')&&['Enter',' '].includes(e.key)){e.preventDefault();chooseProduct(e.target.dataset.pdProduct);}});
    root.querySelector('#pd-export').onclick=exportCsv;
    render();
  }
  function onClick(e){
    const period=e.target.closest('[data-pd-period]');if(period){activePeriod=period.dataset.pdPeriod;productPicked=false;render();return;}
    const channel=e.target.closest('[data-pd-channel]');if(channel){activeChannel=channel.dataset.pdChannel;productPicked=false;render();return;}
    const product=e.target.closest('[data-pd-product]');if(product)chooseProduct(product.dataset.pdProduct);
  }
  function chooseProduct(id){activeProduct=id;productPicked=true;render();}
  function donut(items,total){
    const circumference=2*Math.PI*119;let start=0;const arcs=[];const selected=items.find(p=>p.id===activeProduct);
    for(const p of items){if(!(p.value>0)||!total)continue;const fraction=p.value/total;const gap=Math.min(2.4,fraction*circumference*.12);const length=fraction*circumference-gap;
      arcs.push(`<circle class="pd-arc ${p.id===activeProduct?'is-selected':''}" role="button" tabindex="0" data-pd-product="${p.id}" aria-label="${safe(p.name)}，${fmt(p.value)}元，占比${share(p.value,total)}" aria-pressed="${p.id===activeProduct}" cx="160" cy="160" r="119" fill="none" stroke="${p.color}" stroke-width="40" stroke-dasharray="${length} ${circumference-length}" stroke-dashoffset="${-start*circumference}" transform="rotate(-90 160 160)"><title>${safe(p.name)} · ${share(p.value,total)} · ¥${fmt(p.value)}</title></circle>`);start+=fraction;
    }
    return `<svg class="pd-donut" viewBox="0 0 320 320" aria-label="${safe(channelName(activeChannel))}产品销售占比环形图"><circle class="pd-donut-base" cx="160" cy="160" r="119" fill="none" stroke-width="40"/>${arcs.join('')}<g class="pd-donut-center"><text class="pd-center-label" x="160" y="143" text-anchor="middle">${productPicked?safe(selected.name):(activeChannel==='all'?'已报产品合计':safe(channelName(activeChannel)))}</text><text class="pd-center-value" x="160" y="177" text-anchor="middle">${fmt(productPicked?selected.value:total)}</text><text class="pd-center-unit" x="160" y="201" text-anchor="middle">${productPicked?'占比 '+share(selected.value,total):'销售金额 / 元'}</text></g></svg>`;
  }
  function render(){
    const focused=document.activeElement,focusProduct=focused?.dataset.pdProduct;
    const items=entries(),total=nsum(items.map(p=>p.value)),sorted=ordered(items),period=currentPeriod();
    root.querySelector('#pd-view-title').textContent=`${channelName(activeChannel)} · 产品占比`;
    root.querySelector('#pd-period-label').textContent=(activePeriod==='total'?'11月已填累计 · 按原表“合计”栏':`${period.range} · 按产品表自然周`)+(total==null?'':` · 已报产品 ¥${fmt(total)}`);
    root.querySelectorAll('[data-pd-period]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.pdPeriod===activePeriod));
    root.querySelectorAll('[data-pd-channel]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.pdChannel===activeChannel));
    if(total==null){root.querySelector('#pd-analysis').innerHTML=`<div class="pd-empty"><strong>这一期间还未填报</strong><p>${safe(channelName(activeChannel))}的原表单元格为空，收到明细后补齐。</p><button type="button" data-pd-period="total">查看11月累计</button></div>`;}
    else{
      const top=sorted.find(p=>p.value>0),count=items.filter(p=>p.value>0).length;
      root.querySelector('#pd-analysis').innerHTML=`<div class="pd-dashboard"><div class="pd-diagram">${donut(items,total)}<p class="pd-donut-caption">${total>0?'点击色环或右侧产品，联动查看销售去向':'本期原表产品销售额为0'}</p><div class="pd-diagram-key"><span><b>${count}</b> 款有动销</span>${top?`<span>首位占比 <b>${share(top.value,total)}</b></span>`:''}</div></div><div class="pd-ranking"><div class="pd-ranking-head"><span>产品</span><span>销售占比</span><span>金额 / 元</span></div>${sorted.map(p=>`<button type="button" class="pd-product-row" data-pd-product="${p.id}" aria-pressed="${p.id===activeProduct}"><span class="pd-product-name"><img src="${p.image}" alt="" loading="lazy"><span>${safe(p.name)}<i aria-hidden="true"><em style="width:${total>0&&p.value!=null?p.value/total*100:0}%;background:${p.color}"></em></i></span></span><span class="pd-product-share">${share(p.value,total)||((p.value===0&&total===0)?'0.00%':'')}</span><span class="pd-product-amount">${fmt(p.value)}</span></button>`).join('')}</div></div>`;
    }
    renderFocus(items,total);renderComposition();renderMatrix();
    if(focusProduct){root.querySelector(`.pd-product-row[data-pd-product="${focusProduct}"]`)?.focus({preventScroll:true});}
    animate();
  }
  function renderFocus(items,total){
    const p=items.find(p=>p.id===activeProduct),dest=data.channels.map(c=>({...c,value:entries(c.id).find(x=>x.id===p.id).value}));
    const productTotal=nsum(dest.map(x=>x.value)),max=Math.max(...dest.map(x=>x.value||0),1);
    root.querySelector('#pd-focus').innerHTML=`<div class="pd-focus" style="--product-color:${p.color}"><div class="pd-focus-product"><img src="${p.image}" alt="${safe(p.name)}透明产品图"><div><span class="label">SELECTED PRODUCT / ${safe(channelName(activeChannel))}</span><h4>${safe(p.name)}</h4><div class="pd-focus-numbers"><span>销售额 / 元<strong>${fmt(p.value)||'—'}</strong></span><span>${activeChannel==='all'?'全渠道产品占比':'本渠道产品占比'}<strong>${share(p.value,total)||'—'}</strong></span></div><p>${activeChannel==='all'?`下方查看这款产品分别在哪些渠道销售。`:productTotal>0&&p.value!=null?`本渠道贡献了这款产品全渠道销售额的 ${share(p.value,productTotal)}。`:'原表未填报的金额保持空白。'}</p></div></div><div class="pd-destination"><h4>这款产品，在哪些渠道卖</h4><div class="pd-destination-list">${ordered(dest).map(c=>`<button type="button" data-pd-channel="${c.id}" aria-label="查看${safe(c.name)}产品结构"><span>${safe(c.name)}</span><i><em style="width:${c.value==null?0:c.value/max*100}%"></em></i><b>${fmt(c.value)}</b></button>`).join('')}</div><small>金额 / 元 · 点击渠道联动上方结构</small></div></div>`;
  }
  function renderComposition(){
    root.querySelector('#pd-composition').innerHTML=data.channels.map(c=>{const items=entries(c.id),total=nsum(items.map(x=>x.value));return `<button type="button" class="pd-composition-row" data-pd-channel="${c.id}" aria-pressed="${c.id===activeChannel}" aria-label="查看${safe(c.name)}产品结构，已报${fmt(total)}元"><span>${safe(c.name)}</span><span class="pd-stack" aria-hidden="true">${items.filter(p=>p.value>0).map(p=>`<i style="width:${p.value/total*100}%;background:${p.color}" title="${safe(p.name)} ${share(p.value,total)}"></i>`).join('')}</span><b>${total==null?'待填报':fmt(total)}</b></button>`}).join('');
  }
  function renderMatrix(){
    root.querySelector('#pd-matrix').innerHTML=`<table><thead><tr><th>${safe(currentPeriod().label)}<br>渠道 / 产品</th>${data.products.map(p=>`<th>${safe(p.name)}</th>`).join('')}<th>产品合计</th></tr></thead><tbody>${[{id:'all',name:'全渠道已报'},...data.channels].map(c=>{const items=entries(c.id),total=nsum(items.map(p=>p.value));return `<tr><td>${safe(c.name)}</td>${items.map(p=>`<td>${fmt(p.value)}${p.value!=null&&total>0?`<br><small>${share(p.value,total)}</small>`:''}</td>`).join('')}<td><b>${fmt(total)}</b></td></tr>`}).join('')}</tbody></table>`;
  }
  function animate(){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('page-motion-paused'))return;
    root.querySelectorAll('.pd-donut,.pd-focus-product').forEach(el=>el.animate([{opacity:.65,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'cubic-bezier(.2,.8,.2,1)'}));
  }
  function exportCsv(){
    const rows=[['期间','渠道','产品','销售额（元）','本渠道产品占比'],...[{id:'all',name:'全渠道已报'},...data.channels].flatMap(c=>{const items=entries(c.id),total=nsum(items.map(x=>x.value));return items.map(p=>[currentPeriod().label,c.name,p.name,p.value??'',share(p.value,total)]);})];
    const quote=v=>'"'+String(v).replace(/"/g,'""')+'"';
    const url=URL.createObjectURL(new Blob(['\ufeff'+rows.map(r=>r.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`动力之巅_产品结构_${activePeriod}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  const boot=new MutationObserver(init);boot.observe(document.querySelector('#app'),{childList:true});init();
})();
