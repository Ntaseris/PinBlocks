let project=null,spaces={},currentMode=null,currentView='settings',nextRule=1,nextBlock=1,componentType=null,actionRule=null,componentEditing=null,healthOpen=false;
const L={
rules:['Rules','A rule is a simple “when this happens, do this” instruction. PinBlocks converts rules into MPF sections such as variable_player and event_player.'],
shots:['Shots','A shot gives a meaningful game name to a switch or group of switches. Instead of thinking only about hardware, you can build rules around “left_ramp” or “target_a”.'],
counters:['Counters','Use a counter when you want something to happen after the player does something a certain number of times.'],
timers:['Timers','Use a timer when a rule should last for a limited amount of time or something should happen when time runs out.'],
settings:['Mode Settings','A mode is a group of rules that becomes active when its start event happens and inactive when its stop event happens.'],
test:['Test Mode','This simulator lets you fire beginner-level triggers without running the physical machine. Watch score, counters, timers and events change.']
};
function ws(){return spaces[currentMode]}
async function api(path,body){let r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return await r.json()}
function auditGeneratedMode(){
 let d=diagnostics();
 if(d.errors.length)console.error('Generated mode has errors:',d.errors);
 if(d.warnings.length)console.warn('Generated mode warnings:',d.warnings);
 return d;
}
async function pickProjectFolder(){
 const statusEl=document.getElementById('status');
 statusEl.textContent='Choose your game folder…';
 try{
   const d=await api('/api/pick-folder',{});
   if(d.error){statusEl.textContent='Folder picker unavailable.';return alert(d.error)}
   if(!d.path){statusEl.textContent=project?'Project loaded.':'No project loaded.';return}
   document.getElementById('projectPath').value=d.path;
   const shown=document.getElementById('selectedPath');if(shown)shown.textContent=d.path;
   await openProject();
 }catch(e){
   statusEl.textContent='Folder picker failed.';
   alert('PinBlocks error: '+(e&&e.message?e.message:String(e)));
 }
}
async function openProject(){
 const statusEl=document.getElementById('status');
 const pathEl=document.getElementById('projectPath');
 const shown=document.getElementById('selectedPath');if(shown&&pathEl.value.trim())shown.textContent=pathEl.value.trim();
 statusEl.textContent='Reading project...';
 try{
   let d=await api('/api/open',{path:document.getElementById('projectPath').value});
   if(d.error){statusEl.textContent='Could not load project.';return alert(d.error)}
   project=d;spaces={};
   for(let m of project.modes)spaces[m]=blank(m,false);
   currentMode=null;
   document.getElementById('stats').innerHTML=[['Switches',d.counts.switches],['Modes',d.counts.modes],['Counters',d.counts.counters],['Timers',d.counts.timers]].map(x=>`<div class=stat><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');
   statusEl.textContent=`${d.project_name} · ${d.files_read} YAML files`;
   document.getElementById('projectNav').style.display='block';
   refreshModes();
   projectHome();
 }catch(e){
   statusEl.textContent='Load failed.';
   console.error(e);
   alert('PinBlocks error: '+(e&&e.message?e.message:String(e)));
 }
}
function blank(n,isNew){return{name:n,isNew,settings:{start:'',stop:'',priority:100,version:6},rules:[],shots:{},counters:{},timers:{},events:new Set(),sim:null}}
function refreshModes(){
 const names=Object.keys(spaces).sort();
 document.getElementById('modeSelect').innerHTML=`<option value="">Choose a mode…</option>`+names.map(n=>`<option ${n===currentMode?'selected':''}>${esc(n)}</option>`).join('');
}
function projectHome(){
 let status=document.getElementById('loadStatus');if(status)status.textContent='Project loaded.';
 currentMode=null;currentView='settings';
 document.getElementById('modeSelect').value='';
 document.getElementById('builderNav').style.display='none';
 document.getElementById('work').style.display='none';
 document.getElementById('empty').style.display='block';
 let d=project;
 document.getElementById('empty').className='projectHome';
 document.getElementById('empty').innerHTML=`<span class=badge>PROJECT LOADED</span><h2>${esc(d.project_name)}</h2><p>Your machine is ready. New to PinBlocks? Start with the guided build.</p>
 <div class=firstModeHero><div class=guideEyebrow>START HERE</div><h2>Build Your First Mode</h2><p>Learn the basics by building a small working mode with the real switches in <b>${esc(d.project_name)}</b>. PinBlocks takes you through one step at a time.</p><div class=homeGuideTrack><div><span>1</span><b>SHOT</b><small>Choose a switch</small></div><div><span>2</span><b>COUNTER</b><small>Set a goal</small></div><div><span>3</span><b>RULE</b><small>Connect gameplay</small></div><div><span>4</span><b>TEST</b><small>Prove it works</small></div></div><button class=primary onclick="startFirstModeTutorial()">Start Guided Build →</button></div>
 <div class=projectSummary><div><b>${d.counts.switches}</b>switches</div><div><b>${d.counts.modes}</b>modes</div><div><b>${d.counts.counters}</b>counters</div><div><b>${d.counts.timers}</b>timers</div></div>
 <div class=homeChoices><div class=homeChoice><h3>Build Freely</h3><p class=small>Already know the basics? Start with an empty mode.</p><button onclick="openModeWizard()">＋ Build a New Mode</button><button style="margin-top:8px" onclick="openRandomMode()"><span class=randomMark>?</span> Generate Random Mode</button></div>
 <div class=homeChoice><h3>Open an Existing Mode</h3><p class=small>Explore one of your ${d.counts.modes} modes and see the parts PinBlocks recognizes.</p><div class=homeModeRow><select id=homeModeSelect><option value="">Choose a mode…</option>${Object.keys(spaces).sort().map(n=>`<option>${esc(n)}</option>`).join('')}</select><button onclick="openHomeMode()">Open</button></div></div></div>
 <div class="card projectFinder"><b>Find something in your machine</b><input id=deviceSearch placeholder="Search switches, coils, lights or modes…" oninput="searchProjectItems(this.value)"><div id=deviceSearchResults class="small finderResults">Type at least 2 letters.</div></div>
 <div class=hint style="margin-top:18px"><b>Why load your project?</b> PinBlocks uses the configuration already in your MPF project so you can build with your real machine.</div>`;
 {let el=document.getElementById('learnTitle');if(el)el.textContent='Project Home';}
 {let el=document.getElementById('learnText');if(el)el.textContent='If this is your first time, Guided Build is the best place to start. Otherwise you can build freely, generate an example, or explore an existing mode.';}
 {let el=document.getElementById('learnYaml');if(el)el.innerHTML='PinBlocks reads your project so the builder can use real machine names and structure.';}
}
async function openHomeMode(){
 const e=document.getElementById('homeModeSelect');
 if(!e||!e.value)return alert('Choose a mode first.');
 await loadExistingMode(e.value);
}
async function loadExistingMode(n){
 try{
   let d=await api('/api/import-mode',{name:n});
   if(d.error)return alert(d.error);
   d.events=new Set(d.events||[]);
   d.sim=null;
   spaces[n]=d;
   nextRule=Math.max(nextRule,...(d.rules||[]).map(r=>Number(r.id||0)+1),1);
   let bids=[];for(let r of d.rules||[]){bids.push(Number(r.trigger?.id||0));for(let a of r.actions||[])bids.push(Number(a.id||0))}
   nextBlock=Math.max(nextBlock,...bids.map(x=>x+1),1);
   switchMode(n);
 }catch(e){alert('Could not import mode: '+(e.message||e))}
}
function switchMode(n){
 if(!n||!spaces[n])return projectHome();
 if(!spaces[n].isNew&&!spaces[n].imported){loadExistingMode(n);return}
 currentMode=n;
 document.getElementById('empty').style.display='none';
 document.getElementById('work').style.display='block';
 document.getElementById('builderNav').style.display='block';
 refreshModes();
 render();
}
function nextGuidedModeName(){const used=new Set(Object.keys(spaces||{}));let base='target_practice';if(!used.has(base))return base;let i=2;while(used.has(`${base}_${i}`))i++;return `${base}_${i}`;}
function openModeWizard(){wmName.value=tutorialActive?nextGuidedModeName():'target_practice';wmStart.value='ball_started';wmStop.value='ball_ended';wmPriority.value=100;wmVersion.value=detectVersion();modeModal.style.display='flex'}
function detectVersion(){return 6}
function wizardStartChoice(){if(wmStartChoice.value!=='custom')wmStart.value=wmStartChoice.value;else wmStart.value='start_my_mode'}
function wizardStopChoice(){if(wmStopChoice.value!=='custom')wmStop.value=wmStopChoice.value;else wmStop.value='stop_my_mode'}
function createMode(){let n=wmName.value.trim().replace(/\s+/g,'_');if(!n)return alert('Give the mode a name.');if(spaces[n])return alert('That mode already exists.');let w=blank(n,true);w.settings={start:wmStart.value.trim(),stop:wmStop.value.trim(),priority:Number(wmPriority.value||100),version:Number(wmVersion.value||6)};spaces[n]=w;currentMode=n;modeModal.style.display='none';
document.getElementById('empty').style.display='none';document.getElementById('work').style.display='block';document.getElementById('builderNav').style.display='block';refreshModes();
if(tutorialActive){view('components');setTimeout(guidedHighlight,0);return;}
view('settings')}
function teach(topic){
 const x={
 shot:['Shot','A shot gives a gameplay name to something the player can hit, like a ramp, lane, orbit or standup.','MPF stores these under <code>shots:</code>.'],
 counter:['Counter','A counter remembers repetitions. Example: hit a target 3 times to finish a goal.','MPF stores these under <code>counters:</code>.'],
 timer:['Timer','A timer creates a countdown or timed window. Example: make a shot within 20 seconds.','MPF stores these under <code>timers:</code>.'],
 rule:['Rule','A rule is cause and effect: WHEN something happens → DO something.','MPF reacts to events through configuration such as config players.'],
 event:['Event','An event is MPF’s message that something happened. One part of a mode can post an event and another can react to it.','MPF is event-driven.'],
 priority:['Mode Priority','Priority matters when active modes compete for behavior. Most beginner modes can leave the default alone.','This is part of the MPF <code>mode:</code> configuration.'],
 progression:['Shot Progression','Progression lets a shot move through states such as unlit → lit → complete.','MPF uses shot profiles and states for this.']
 }[topic];if(!x)return;document.getElementById('learnTitle').textContent=x[0];document.getElementById('learnText').textContent=x[1];document.getElementById('learnYaml').innerHTML=x[2];
}
function view(v){currentView=v;render()}
function render(){
 if(!ws())return;
 try{
   document.getElementById('modeTitle').textContent=currentMode;
   document.getElementById('modeBadge').textContent=ws().isNew?'NEW MODE':'MODE SANDBOX';
   for(let x of ['Settings','Components','Rules','Overview','Test','Export','Reference']){
     let e=document.getElementById('nav'+x);if(e)e.classList.toggle('active',x.toLowerCase()===currentView);
   }
   let fn={settings:renderSettings,components:renderComponents,rules:renderRules,overview:renderOverview,test:renderTest,export:renderExport,reference:renderReference}[currentView];
   if(!fn)throw new Error('Unknown builder page: '+currentView);
   let importBanner='';if(ws().imported){let s=ws().importSummary||{};importBanner=`<div class="hint importBanner"><b>Imported existing MPF mode</b><br>PinBlocks recognized ${s.shots||0} shot(s), ${s.counters||0} counter(s), ${s.timers||0} timer(s), and ${s.rules||0} visual rule(s).${s.unsupported?` <b>${s.unsupported} item(s) could not be safely translated.</b>`:''}${s.unsupported?`<details><summary>Show unvisualized MPF</summary><ul>${(ws().unsupported||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>`:''}<div class=small>The original project files have not been changed.</div></div>`}document.getElementById('content').innerHTML=tutorialPanel()+(tutorialActive?'':healthHtml())+importBanner+fn();setTimeout(guidedHighlight,0);
   let l={settings:['Set Up Mode','Choose when this mode becomes active and when it stops. PinBlocks handles the basic MPF mode header for you.'],components:['Components','Shots are things the player shoots. Counters remember repetitions. Timers create time windows. Start with only what your mode needs.'],rules:['Build Rules','A rule connects cause and effect: WHEN something happens → DO one or more things. Example: WHEN a ramp shot is made → score points AND advance a counter. Keep lights, shows and display presentation separate until the gameplay logic works.'],overview:['Mode Overview','Read the mode as gameplay before thinking about YAML.'],test:['Test','Practice the logic here before running MPF. Trigger inputs and watch score, counters, timers and events change.'],export:['Export','Review what PinBlocks generated. Modes you build can be copied, downloaded, or installed into the loaded project.'],reference:['Reference','You do not need to memorize MPF. Use these links when you want to understand what PinBlocks is creating underneath.']}[currentView];
   document.getElementById('learnTitle').textContent=l[0];document.getElementById('learnText').textContent=l[1];document.getElementById('learnYaml').innerHTML=learnFor(currentView);
   compile();renderRegistry();
 }catch(e){
   console.error(e);
   document.getElementById('content').innerHTML=`<div class=debugError><b>PinBlocks hit a UI error.</b><br>${esc(e.message||e)}<br><br>This message is shown here instead of pretending the server disconnected.</div>`;
 }
}
function learnFor(v){return({settings:'MPF uses the <code>mode:</code> section for things such as start events, stop events and priority.',components:'PinBlocks turns these into real MPF sections such as <code>shots:</code>, <code>counters:</code> and <code>timers:</code>.',rules:'MPF is event-driven. PinBlocks translates beginner rules into MPF events and config-player sections such as <code>variable_player:</code> and <code>event_player:</code>.',overview:'This view only summarizes the components and rules PinBlocks recognizes. It does not add configuration.',test:'This is a PinBlocks practice simulation. MPF, Godot and your physical hardware are not running here.',export:'Your mode becomes MPF YAML. Install Mode can also create the mode folder and register it in the project.',reference:'Official MPF documentation is the source of truth. PinBlocks intentionally teaches a smaller, useful subset.'})[v]}
function renderSettings(){let s=ws().settings;return`<div class=card><h3>Mode Settings <button class=learnChip onclick="teach('priority')">Explain priority</button></h3><div class=hint>Every mode YAML needs some basic setup. PinBlocks keeps it here so you do not have to memorize the header.</div><div class=grid3><div class=field><label>START EVENT</label><input value="${esc(s.start)}" oninput="ws().settings.start=this.value;compile()"><div class=help>When MPF should activate this mode.</div></div><div class=field><label>STOP EVENT</label><input value="${esc(s.stop)}" oninput="ws().settings.stop=this.value;compile()"><div class=help>When MPF should deactivate it.</div></div><div class=field><label>PRIORITY</label><input type=number value="${s.priority}" oninput="ws().settings.priority=Number(this.value);compile()"></div></div><div class=field style="max-width:180px"><label>CONFIG VERSION</label><input value="${s.version}" oninput="ws().settings.version=Number(this.value);compile()"><div class=help>Usually leave this alone.</div></div></div><button class=nextbtn onclick="view('components')">Next: Game Components →</button>`}
function block(t,v){return{id:nextBlock++,type:t,value:v}}
function chooseTrigger(t){if((t==='shot'&&!Object.keys(ws().shots).length)||(t==='counter_complete'&&!Object.keys(ws().counters).length)||(t==='timer_complete'&&!Object.keys(ws().timers).length)){alert('Create that component in Step 2 first.');return}newRule(t);triggerModal.style.display='none'}
function openActions(id){actionRule=id;actionModal.style.display='flex'}
function chooseAction(t){if(['light_on','light_off','light_stop','light_color','light_fade'].includes(t)&&!(project.items.lights||[]).length){alert('PinBlocks did not find any lights in this MPF project.');return}if((t==='advance_counter'&&!Object.keys(ws().counters).length)||(['start_timer','stop_timer','reset_timer','restart_timer'].includes(t)&&!Object.keys(ws().timers).length)){alert('Create that component in Step 2 first.');return}let r=ws().rules.find(x=>x.id===actionRule);r.actions.push(block(t,defaultVal(t)));actionModal.style.display='none';render()}
function defaultVal(t){if(t==='switch')return project.items.switches[0]||'';if(t==='event')return'all_rules';if(t==='counter_complete')return Object.keys(ws().counters)[0]||'';if(t==='timer_complete')return Object.keys(ws().timers)[0]||'';if(t==='shot')return Object.keys(ws().shots)[0]||'';if(t==='score')return 1000;if(t==='light_on')return{light:(project.items.lights||[])[0]||'',color:'on'};if(t==='light_off')return{light:(project.items.lights||[])[0]||'',color:'off'};if(t==='light_color')return{light:(project.items.lights||[])[0]||'',color:'white'};if(t==='light_fade')return{light:(project.items.lights||[])[0]||'',color:'white',fade:'500ms'};if(t==='light_stop')return{light:(project.items.lights||[])[0]||''};if(t==='post_event')return'my_event';if(t==='advance_counter')return Object.keys(ws().counters)[0]||'';if(['start_timer','stop_timer','reset_timer','restart_timer'].includes(t))return Object.keys(ws().timers)[0]||''}
function newRule(t){if((t==='counter_complete'&&!Object.keys(ws().counters).length)||(t==='timer_complete'&&!Object.keys(ws().timers).length)||(t==='shot'&&!Object.keys(ws().shots).length))return alert('Create that component first.');ws().rules.push({id:nextRule++,open:true,trigger:block(t,defaultVal(t)),actions:[]});render()}
function addAction(t){let r=ws().rules.at(-1);if(!r)return alert('Start a rule first.');if((t==='advance_counter'&&!Object.keys(ws().counters).length)||(['start_timer','stop_timer','reset_timer','restart_timer'].includes(t)&&!Object.keys(ws().timers).length))return alert('Create that component first.');r.actions.push(block(t,defaultVal(t)));r.open=true;render()}
function cloneBlockForRule(b){let value=(b&&b.value&&typeof b.value==='object')?JSON.parse(JSON.stringify(b.value)):b.value;return{id:nextBlock++,type:b.type,value}}
function duplicateRule(id){let src=ws().rules.find(x=>x.id===id);if(!src)return;let copy={id:nextRule++,open:true,trigger:cloneBlockForRule(src.trigger),actions:(src.actions||[]).map(cloneBlockForRule)};let i=ws().rules.findIndex(x=>x.id===id);ws().rules.splice(i+1,0,copy);render()}
function toggleRule(id){let r=ws().rules.find(x=>x.id===id);r.open=!r.open;render()}
function removeRule(id){ws().rules=ws().rules.filter(x=>x.id!==id);render()}
function moveRule(id,dir){let a=ws().rules,i=a.findIndex(x=>x.id===id),j=i+dir;if(i<0||j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];render()}
function moveAction(rid,bid,dir){let r=ws().rules.find(x=>x.id===rid),a=r.actions,i=a.findIndex(x=>x.id===bid),j=i+dir;if(i<0||j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];render()}

let compactRules=false;
function toggleRuleDensity(){compactRules=!compactRules;render()}
function renderRules(){let all=ws().rules||[],shown=all.map((r,i)=>({r,i}));let body=shown.map(({r,i})=>`<div class="rule ${compactRules?'compactRule':''} ${!r.actions.length?'incompleteRule':''}"><div class=rulehead onclick="toggleRule(${r.id})"><div><b>${r.open?'▼':'▶'} RULE ${i+1}</b><span class=summary>${esc(summary(r))}</span></div><div class=ruleTools><button onclick="event.stopPropagation();duplicateRule(${r.id})">Duplicate</button><button onclick="event.stopPropagation();moveRule(${r.id},-1)">↑ Move</button><button onclick="event.stopPropagation();moveRule(${r.id},1)">↓ Move</button><button class=danger onclick="event.stopPropagation();removeRule(${r.id})">Remove</button></div></div>${r.open?`<div class=rulebody>${node(r.trigger,r.id,true)}${r.actions.map(a=>`<div class=arrow>↓</div>${node(a,r.id,false)}`).join('')}<div class=add><button class="${!r.actions.length?'primary firstActionCta':''}" onclick="openActions(${r.id})">${!r.actions.length?'＋ Add the first action':'＋ Add another action'}</button></div></div>`:''}</div>`).join('');return `<h2>3. Build Rules <button class=learnChip onclick="teach('rule')">What is a rule?</button> <button class=learnChip onclick="teach('event')">What is an event?</button></h2><div class=hint>Build gameplay as a chain: <b>WHEN something happens → DO one or more things.</b>
<div class="ruleExamples">
<span><b>WHEN</b> left_ramp is made</span><span class="ruleFlow">THEN</span>
<span><b>DO</b> score 5,000</span><span class="ruleFlow">AND</span>
<span><b>DO</b> advance jackpot_counter</span>
</div></div><div class=ruleSearchBar><button onclick="toggleRuleDensity()" ${all.length?'':'disabled title="Create a rule first"'}>${compactRules?'Comfortable':'Compact'} view</button><span>${all.length ? `${all.length} rule${all.length===1?'':'s'}` : 'No rules yet'}</span></div>${tutorialActive||!all.length?'':validationHtml()}${body||'<div class=hint><b>No rules yet.</b> Create your first WHEN → DO rule below.</div>'}<div class=wizardbox><h3>Add a rule</h3><button class=primary onclick="triggerModal.style.display='flex'">＋ Create Rule</button></div><button class=nextbtn onclick="view('test')">Next: Test Your Mode →</button>`}
function summary(r){
 let trigger=triggerText(r.trigger).replace(/^WHEN\s+/,'');
 if(!r.actions.length)return`${trigger} → NEEDS AN ACTION`;
 let first=actionText(r.actions[0]),more=r.actions.length>1?` + ${r.actions.length-1} more`:'';
 return`${trigger} → ${first}${more}`;
}
function choices(obj,val){return Object.keys(obj).map(x=>`<option ${x===val?'selected':''}>${esc(x)}</option>`).join('')}
function node(b,rid,trig){let ctl='';if(b.type==='switch')ctl=`<select onchange="setv(${rid},${b.id},this.value)">${project.items.switches.map(x=>`<option ${x===b.value?'selected':''}>${esc(x)}</option>`).join('')}</select>`;if(b.type==='shot')ctl=`<select onchange="setv(${rid},${b.id},this.value)">${choices(ws().shots,b.value)}</select>`;if(b.type==='counter_complete'||b.type==='advance_counter')ctl=`<select onchange="setv(${rid},${b.id},this.value)">${choices(ws().counters,b.value)}</select>`;if(['timer_complete','start_timer','stop_timer','reset_timer','restart_timer'].includes(b.type))ctl=`<select onchange="setv(${rid},${b.id},this.value)">${choices(ws().timers,b.value)}</select>`;if(b.type==='event'||b.type==='post_event')ctl=`<input value="${esc(b.value)}" oninput="setvNoRender(${rid},${b.id},this.value)">`;if(b.type==='score')ctl=`<input type=number value="${b.value}" oninput="setvNoRender(${rid},${b.id},this.value)">`;if(['light_on','light_off','light_stop','light_color','light_fade'].includes(b.type)){let v=b.value||{light:'',color:b.type==='light_off'?'off':'on'},opts=(project.items.lights||[]).map(x=>`<option ${x===v.light?'selected':''}>${esc(x)}</option>`).join('');ctl=`<select onchange="setLightField(${rid},${b.id},'light',this.value)">${opts}</select>${['light_color','light_fade'].includes(b.type)?`<div class=lightColorRow><label>COLOR</label><input value="${esc(v.color||'white')}" placeholder="red, blue, FF8800…" oninput="setLightFieldNoRender(${rid},${b.id},'color',this.value)"></div>`:''}${b.type==='light_fade'?`<div class=lightColorRow><label>FADE</label><input value="${esc(v.fade||'500ms')}" placeholder="500ms, 1s…" oninput="setLightFieldNoRender(${rid},${b.id},'fade',this.value)"></div>`:''}`;}return`<div class=node><div class=kind>${label(b.type)}</div>${ctl}${trig?`<div class=actionTools><button onclick="editTrigger(${rid})">Edit</button></div>`:`<div class=actionTools><button onclick="editAction(${rid},${b.id})">Edit</button><button onclick="moveAction(${rid},${b.id},-1)">↑ Move</button><button onclick="moveAction(${rid},${b.id},1)">↓ Move</button><button class=danger onclick="removeBlock(${rid},${b.id})">Remove</button></div>`}</div>`}

function triggerTypeOptions(selected){let types=[['switch','Switch hit'],['shot','Shot made'],['counter_complete','Counter complete'],['timer_complete','Timer complete'],['event','MPF event']];return types.map(([v,n])=>`<option value="${v}" ${v===selected?'selected':''}>${n}</option>`).join('')}
function triggerValueEditor(type,value){if(type==='switch')return `<label>SWITCH</label><select id=editTriggerValue>${(project.items.switches||[]).map(x=>`<option ${x===value?'selected':''}>${esc(x)}</option>`).join('')}</select>`;if(type==='shot')return `<label>SHOT</label><select id=editTriggerValue>${Object.keys(ws().shots).map(x=>`<option ${x===value?'selected':''}>${esc(x)}</option>`).join('')}</select>`;if(type==='counter_complete')return `<label>COUNTER</label><select id=editTriggerValue>${Object.keys(ws().counters).map(x=>`<option ${x===value?'selected':''}>${esc(x)}</option>`).join('')}</select>`;if(type==='timer_complete')return `<label>TIMER</label><select id=editTriggerValue>${Object.keys(ws().timers).map(x=>`<option ${x===value?'selected':''}>${esc(x)}</option>`).join('')}</select>`;return `<label>EVENT NAME</label><input id=editTriggerValue value="${esc(value||'')}" placeholder="my_event">`}
function editTrigger(rid){let r=ws().rules.find(x=>x.id===rid);if(!r)return;let modal=document.getElementById('editTriggerModal'),box=document.getElementById('editTriggerBody');box.innerHTML=`<h2>Edit WHEN</h2><p class=small>Change what starts this rule. The DO actions stay attached.</p><div class=editActionFields><label>TRIGGER TYPE</label><select id=editTriggerType onchange="refreshTriggerEditValue(${rid})">${triggerTypeOptions(r.trigger.type)}</select><div id=editTriggerValueMount>${triggerValueEditor(r.trigger.type,r.trigger.value)}</div></div><div class=modalBtns><button onclick="editTriggerModal.style.display='none'">Cancel</button><button class=primary onclick="saveTriggerEdit(${rid})">Save Changes</button></div>`;modal.style.display='flex'}
function refreshTriggerEditValue(rid){let r=ws().rules.find(x=>x.id===rid),type=document.getElementById('editTriggerType').value,fallback=defaultVal(type),current=type===r.trigger.type?r.trigger.value:fallback;document.getElementById('editTriggerValueMount').innerHTML=triggerValueEditor(type,current)}
function saveTriggerEdit(rid){let r=ws().rules.find(x=>x.id===rid);if(!r)return;let type=document.getElementById('editTriggerType').value,value=document.getElementById('editTriggerValue').value;if(type==='shot'&&!Object.keys(ws().shots).length)return alert('Create a shot first.');if(type==='counter_complete'&&!Object.keys(ws().counters).length)return alert('Create a counter first.');if(type==='timer_complete'&&!Object.keys(ws().timers).length)return alert('Create a timer first.');r.trigger.type=type;r.trigger.value=value;document.getElementById('editTriggerModal').style.display='none';render()}
function actionTypeOptions(selected){let types=[['score','Score points'],['advance_counter','Advance a counter'],['start_timer','Start a timer'],['stop_timer','Stop a timer'],['reset_timer','Reset a timer'],['restart_timer','Restart a timer'],['post_event','Post an event'],['light_on','Turn a light on'],['light_off','Turn a light off'],['light_color','Set a light color'],['light_fade','Fade a light'],['light_stop','Release a light']];return types.map(([v,n])=>`<option value="${v}" ${v===selected?'selected':''}>${n}</option>`).join('')}
function changeActionType(rid,bid,type){let b=findb(rid,bid);if(!b||b.type===type)return;if(type==='advance_counter'&&!Object.keys(ws().counters).length)return alert('Create a counter first.');if(['start_timer','stop_timer','reset_timer','restart_timer'].includes(type)&&!Object.keys(ws().timers).length)return alert('Create a timer first.');if(['light_on','light_off','light_stop','light_color','light_fade'].includes(type)&&!(project.items.lights||[]).length)return alert('PinBlocks did not find any lights.');b.type=type;b.value=defaultVal(type);editAction(rid,bid)}
function editAction(rid,bid){
 let b=findb(rid,bid);if(!b)return;
 let body='',title=actionText(b),lights=(project.items.lights||[]);
 if(b.type==='score')body=`<label>POINTS</label><input id=editActionValue type=number value="${Number(b.value||0)}">`;
 else if(b.type==='post_event')body=`<label>EVENT NAME</label><input id=editActionValue value="${esc(b.value||'')}">`;
 else if(b.type==='advance_counter')body=`<label>COUNTER</label><select id=editActionValue>${Object.keys(ws().counters).map(x=>`<option ${x===b.value?'selected':''}>${esc(x)}</option>`).join('')}</select>`;
 else if(['start_timer','stop_timer','reset_timer','restart_timer'].includes(b.type))body=`<label>TIMER</label><select id=editActionValue>${Object.keys(ws().timers).map(x=>`<option ${x===b.value?'selected':''}>${esc(x)}</option>`).join('')}</select>`;
 else if(['light_on','light_off','light_stop','light_color','light_fade'].includes(b.type)){
   let v=b.value||{},opts=lights.map(x=>`<option ${x===v.light?'selected':''}>${esc(x)}</option>`).join('');
   body=`<label>LIGHT</label><select id=editActionLight>${opts}</select>`;
   if(b.type==='light_color'||b.type==='light_fade')body+=`<label>COLOR</label><input id=editActionColor value="${esc(v.color||'white')}" placeholder="red, blue, FF8800…">`;
   if(b.type==='light_fade')body+=`<label>FADE TIME</label><input id=editActionFade value="${esc(v.fade||'500ms')}" placeholder="500ms, 1s…"><div class=help>MPF fades smoothly from the current light color to this color.</div>`;
   if(b.type==='light_stop')body+=`<div class=help>Release removes this rule's hold on the light so a lower-priority color can show through.</div>`;
 } else return alert('This action does not have an editor yet.');
 let modal=document.getElementById('editActionModal'),box=document.getElementById('editActionBody');
 box.innerHTML=`<h2>Edit DO</h2><p class=small>${esc(title)}</p><div class=editActionFields><label>ACTION TYPE</label><select id=editActionNewType onchange="changeActionType(${rid},${bid},this.value)">${actionTypeOptions(b.type)}</select>${body}</div><div class=modalBtns><button onclick="editActionModal.style.display='none'">Cancel</button><button class=primary onclick="saveActionEdit(${rid},${bid})">Save Changes</button></div>`;
 modal.style.display='flex';
}
function saveActionEdit(rid,bid){
 let b=findb(rid,bid);if(!b)return;
 if(b.type==='score')b.value=Number(document.getElementById('editActionValue').value||0);
 else if(['post_event','advance_counter','start_timer','stop_timer','reset_timer','restart_timer'].includes(b.type))b.value=document.getElementById('editActionValue').value;
 else if(['light_on','light_off','light_stop','light_color','light_fade'].includes(b.type)){
   let v={light:document.getElementById('editActionLight').value};
   if(b.type==='light_color'||b.type==='light_fade')v.color=document.getElementById('editActionColor').value.trim()||'white';
   if(b.type==='light_fade')v.fade=document.getElementById('editActionFade').value.trim()||'500ms';
   b.value=v;
 }
 document.getElementById('editActionModal').style.display='none';render();
}
function addTo(id){let r=ws().rules.find(x=>x.id===id);let t=prompt('Action: score, event, counter, or timer?','score');let map={score:'score',event:'post_event',counter:'advance_counter',timer:'start_timer'};if(!map[t])return;r.actions.push(block(map[t],defaultVal(map[t])));render()}
function setLightField(rid,bid,k,v){let b=findb(rid,bid);b.value={...(b.value||{}),[k]:v};render()}
function setLightFieldNoRender(rid,bid,k,v){let b=findb(rid,bid);b.value={...(b.value||{}),[k]:v};compile()}
function setv(rid,bid,v){findb(rid,bid).value=v;render()}function setvNoRender(rid,bid,v){findb(rid,bid).value=v;if(findb(rid,bid).type==='post_event')ws().events.add(v);compile()}
function findb(rid,bid){let r=ws().rules.find(x=>x.id===rid);return r.trigger.id===bid?r.trigger:r.actions.find(x=>x.id===bid)}
function removeBlock(rid,bid){let r=ws().rules.find(x=>x.id===rid);r.actions=r.actions.filter(x=>x.id!==bid);render()}
function label(t){return({switch:'WHEN · SWITCH HIT',event:'WHEN · EVENT RECEIVED',counter_complete:'WHEN · COUNTER COMPLETE',timer_complete:'WHEN · TIMER ENDS',shot:'WHEN · SHOT HIT',score:'ACTION · SCORE POINTS',post_event:'ACTION · POST EVENT',advance_counter:'ACTION · ADVANCE COUNTER',start_timer:'ACTION · START TIMER',stop_timer:'ACTION · STOP TIMER',reset_timer:'ACTION · RESET TIMER',restart_timer:'ACTION · RESTART TIMER',light_on:'ACTION · TURN LIGHT ON',light_off:'ACTION · TURN LIGHT OFF',light_color:'ACTION · SET LIGHT COLOR',light_fade:'ACTION · FADE LIGHT',light_stop:'ACTION · RELEASE LIGHT'})[t]}
function actionText(a){
 if(!a)return'Unknown action';
 if(a.type==='score')return`Score ${Number(a.value||0).toLocaleString()} points`;
 if(a.type==='post_event')return`Post event: ${a.value}`;
 if(a.type==='advance_counter')return`Advance counter: ${a.value}`;
 if(a.type==='start_timer')return`Start timer: ${a.value}`;
 if(a.type==='stop_timer')return`Stop timer: ${a.value}`;
 if(a.type==='reset_timer')return`Reset timer: ${a.value}`;
 if(a.type==='restart_timer')return`Restart timer: ${a.value}`;
 if(a.type==='light_on')return`Turn light on: ${a.value?.light||''}`;
 if(a.type==='light_off')return`Turn light off: ${a.value?.light||''}`;
 if(a.type==='light_color')return`Set ${a.value?.light||'light'} to ${a.value?.color||'white'}`;
 if(a.type==='light_fade')return`Fade ${a.value?.light||'light'} to ${a.value?.color||'white'} over ${a.value?.fade||'500ms'}`;
 if(a.type==='light_stop')return`Release light: ${a.value?.light||''}`;
 return label(a.type)||a.type;
}
function triggerText(b){
 if(!b)return'No trigger';
 if(b.type==='switch')return`WHEN switch ${b.value} is hit`;
 if(b.type==='shot')return`WHEN shot ${b.value} is made`;
 if(b.type==='event'){let raw=String(b.value||''),i=raw.indexOf('{'),base=i>=0?raw.slice(0,i):raw;return i>=0?`WHEN advanced event ${base} happens (with MPF conditions)`:`WHEN event ${base} happens`;}
 if(b.type==='counter_complete')return`WHEN counter ${b.value} completes`;
 if(b.type==='timer_complete')return`WHEN timer ${b.value} completes`;
 return`WHEN ${trig(b)}`;
}
function trig(b){if(b.type==='switch')return b.value+'_active';if(b.type==='event')return b.value;if(b.type==='counter_complete')return ws().counters[b.value]?.event||b.value+'_complete';if(b.type==='timer_complete')return ws().timers[b.value]?.event||'timer_'+b.value+'_complete';if(b.type==='shot')return b.value+'_hit';return''}
function renderOverview(){let w=ws(),sn=Object.keys(w.shots||{}),cn=Object.keys(w.counters||{}),tn=Object.keys(w.timers||{}),rs=w.rules||[];let chips=[...sn.map(x=>`<span class=flowChip>SHOT · ${esc(x)}</span>`),...cn.map(x=>`<span class=flowChip>COUNTER · ${esc(x)}</span>`),...tn.map(x=>`<span class=flowChip>TIMER · ${esc(x)}</span>`)].join('');let lines=rs.length?rs.map((r,i)=>`<div class=overviewLine><span class=flowNum>${i+1}</span><div><b>${esc(triggerText(r.trigger))}</b><span class=flowArrow>→</span>${r.actions.length?r.actions.map(a=>esc(actionText(a))).join(' · '):'No action yet'}</div></div>`).join(''):'<div class=small>No rules yet.</div>';return `<h2>Mode Overview</h2><p class=small>Read the mode like gameplay, not configuration.</p><div class=modeOverview><h3>Pieces in this mode</h3><div class=flowChips>${chips||'<span class=small>No components yet.</span>'}</div></div><div class=modeOverview><h3>What happens</h3>${lines}</div><p class=small>Advanced imported MPF may contain additional behavior outside this summary.</p>`}
let tutorialActive=false, guidedBaselineScore=0;
function startFirstModeTutorial(){
 tutorialActive=true;openModeWizard();
 setTimeout(()=>{let modal=document.querySelector('#modeModal .modal')||document.getElementById('modeModal');if(!modal)return;
 modal.insertAdjacentHTML('afterbegin',`<div class=tutorialCard><div class=guideEyebrow>GUIDED BUILD · START</div><h3>Build one working piece of gameplay</h3><p>You’ll connect a real switch to a shot, count 3 hits, add scoring, and prove it works in Test.</p><p class=small>PinBlocks picked an unused practice-mode name for you. You can leave it as-is.</p></div>`);},0)
}
function guidedLessonParts(){
 let w=ws(),shots=Object.keys(w?.shots||{}),counters=Object.keys(w?.counters||{});
 let shot=shots[0]||'',counter=counters[0]||'',cd=counter?w.counters[counter]:null;
 let rule=(w?.rules||[]).find(r=>r.trigger?.type==='shot'&&r.trigger.value===shot);
 let hasAdvance=!!rule?.actions?.some(x=>x.type==='advance_counter'&&x.value===counter);
 let hasScore=!!rule?.actions?.some(x=>x.type==='score'&&Number(x.value)>0);
 return {w,shots,counters,shot,counter,cd,rule,hasAdvance,hasScore};
}
function guidedState(){
 if(!tutorialActive||!currentMode)return null;
 let p=guidedLessonParts();
 if(!p.shot)return {step:1,title:'Create one shot',text:'Setup is complete. Now create a Shot using a real target switch. This becomes the thing the player is trying to hit.',view:'components',target:'shot'};
 if(!p.counter)return {step:2,title:'Create the 3-hit goal',text:`Create one Count Up counter for ${p.shot}. For this lesson it must start at 0 and complete at 3.`,view:'components',target:'counter'};
 if(p.cd&&((p.cd.direction||'up')!=='up'||Number(p.cd.start)!==0||Number(p.cd.complete)!==3))return {step:2,title:'Fix the counter',text:`The lesson counter is currently ${p.cd.start} → ${p.cd.complete}. Edit ${p.counter} so it Counts Up from 0 and completes at 3.`,view:'components',target:'counterEdit'};
 if(!p.rule||!p.hasAdvance||!p.hasScore)return {step:3,title:'Connect the gameplay',text:`Create one rule: WHEN ${p.shot} is made → score points AND advance ${p.counter}. Both actions are required for this lesson.`,view:'rules',target:'rule'};
 return {step:4,title:'Prove it works',text:`Make ${p.shot} three times. The checklist below verifies the shot fires, score increases, and ${p.counter} reaches 3.`,view:'test',target:'test'};
}
function guideTrack(step){
 let names=['SHOT','COUNTER','RULE','TEST'];
 return `<div class=guideTrack>${names.map((n,i)=>{
   let nstep=i+1, done=nstep<step, active=nstep===step;
   return `<div class="guideTrackStep ${done?'done':active?'active':'future'}"><span>${done?'✓':nstep}</span><b>${n}</b><small>${done?'Complete':active?'Current step':'Coming up'}</small></div>`;
 }).join('')}</div>`;
}
function tutorialPanel(){
 let g=guidedState();if(!g)return '';
 return `<div class=guidedPanel>${guideTrack(g.step)}<div class=guideLesson><div><div class=guideEyebrow>GUIDED BUILD · STEP ${g.step} OF 4</div><h3>${g.title}</h3><p>${g.text}</p></div><button class=guideExit onclick="tutorialActive=false;render()">Exit guide</button></div></div>`;
}
function guidedHighlight(){
 document.querySelectorAll('.guidedNext').forEach(x=>x.classList.remove('guidedNext'));
 let g=guidedState();if(!g)return;let buttons=[...document.querySelectorAll('button')],el=null;
 if(g.target==='shot')el=buttons.find(x=>x.textContent.includes('Create Shot'));
 if(g.target==='counter')el=buttons.find(x=>x.textContent.includes('Create Counter'));
 if(g.target==='counterEdit'){let p=guidedLessonParts(),card=[...document.querySelectorAll('.card')].find(x=>x.textContent.includes(p.counter));el=card?[...card.querySelectorAll('button')].find(x=>x.textContent.trim()==='Edit'):null}
 if(g.target==='rule')el=buttons.find(x=>x.textContent.includes('Create Rule'));
 if(g.target==='test'){let p=guidedLessonParts();el=buttons.find(x=>x.classList.contains('testInput')&&x.textContent.includes('MAKE SHOT')&&x.textContent.includes(p.shot));}
 if(el){el.classList.add('guidedNext');el.title='Do this next';}
}
function searchProjectItems(q){let box=document.getElementById('deviceSearchResults');if(!box)return;q=String(q||'').trim().toLowerCase();if(q.length<2){box.textContent='Type at least 2 letters.';return}let items=(project&&project.items)||{},found=[];for(let [kind,list] of Object.entries(items)){if(!Array.isArray(list))continue;for(let x of list){let name=typeof x==='string'?x:(x&&x.name)||'';if(name&&name.toLowerCase().includes(q))found.push(`<div><b>${esc(name)}</b> <span class=muted>${esc(kind)}</span></div>`);if(found.length>=18)break}if(found.length>=18)break}box.innerHTML=found.length?found.join(''):'No matches.'}
function renderReference(){return `<h2>Reference</h2><div class=hint><b>PinBlocks is a Houseball Amusements resource for homebrew pinball builders.</b><br>Build first. Look things up when you need them. You do not need to read the entire MPF manual before making gameplay.</div><div class=referenceGrid>
<div class=referenceCard><b>Getting started with MPF</b><span class=small>Installation, a basic project, and running MPF/GMC.</span><br><a href="https://missionpinball.org/latest/start/quickstart/" target=_blank rel=noopener>MPF Quickstart ↗</a></div>
<div class=referenceCard><b>Config & YAML</b><span class=small>The reference behind the YAML PinBlocks generates.</span><br><a href="https://missionpinball.org/latest/config/" target=_blank rel=noopener>MPF Config Reference ↗</a></div>
<div class=referenceCard><b>Shots</b><span class=small>How MPF represents meaningful playfield shots such as ramps, lanes, loops and standups.</span><br><a href="https://missionpinball.org/latest/config/shots/" target=_blank rel=noopener>MPF Shots Reference ↗</a></div>
<div class=referenceCard><b>Config Players</b><span class=small>How MPF reacts to events to score, post events, run shows, change lights and more.</span><br><a href="https://missionpinball.org/latest/config_players/" target=_blank rel=noopener>MPF Config Players ↗</a></div>
</div><div class=card><h3>PinBlocks vocabulary</h3><p><b>Mode</b> — a group of gameplay that becomes active together.</p><p><b>Shot</b> — something meaningful the player shoots.</p><p><b>Counter</b> — remembers how many times something happened.</p><p><b>Timer</b> — creates a countdown or timed window.</p><p><b>Rule</b> — WHEN something happens → DO something.</p><p><b>Event</b> — MPF's message that something happened. PinBlocks hides the raw event name when a clearer gameplay phrase is available.</p></div><div class=card><h3>What PinBlocks does not try to hide</h3><p>MPF can do far more than PinBlocks visualizes. Imported modes may contain conditional events, shows, multiballs, state machines, media behavior and other advanced configuration. PinBlocks labels those honestly instead of pretending they are simple beginner blocks.</p></div>`}

function renderExport(){if(ws().imported)return `<h2>5. Review & Export</h2><div class="card"><h3>Existing mode safety lock</h3><p>PinBlocks imported the parts of <b>${esc(currentMode)}</b> it can can recognize, but it will not export or overwrite this existing mode yet.</p><p class=small>This prevents unsupported MPF sections or advanced settings from disappearing just because they are not represented visually. Your original YAML remains untouched.</p>${(ws().unsupported||[]).length?`<details><summary>What PinBlocks did not translate (${ws().unsupported.length})</summary><ul>${ws().unsupported.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>`:''}</div><div class=hint>You can use Components, Rules, and Test to investigate the imported mode. Editing/export of existing modes will be enabled only after PinBlocks can merge visual changes back into the original YAML safely.</div>`;compile();let y=yaml.textContent,w=ws(),warnings=validate();return `<h2>5. Review & Export</h2><div class=hint>PinBlocks combined the pieces of <b>${esc(currentMode)}</b> into one mode config.</div><div class=card><h3>Quick Check</h3><div class=check>✓ Start event: ${esc(w.settings.start||'missing')}</div><div class=check>✓ Stop event: ${esc(w.settings.stop||'missing')}</div><div class=check>✓ ${Object.keys(w.shots).length} shot(s), ${Object.keys(w.counters).length} counter(s), ${Object.keys(w.timers).length} timer(s)</div><div class=check>✓ ${w.rules.length} rule(s)</div>${warnings.length?warnings.map(x=>`<div class=check>⚠ ${esc(x)}</div>`).join(''):`<div class=check>✓ No obvious beginner-level configuration problems</div>`}</div><div class=exportBtns><button onclick="copyYaml()">Copy YAML</button><button onclick="downloadYaml()">Download ${esc(currentMode)}.yaml</button></div><div class=card><h3>Install into this MPF project</h3><p class=small>PinBlocks can create the standard MPF mode folder and register this mode in the machine config. Preview it first; nothing is written until you confirm.</p><button onclick="previewInstall()">Preview Install</button><div id=installPreview></div></div><pre>${esc(y)}</pre>`}
async function previewInstall(){compile();let box=document.getElementById('installPreview');box.innerHTML='<p class=small>Checking project…</p>';try{let d=await api('/api/install-preview',{mode:currentMode});if(d.error){box.innerHTML=`<div class=hint>⚠ ${esc(d.error)}</div>`;return}let warns=(d.warnings||[]).map(x=>`<div class=check>⚠ ${esc(x)}</div>`).join('');box.innerHTML=`<div class=hint><b>PinBlocks will create</b><br><code>${esc(d.mode_file)}</code><br><br><b>PinBlocks will update</b><br><code>${esc(d.machine_config)}</code><br><br>It will add <code>- ${esc(d.mode)}</code> to the machine's <code>modes:</code> list.</div>${warns}<button class=primary onclick="installMode()">Install Mode</button><div class=small>A timestamped backup of config.yaml is created before PinBlocks changes it.</div>`}catch(e){box.innerHTML=`<div class=hint>⚠ ${esc(e.message||e)}</div>`}}
async function installMode(){if(!confirm(`Install "${currentMode}" into the loaded MPF project?`))return;compile();let box=document.getElementById('installPreview');try{let d=await api('/api/install-mode',{mode:currentMode,yaml:yaml.textContent});if(d.error){box.innerHTML=`<div class=hint>⚠ <b>Install stopped.</b><br>${esc(d.error)}</div>`;return}box.innerHTML=`<div class=hint><b>Mode installed.</b><br>Created <code>${esc(d.mode_file)}</code><br>Registered <code>${esc(d.mode)}</code> in <code>${esc(d.machine_config)}</code>${d.backup?`<br>Backup: <code>${esc(d.backup)}</code>`:''}</div>`}catch(e){box.innerHTML=`<div class=hint>⚠ ${esc(e.message||e)}</div>`}}
async function copyYaml(){compile();await navigator.clipboard.writeText(yaml.textContent);alert('YAML copied.')}
function downloadYaml(){compile();let b=new Blob([yaml.textContent],{type:'text/yaml'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=currentMode+'.yaml';a.click();URL.revokeObjectURL(a.href)}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
