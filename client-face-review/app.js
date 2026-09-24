const all=[...(window.clientFaceData||[])];
let items=[...all],idx=0,mode='grid';
const $=id=>document.getElementById(id);
const esc=s=>(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function media(r){return r.pic?`<img class="face" src="${esc(r.pic)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.outerHTML='<div class=placeholder>?</div>'">`:`<div class="placeholder">?</div>`}
function info(r,large=false){return `<div class="name"${large?' style="font-size:22px"':''}>${esc(r.name)}</div><div class="company"${large?' style="font-size:16px"':''}>${esc(r.company)}</div><div class="category">${esc(r.category)}</div><a class="linkedin" href="${esc(r.linkedin)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">LinkedIn ↗</a>`}
function renderGrid(){
  $('grid').innerHTML=items.map(r=>`<div class="card" onclick="this.classList.toggle('revealed')">${media(r)}<div class="info">${info(r)}</div></div>`).join('');
  $('count').textContent=`${items.length} people • click a face to reveal in quiz mode`;
}
function renderFlash(){
  if(!items.length){$('flashMedia').innerHTML='';$('flashInfo').innerHTML='';$('count').textContent='0 people';return;}
  idx=(idx+items.length)%items.length;const r=items[idx];
  $('flashMedia').innerHTML=media(r);
  $('flashInfo').innerHTML=info(r,true);
  $('flashInfo').classList.add('hidden');
  $('count').textContent=`${idx+1} / ${items.length}`;
}
function setMode(m){
  mode=m;document.body.classList.toggle('quiz',m==='quiz');
  $('grid').style.display=m==='flash'?'none':'grid';$('flash').classList.toggle('on',m==='flash');
  ['gridBtn','quizBtn','flashBtn'].forEach(id=>$(id).classList.remove('active'));
  $(m==='grid'?'gridBtn':m==='quiz'?'quizBtn':'flashBtn').classList.add('active');
  m==='flash'?renderFlash():renderGrid();
}
const categories=[...new Set(all.map(r=>r.category))];
$('categoryFilter').innerHTML='<option value="">Everyone</option>'+categories.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
$('gridBtn').onclick=()=>setMode('grid');
$('quizBtn').onclick=()=>setMode('quiz');
$('flashBtn').onclick=()=>setMode('flash');
$('shuffleBtn').onclick=()=>{items.sort(()=>Math.random()-.5);idx=0;mode==='flash'?renderFlash():renderGrid();};
$('categoryFilter').onchange=e=>{items=all.filter(r=>!e.target.value||r.category===e.target.value);idx=0;mode==='flash'?renderFlash():renderGrid();};
$('revealBtn').onclick=()=>$('flashInfo').classList.toggle('hidden');
$('nextBtn').onclick=()=>{idx++;renderFlash();};
$('prevBtn').onclick=()=>{idx--;renderFlash();};
document.addEventListener('keydown',e=>{if(mode!=='flash')return;if(e.key==='ArrowRight'){idx++;renderFlash();}if(e.key==='ArrowLeft'){idx--;renderFlash();}if(e.key===' '){e.preventDefault();$('flashInfo').classList.toggle('hidden');}});
renderGrid();
