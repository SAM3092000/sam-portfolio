'use strict';

const one = (selector, root = document) => root.querySelector(selector);
const all = (selector, root = document) => [...root.querySelectorAll(selector)];
const byId = id => document.getElementById(id);
const projects = all('.project');
const filterButtons = all('[data-filter]');
const search = byId('project-search');
const limit = 7;
let organization = 'All';
let expandedIndex = false;

function refreshIndex() {
  const query = search.value.trim().toLocaleLowerCase();
  const matches = projects.filter(p =>
    (organization === 'All' || p.dataset.org === organization) &&
    p.textContent.toLocaleLowerCase().includes(query));
  const visible = new Set(expandedIndex || query ? matches : matches.slice(0, limit));
  projects.forEach(project => { project.hidden = !visible.has(project); });
  filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === organization)));
  byId('result').textContent = 'Showing ' + visible.size + ' of ' + matches.length + (matches.length === 1 ? ' project' : ' projects');
  byId('show-more').hidden = !!query || matches.length <= limit;
  byId('show-more').textContent = expandedIndex ? 'Show fewer projects ↑' : 'Show all ' + matches.length + ' projects ↓';
  byId('no-results').hidden = matches.length > 0;
}
filterButtons.forEach(button => button.addEventListener('click', () => {
  organization = button.dataset.filter;
  expandedIndex = false;
  refreshIndex();
}));
search.addEventListener('input', () => { expandedIndex = false; refreshIndex(); });
byId('show-more').addEventListener('click', () => {
  expandedIndex = !expandedIndex;
  refreshIndex();
  if (!expandedIndex) byId('archive').scrollIntoView({block:'start'});
});
byId('reset').addEventListener('click', () => {
  search.value = '';
  organization = 'All';
  expandedIndex = false;
  refreshIndex();
  search.focus();
});
refreshIndex();

const tabs = all('[data-lab]');
function selectLab(key, updateUrl = false) {
  if (!tabs.some(tab => tab.dataset.lab === key)) return;
  tabs.forEach(tab => {
    const active = tab.dataset.lab === key;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    byId(tab.getAttribute('aria-controls')).hidden = !active;
  });
  if (updateUrl) history.replaceState(null, '', '#lab-' + key);
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectLab(tab.dataset.lab, true));
  tab.addEventListener('keydown', e => {
    const next = {ArrowRight:(i + 1) % tabs.length, ArrowLeft:(i + tabs.length - 1) % tabs.length, Home:0, End:tabs.length - 1}[e.key];
    if (next === undefined) return;
    e.preventDefault();
    selectLab(tabs[next].dataset.lab, true);
    tabs[next].focus();
  });
});

// Keep bookmarks to earlier project titles pointing at the consolidated entries.
const formerProjects = new Map([
  ['policy', 'planner'], ['signals', 'planner'],
  ['sap', 'mrp'], ['kpi', 'mrp'],
  ['capstone', 'flight'], ['fleet', 'flight'],
  ['usage', 'churn'], ['aoi', 'feedback'],
  ['music', 'verzeo-ml'], ['face', 'verzeo-ml'], ['stocks', 'verzeo-ml'],
  ['incident', 'archive'], ['migration', 'archive']
]);
function showAnchor(hash) {
  const original = hash.slice(1);
  const id = formerProjects.get(original) || original;
  const target = byId(id);
  if (!target) return;
  if (id !== original) history.replaceState(history.state, '', '#' + id);
  if (target.classList.contains('lab-panel')) {
    selectLab(target.id.slice(4));
    byId('lab').scrollIntoView({block:'start'});
  } else if (target.classList.contains('project')) {
    if (target.hidden) {
      organization = 'All';
      expandedIndex = true;
      search.value = '';
      refreshIndex();
    }
    target.open = true;
    target.scrollIntoView({block:'start'});
  } else if (id !== original) {
    target.scrollIntoView({block:'start'});
  }
}
window.addEventListener('hashchange', () => showAnchor(location.hash));
showAnchor(location.hash);

const wave = byId('wave');
const greetings = ['Hi back!', 'Nice to meet you!', 'See you in the lab?'];
let waveCount = 0;
wave.addEventListener('click', () => {
  const character = one('.avatar-sway');
  character.classList.remove('again');
  void character.offsetWidth;
  character.classList.add('again');
  byId('speech').textContent = greetings[waveCount++ % greetings.length];
  wave.setAttribute('aria-label','Wave to Sam again');
  wave.children[1].textContent = 'Wave again';
});

const tour = byId('tour');
const caseDialog = byId('case-dialog');
const figureDialog = byId('figure-dialog');
const stops = [
  {tag:'Aviation strategy', title:'Where did $575M come from?', copy:'I wanted to know how much of the market for enhanced flight vision systems Honeywell could serve on new aircraft. Seven economic and industry signals helped me size a ten-year opportunity.', link:'#market', action:'See the market estimate'},
  {tag:'Honeywell operations', title:'What do planners ask all day?', copy:'How much stock is available? When will a part arrive? I built a plain-English assistant for those questions. It saved planners and buyers more than 25 hours of manual work a week.', link:'#planner', action:'Meet the planning assistant'},
  {tag:'ASU research', title:'What can the Pacific tell Arizona?', copy:'The answer changed when we crossed a state line. Pick Arizona, New Mexico, or Colorado to see how well our ocean indices explained winter rainfall.', link:'#lab-rain', action:'Compare the states'},
  {tag:'A little reality TV', title:'Would you trust a model with the final rose?', copy:'My teammates and I looked at 422 contestants. Take a guess at how often our neural network got the exact finishing place right.', link:'#lab-rose', action:'Try the question'}
];
let currentStop = 0;
function renderStop() {
  const stop = stops[currentStop];
  byId('tour-tag').textContent = stop.tag.toUpperCase();
  byId('tour-title').textContent = stop.title;
  byId('tour-text').textContent = stop.copy;
  byId('tour-count').textContent = (currentStop + 1) + ' / ' + stops.length;
  byId('tour-go').href = stop.link;
  byId('tour-go').textContent = stop.action + ' →';
  byId('tour-prev').disabled = currentStop === 0;
  byId('tour-next').textContent = currentStop === stops.length-1 ? 'Finish tour ✓' : 'Next stop →';
}
byId('open-tour').addEventListener('click', () => {currentStop=0;renderStop();tour.showModal();});
byId('tour-prev').addEventListener('click', () => { if (currentStop>0) { currentStop--;renderStop(); }});
byId('tour-next').addEventListener('click', () => {
  if (currentStop < stops.length-1) {currentStop++;renderStop();} else tour.close();
});
all('[data-close]').forEach(b=>b.addEventListener('click', () => b.closest('dialog').close()));
all('dialog').forEach(d=>d.addEventListener('click', e=>{
  if (e.target !== d) return;
  const r=d.getBoundingClientRect();
  if(e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) d.close();
}));
document.addEventListener('click', e => {
  const a=e.target.closest('a');
  if(!a || e.button!==0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
  if(a.hasAttribute('data-case')) {
    e.preventDefault();
    const project=byId(a.dataset.case);
    byId('case-org').textContent=project.dataset.org.toUpperCase() + ' AEROSPACE';
    byId('case-title').textContent=one('.ptitle',project).textContent;
    byId('case-copy').replaceChildren(...Array.from(one('.body',project).children,x=>x.cloneNode(true)));
    caseDialog.showModal();
    return;
  }
  if (a.hasAttribute('data-figure')) {
    e.preventDefault();
    const image = byId('figure-image');
    image.src = a.href;
    image.alt = a.querySelector('img')?.alt || a.dataset.caption;
    byId('figure-original').href = a.href;
    byId('figure-caption').textContent=a.dataset.caption;
    byId('figure-title').textContent=a.dataset.title;
    figureDialog.showModal();
    return;
  }
  const href=a.getAttribute('href')||'';
  if (!href.startsWith('#')) return;
  const dialog=a.closest('dialog');
  if(dialog) dialog.close();
  if(location.hash===href) {
    e.preventDefault();
    const target=byId(href.slice(1));
    if(target?.matches('.lab-panel,.project'))showAnchor(href);
    else target?.scrollIntoView({block:'start'});
  }
  if(dialog){
    const target=byId(href.slice(1));
    if(target)requestAnimationFrame(()=>{
      if(target.classList.contains('project'))one('summary',target).focus({preventScroll:true});
      if(target.classList.contains('lab-panel'))byId(target.getAttribute('aria-labelledby')).focus({preventScroll:true});
    });
  }
});

function setPressed(buttons, chosen) {
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===chosen)));
}
function writeObservation(id, heading, content) {
  const strong=document.createElement('b');
  strong.textContent=heading;
  byId(id).replaceChildren(strong,document.createElement('br'),document.createTextNode(content));
}
const signals=all('[data-r]');
signals.forEach(b=>b.addEventListener('click',()=>{
  setPressed(signals,b);
  const value=Number(b.dataset.r);
  const text=(value>0?'The two series tended to move in the same direction':'The two series tended to move in opposite directions')+' in this sample.';
  writeObservation('signal-note',b.dataset.name+' · '+one('strong',b).textContent,text);
}));
const states={
  az:['Arizona','26.2','The retained two-index model had an adjusted R² of 0.262. Much of the variation in winter rainfall remained unexplained.'],
  nm:['New Mexico','29.98','The retained model reached the highest adjusted R² of the three states. Niño 3.4 and the Atlantic index together explained part of the year-to-year variation.'],
  co:['Colorado','6.84','Even the model with higher-order terms explained little variation here. We left Colorado prediction intervals out of the report because the fit was so weak.']
};
const stateButtons=all('[data-state]');
stateButtons.forEach(b=>b.addEventListener('click',()=>{
  setPressed(stateButtons,b);
  const [name,percent,detail]=states[b.dataset.state];
  byId('rain-value').firstChild.textContent=percent;
  byId('rain-fill').style.width=percent+'%';
  byId('rain-caption').textContent=name+' · adjusted R² from the retained model';
  writeObservation('rain-note',name+' · '+percent+'%',detail);
}));
const ranges={
 inside:['8a','Interpolation','Inside the training range','On this exponential curve, the network tracked held-out points between observed inputs. Switch ranges to see what happened beyond them.','The prediction follows the exponential curve on held-out inputs within the training range.'],
 outside:['9a','Extrapolation','Outside the training range','Beyond the inputs used for training, the predicted curve diverged from the exponential function. A close fit inside the sampled region did not hold at its edge.','Predicted values diverge from the exponential curve outside the observed input range.']
};
const rangeButtons=all('[data-range]');
rangeButtons.forEach(b=>b.addEventListener('click',()=>{
  setPressed(rangeButtons,b);
  const key=b.dataset.range,[fig,mode,title,detail,alt]=ranges[key];
  byId('neural-chart').src='assets/net-'+key+'.webp';
  byId('neural-chart').alt='Original figure '+fig+'. '+alt;
  byId('neural-caption').textContent='Figure '+fig+' · '+mode;
  writeObservation('neural-note',title,detail);
}));
const guesses=all('[data-guess]');
guesses.forEach(b=>b.addEventListener('click',()=>{
  setPressed(guesses,b);
  byId('quiz-answer').textContent=(b.dataset.guess==='15'?'You got it! ':'Fewer than that! ')+'The model placed 15 of 130 contestants exactly (about 11.5%).';
}));

const indicatorButtons = all('[data-indicator]');
const indicatorPlots = all('[data-indicator-plot]');
indicatorButtons.forEach(button => button.addEventListener('click', () => {
  setPressed(indicatorButtons, button);
  for (const plot of indicatorPlots) {
    plot.hidden = plot.dataset.indicatorPlot !== button.dataset.indicator;
  }
}));
