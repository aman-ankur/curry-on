'use strict';
const $ = (s) => document.querySelector(s);
const storageKey = 'curry-on-v1';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch { saved = {}; }
function persist() { try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch { $('#check-status').textContent = 'Browser storage unavailable; changes last for this visit only.'; } }
function dayKey() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
const n = (v) => Math.round(v).toLocaleString('en-IN');
function mealTargets() {
  const kcal = Number($('#energy').value), carbs = (kcal - 110*4 - 65*9)/4;
  return {kcal,carbs,sat:kcal*0.06/9};
}
function renderMeals() {
 const t=mealTargets();
 $('#meal-sections').innerHTML=GUIDE.meals.map((m,i)=>`<article class="meal-block" id="${m.id}"><div class="meal-heading"><span class="meal-number">0${i+1}</span><div><h3>${m.title}</h3><p>${m.intro}</p></div></div><div class="meal-target"><span>WHOLE-MEAL PLANNING TARGET</span><strong>${m.target[0]} g protein</strong><strong>~${n(m.target[1]/270*t.carbs)} g carbs</strong><strong>${m.target[2]} g fat</strong></div><div class="table-wrap"><table class="meal-table"><caption>${m.title} options — choose one, adjust portions as needed</caption><thead><tr><th>Meal</th><th>Ingredients & portions</th><th>Preparation</th><th>Estimated meal macros</th></tr></thead><tbody>${m.options.map(o=>`<tr><th><span class="tag">${o.tag}</span>${o.name}</th><td data-label="Ingredients & portions">${o.ingredients}</td><td data-label="Preparation">${o.method}<p class="table-tip">${o.tip}</p></td><td class="macros" data-label="Estimated meal macros">${o.macros.split(' · ').map(v=>`<span>${v}</span>`).join('')}</td></tr>`).join('')}</tbody></table></div></article>`).join('');
 $('#snack-target').textContent=`Planning allowance: 20 g protein · ~${n(40/270*t.carbs)} g carbs · 10 g fat across snacks. Pick portions that complement the main meals.`;
}
function renderTargets() {
 const t=mealTargets();
 const rows=[['Energy',`${n(t.kcal)} kcal`,`${n(t.kcal*7)} kcal`,'Starting example. If weight drifts unintentionally, hunger persists or performance suffers, reassess portions and energy.'],['Protein','110 g','770 g','Spread across meals; around 25–35 g at main meals. This template is not a universal requirement.'],['Carbohydrate',`~${n(t.carbs)} g`,`~${n(t.carbs*7)} g`,'Mostly grains, pulses, vegetables, fruit and dairy. No need for a low-carb diet.'],['Total fat','65 g','455 g','Prefer unsaturated sources. This includes cooking oil, nuts, avocado, eggs, dairy and fish.'],['Saturated fat',`Less than ~${t.sat.toFixed(1)} g`,`Less than ~${n(t.sat*7)} g`,'Derived from <6% of planning energy. It is part of total fat, not an extra allowance.'],['Total fibre','30–35 g','210–245 g','A practical goal. Increase gradually with adequate fluids; reduce pace if bloated.'],['Soluble fibre','Build towards 5–10 g','35–70 g','Included within total fibre. Oats, barley, beans and fruit help; an extra 5–10 g/day can support LDL lowering.']];
 $('#target-body').innerHTML=rows.map(r=>`<tr><th>${r[0]}</th><td><strong>${r[1]}</strong></td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('');
 renderMeals();renderLabel();
}
function renderMovement() {
 const phase=Number($('#phase').value), days=Number($('#strength-days').value);
 const cardio=phase===1?[20,0,20,0,20,0,0]:phase===2?[25,0,25,0,25,25,0]:[20,30,20,30,20,30,0];
 const strength=days===3?['Full body A','—','Full body B','—','Full body A*','—','—']:['Upper A','Lower A','—','Upper B','Lower B','—','—'];
 const steps=phase===1?'6,000–6,500':phase===2?'~7,000':'7,000–8,000';
 const total=cardio.reduce((a,b)=>a+b,0);
 $('#movement-stats').innerHTML=`<div><b>${days}</b><span>strength sessions / week</span></div><div><b>${total}<small> min</small></b><span>moderate cardio / week</span></div><div><b>${steps}</b><span>daily step-average aim</span></div>`;
 $('#movement-caption').textContent=`${phase===1?'Weeks 1–2':phase===2?'Weeks 3–4':'Weeks 5–12'} · ${days} strength days · ${total} aerobic minutes`;
 $('#movement-body').innerHTML=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((d,i)=>`<tr><th>${d}</th><td>${strength[i]==='—'?'No lifting':`${strength[i]} · 45–60 min`}</td><td>${cardio[i]?`${cardio[i]} min brisk walk / cycle`:'Easy walking; no scheduled cardio'}</td><td>${i===6?'Comfortable recovery walk':'Walk in short breaks; steps include cardio walks'}</td></tr>`).join('')+`<tr class="table-summary"><th>Weekly total</th><td>${days} sessions${days===3?' · *next week B/A/B':''}</td><td>${total} moderate minutes</td><td>Daily average ${steps}; build gradually</td></tr>`;
}
let labelCustom=false;
function chooseProduct(){const p=GUIDE.products[Number($('#product').value)];$('#sat-per100').value=p.sat;$('#portion').value=p.portion;document.querySelectorAll('.unit').forEach(e=>e.textContent=p.unit);$('#product-note').textContent=p.note;labelCustom=false;renderLabel();}
function renderLabel(){
 const a=Number($('#sat-per100').value),b=Number($('#portion').value),p=GUIDE.products[Number($('#product').value)||0];
 if($('#sat-per100').value===''||$('#portion').value===''||!Number.isFinite(a)||!Number.isFinite(b)||a<0||a>100||b<=0||b>1000){$('#label-result').textContent='Enter a valid label value (0–100) and serving (1–1,000).';return;}
 const g=a*b/100,prefix=p.less&&!labelCustom?'<':'';
 $('#label-result').innerHTML=`<strong>${prefix}${g.toFixed(2)} g</strong> saturated fat in this serving<span>${prefix}${Math.round(g/mealTargets().sat*100)}% of the selected day’s example limit. ${g>=mealTargets().sat?'This serving alone reaches or exceeds it.':'Consider the rest of the day too.'}</span>`;
}
function renderChecks(){
 const today=dayKey();if(saved.checkDate!==today){saved.checkDate=today;saved.checks=[];persist();}
 const labels=['Included oats, pulses or another soluble-fibre food','Built meals around a lean or plant protein','Made a lower-saturated-fat choice','Moved towards today’s walking / cardio plan','Protected a consistent sleep window'];
 const ticks=Array.isArray(saved.checks)?saved.checks:[];
 $('#checks').innerHTML=labels.map((s,i)=>`<label><input type="checkbox" data-check="${i}" ${ticks.includes(i)?'checked':''}><span>${s}</span></label>`).join('');
 $('#check-status').textContent=`${ticks.length} of ${labels.length} habits checked today. Consistency matters more than a perfect day.`;
 $('#checks').querySelectorAll('input').forEach(e=>e.addEventListener('change',()=>{saved.checks=[...$('#checks').querySelectorAll('input:checked')].map(e=>Number(e.dataset.check));persist();renderChecks();}));
}
if(['1900','2100','2300','2500'].includes(String(saved.energy)))$('#energy').value=saved.energy;
if(['1','2','3'].includes(String(saved.phase)))$('#phase').value=saved.phase;
if(['3','4'].includes(String(saved.strength)))$('#strength-days').value=saved.strength;
$('#product').innerHTML=GUIDE.products.map((p,i)=>`<option value="${i}">${p.name}</option>`).join('');
$('#product').addEventListener('change',chooseProduct);
$('#sat-per100').addEventListener('input',()=>{labelCustom=true;renderLabel();});$('#portion').addEventListener('input',renderLabel);
$('#energy').addEventListener('change',()=>{saved.energy=$('#energy').value;persist();renderTargets();});
for(const id of ['phase','strength-days'])$(`#${id}`).addEventListener('change',()=>{saved.phase=$('#phase').value;saved.strength=$('#strength-days').value;persist();renderMovement();});
$('#reset-checks').addEventListener('click',()=>{saved.checks=[];persist();renderChecks();});
$('#clear-storage').addEventListener('click',()=>{try{localStorage.removeItem(storageKey);}catch{}saved={};$('#energy').value='2100';$('#phase').value='1';$('#strength-days').value='3';renderTargets();renderMovement();renderChecks();});
document.querySelectorAll('.print').forEach(b=>b.addEventListener('click',()=>window.print()));
chooseProduct();renderTargets();renderMovement();renderChecks();
document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderChecks();});
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){document.querySelectorAll('.nav a').forEach(a=>a.classList.toggle('active',a.hash===`#${e.target.id}`));}}),{rootMargin:'-15% 0px -65% 0px'});
document.querySelectorAll('section[id]').forEach(s=>observer.observe(s));
