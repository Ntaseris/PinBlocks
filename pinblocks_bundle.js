/* ===== random_generator.js ===== */
function randomPick(a){return a[Math.floor(Math.random()*a.length)]}
function uniqueRandomSwitches(count){
 let src=[...new Set(project?.items?.switches||[])],out=[];
 while(src.length&&out.length<count){let i=Math.floor(Math.random()*src.length);out.push(src.splice(i,1)[0])}
 return out
}
function uniqueModeName(base){let n=base,i=2;while(spaces[n])n=base+'_'+i++;return n}
function rb(type,value){return{id:nextBlock++,type,value}}
function rr(trigger,actions){return{id:nextRule++,open:true,trigger,actions}}
function openRandomMode(){
 if(!project){alert('Load an MPF project first so Random Mode can use real switches from your machine.');return}
 document.getElementById('randomModal').innerHTML=`<div class=modal><h2>? Random Mode Generator</h2><p>Build a working example from supported gameplay patterns using real switches from your project.</p><label>COMPLEXITY</label><select id=rmComplex onchange="updateRandomComplexityHelp()"><option value=simple>Simple</option><option value=medium selected>Medium</option></select><div id=rmComplexHelp class=complexityHelp><b>Medium:</b> Uses more connected rules and can choose from more gameplay patterns.</div><div class=randomChoices><div class=randomChoice><label>Shots <span class=miniPill>REQUIRED</span></label><div class=small>Uses real switches from your machine.</div></div><div class=randomChoice><label><input id=rmScore type=checkbox checked> Scoring</label><div class=small>Award points for successful shots.</div></div><div class=randomChoice><label>Counter <span class=miniPill>REQUIRED</span></label><div class=small>Tracks progress toward a goal in the current patterns.</div></div><div class=randomChoice><label>Timer <span class=miniPill>REQUIRED</span></label><div class=small>Adds the timed challenge used by the current patterns.</div></div></div><div class=hint>Every generated example uses a shot, counter and timer so there is something meaningful to learn from. <b>Simple</b> keeps the connections easier to follow. <b>Medium</b> adds more connections and another possible gameplay pattern.</div><div class=actions><button onclick="closeRandomModal()">Cancel</button><button class=primary onclick="rollRandomMode()">Generate Mode</button></div></div>`;document.getElementById('randomModal').style.display='flex';
}
function closeRandomModal(){document.getElementById('randomModal').style.display='none'}
function updateRandomComplexityHelp(){let e=document.getElementById('rmComplex'),b=document.getElementById('rmComplexHelp');if(!e||!b)return;b.innerHTML=e.value==='simple'?'<b>Simple:</b> Uses fewer connected rules and chooses from the two easiest gameplay patterns. Best for learning how the pieces fit together.':'<b>Medium:</b> Uses more connected rules and can choose from three gameplay patterns. Better for exploring a slightly richer mode.'}
function rollRandomMode(){let o={complexity:document.getElementById('rmComplex').value,score:document.getElementById('rmScore').checked};closeRandomModal();generateRandomMode(o)}
function randomDescription(w){
 if(w.randomTemplate==='switch_frenzy')return['SWITCH FRENZY','Hit any of three shots six times before the timer expires. Different shots score different values. Complete the counter for a bonus.'];
 if(w.randomTemplate==='countdown_challenge')return['COUNTDOWN CHALLENGE','Knock the counter from five to zero before time runs out. One shot advances progress and another is worth bonus points.'];
 return['TARGET RUSH','Build five target hits before the timer expires. Two shots score differently and both advance the same goal.'];
}
function showRandomResult(w){let d=randomDescription(w);document.getElementById('randomModal').innerHTML=`<div class=modal><h2>? Random Mode Created</h2><div class=randomResult><h3>${d[0]}</h3><div>${d[1]}</div><div class=pillrow><span class=miniPill>${Object.keys(w.shots).length} shots</span><span class=miniPill>${Object.keys(w.counters).length} counter</span><span class=miniPill>${Object.keys(w.timers).length} timer</span><span class=miniPill>${w.rules.length} rules</span></div></div><p class=small>Built from a constrained PinBlocks pattern using real switches from your project.</p><div class=actions><button onclick="closeRandomModal();generateRandomMode({complexity:'medium'})">Generate Another</button><button onclick="closeRandomModal();view('test')">Test It</button><button class=primary onclick="closeRandomModal();view('rules')">Explore This Mode</button></div></div>`;document.getElementById('randomModal').style.display='flex'}
function generateRandomMode(opts={}){
 if(!project||!Array.isArray(project.items?.switches)||project.items.switches.length<2){
  alert('Load an MPF project with at least two switches first. Random Mode only uses switches that actually exist in your project.');return;
 }
 let pool=opts.complexity==='simple'?['target_rush','countdown_challenge']:['target_rush','switch_frenzy','countdown_challenge'];let template=randomPick(pool);
 let need=template==='switch_frenzy'?3:2,sw=uniqueRandomSwitches(need);
 if(sw.length<need){alert('This project does not have enough unique switches for a safe random mode.');return}
 let name=uniqueModeName('random_mode_'+Math.floor(Math.random()*900+100)),w=blank(name,true);
 w.settings={start:'ball_started',stop:'ball_ended',priority:100,version:6};w.randomGenerated=true;w.randomTemplate=template;
 if(template==='target_rush'){
  w.shots={rush_target:{switch:sw[0],start_enabled:true,enable_event:'',disable_event:'rush_timer_complete'},bonus_target:{switch:sw[1],start_enabled:true,enable_event:'',disable_event:'rush_timer_complete'}};
  w.counters={rush_hits:{start:0,complete:5,direction:'up',event:'rush_hits_complete',start_enabled:true,enable_event:'',disable_event:'rush_timer_complete',disable_on_complete:true}};
  w.timers={rush_timer:{start:15,end:0,direction:'down',event:'rush_timer_complete',start_running:true,start_event:'',stop_event:'rush_hits_complete'}};
  w.rules=[rr(rb('shot','rush_target'),[rb('score',1000),rb('advance_counter','rush_hits')]),rr(rb('shot','bonus_target'),[rb('score',2500),rb('advance_counter','rush_hits')]),rr(rb('counter_complete','rush_hits'),[rb('score',10000),rb('post_event','random_mode_success')]),rr(rb('timer_complete','rush_timer'),[rb('post_event','random_mode_failed')])];
 }
 if(template==='switch_frenzy'){
  w.shots={left_random:{switch:sw[0],start_enabled:true,enable_event:'',disable_event:''},center_random:{switch:sw[1],start_enabled:true,enable_event:'',disable_event:''},right_random:{switch:sw[2],start_enabled:true,enable_event:'',disable_event:''}};
  w.counters={frenzy_hits:{start:0,complete:6,direction:'up',event:'frenzy_hits_complete',start_enabled:true,enable_event:'',disable_event:'',disable_on_complete:true}};
  w.timers={frenzy_timer:{start:20,end:0,direction:'down',event:'frenzy_timer_complete',start_running:true,start_event:'',stop_event:'frenzy_hits_complete'}};
  w.rules=[rr(rb('shot','left_random'),[rb('score',500),rb('advance_counter','frenzy_hits')]),rr(rb('shot','center_random'),[rb('score',1000),rb('advance_counter','frenzy_hits')]),rr(rb('shot','right_random'),[rb('score',1500),rb('advance_counter','frenzy_hits')]),rr(rb('counter_complete','frenzy_hits'),[rb('score',15000),rb('stop_timer','frenzy_timer'),rb('post_event','random_mode_success')]),rr(rb('timer_complete','frenzy_timer'),[rb('post_event','random_mode_failed')])];
 }
 if(template==='countdown_challenge'){
  w.shots={countdown_target:{switch:sw[0],start_enabled:true,enable_event:'',disable_event:'challenge_timer_complete'},time_target:{switch:sw[1],start_enabled:true,enable_event:'',disable_event:'challenge_timer_complete'}};
  w.counters={targets_left:{start:5,complete:0,direction:'down',event:'targets_left_complete',start_enabled:true,enable_event:'',disable_event:'challenge_timer_complete',disable_on_complete:true}};
  w.timers={challenge_timer:{start:12,end:0,direction:'down',event:'challenge_timer_complete',start_running:true,start_event:'',stop_event:'targets_left_complete'}};
  w.rules=[rr(rb('shot','countdown_target'),[rb('score',1000),rb('advance_counter','targets_left')]),rr(rb('shot','time_target'),[rb('score',2000)]),rr(rb('counter_complete','targets_left'),[rb('score',12000),rb('stop_timer','challenge_timer'),rb('post_event','random_mode_success')]),rr(rb('timer_complete','challenge_timer'),[rb('post_event','random_mode_failed')])];
 }
 if(opts.score===false)for(let r of w.rules)r.actions=r.actions.filter(a=>a.type!=='score');spaces[name]=w;currentMode=name;currentView='rules';
 document.getElementById('empty').style.display='none';document.getElementById('work').style.display='block';document.getElementById('builderNav').style.display='block';
 refreshModes();render();
 showRandomResult(w);
}


/* ===== components.js ===== */
function renderComponents(){return `<h2>2. Game Components</h2><div><button class=learnChip onclick="teach('shot')">What is a shot?</button><button class=learnChip onclick="teach('counter')">What is a counter?</button><button class=learnChip onclick="teach('timer')">What is a timer?</button></div><div class=hint><b>Components are things your rules can use.</b> You only need to create the pieces this mode actually needs.</div>${componentPage('Shots','Create Shot',Object.entries(ws().shots),(n,d)=>`Switch: ${esc(d.switch)}`,'shot')}${componentPage('Counters','Create Counter',Object.entries(ws().counters),(n,d)=>`${(d.direction||'up')==='down'?'Counts down':'Counts up'} · ${d.start} → ${d.complete} · posts ${esc(d.event)}`,'counter')}${componentPage('Timers','Create Timer',Object.entries(ws().timers),(n,d)=>`${timerDirection(d)==='down'?'Counts down':'Counts up'} · ${timerStart(d)} → ${timerEnd(d)} · posts ${esc(d.event)}`,'timer')}<button class=nextbtn onclick="view('rules')">Next: Build Rules →</button>`}
function renderShots(){let a=Object.entries(ws().shots);return componentPage('Shots','Create Shot',a,(n,d)=>`${esc(d.switch)} switch`, 'shot')}
function renderCounters(){let a=Object.entries(ws().counters);return componentPage('Counters','Create Counter',a,(n,d)=>`${(d.direction||'up')==='down'?'Counts down':'Counts up'} · ${d.start} → ${d.complete} · posts ${esc(d.event)}`,'counter')}
function renderTimers(){let a=Object.entries(ws().timers);return componentPage('Timers','Create Timer',a,(n,d)=>`${timerDirection(d)==='down'?'Counts down':'Counts up'} · ${timerStart(d)} → ${timerEnd(d)} · completion event ${esc(d.event)}`,'timer')}
function componentPage(title,button,arr,desc,type){return`<div class=headerrow><div><h2>${title}</h2></div><button class=muted onclick="openComponent('${type}')">＋ ${button}</button></div>${arr.length?arr.map(([n,d])=>`<div class=card component><div><h3>${esc(n)}</h3><p>${desc(n,d)}</p></div><div class=componentActions><button onclick="editComponent('${type}','${esc(n)}')">Edit</button><button class=danger onclick="deleteComponent('${type}','${esc(n)}')">Delete</button></div></div>`).join(''):`<div class=hint>No ${title.toLowerCase()} created in this workspace yet.</div>`}`}
function knownEventChoices(selected='',purpose='enable'){
 let w=ws(),items=[],seen=new Set();function add(value,label,source){if(!value||seen.has(value))return;seen.add(value);items.push({value,label,source})}
 if(w.settings.start)add(w.settings.start,'Mode starts — '+w.settings.start,'MODE');
 if(w.settings.stop)add(w.settings.stop,'Mode ends — '+w.settings.stop,'MODE');
 for(let[n,d]of Object.entries(w.shots||{}))if(d.progression)add(d.complete_event||n+'_complete','Shot completes — '+n,'SHOT');
 for(let[n,d]of Object.entries(w.counters||{}))add(d.event||n+'_complete','Counter completes — '+n,'COUNTER');
 for(let[n,d]of Object.entries(w.timers||{}))add(d.event||n+'_complete','Timer completes — '+n,'TIMER');
 for(let r of w.rules||[])for(let a of r.actions||[])if(a.type==='post_event')add(a.value,'Rule posts — '+a.value,'RULE');
 let known=items.some(x=>x.value===selected),custom=selected&&!known;
 let out=`<option value="">${purpose==='enable'?'No event — use starting state':'Never / no event'}</option>`;
 for(let x of items)out+=`<option value="${esc(x.value)}" ${x.value===selected?'selected':''}>${esc(x.label)} [${x.source}]</option>`;
 out+=`<option value="__custom__" ${custom?'selected':''}>Advanced: type an MPF event…</option>`;return{html:out,custom};
}
function eventConnectionHtml(id,label,selected='',purpose='enable'){let o=knownEventChoices(selected,purpose);return`<div class=field><label>${label}</label><select id="${id}Choice" onchange="eventChoiceChanged('${id}')">${o.html}</select><div id="${id}Advanced" class=advancedEvent style="display:${o.custom?'block':'none'}"><input id="${id}Custom" value="${o.custom?esc(selected):''}" placeholder="advanced MPF event name"><div class=help>Advanced events are allowed, but PinBlocks cannot prove an external event will happen.</div></div><div id="${id}Preview" class=connectionPreview></div></div>`}
function eventChoiceChanged(id){let c=document.getElementById(id+'Choice'),a=document.getElementById(id+'Advanced');if(a)a.style.display=c.value==='__custom__'?'block':'none';updateConnectionPreview(id)}
function setEventConnection(id,value){let c=document.getElementById(id+'Choice'),x=document.getElementById(id+'Custom'),a=document.getElementById(id+'Advanced');if(!c)return;let found=[...c.options].some(o=>o.value===value);c.value=found?value:(value?'__custom__':'');if(x)x.value=found?'':value;if(a)a.style.display=c.value==='__custom__'?'block':'none';updateConnectionPreview(id)}
function eventConnectionValue(id){let c=document.getElementById(id+'Choice');if(!c)return'';return c.value==='__custom__'?(document.getElementById(id+'Custom')?.value.trim()||''):c.value}
function updateConnectionPreview(id){let c=document.getElementById(id+'Choice'),e=document.getElementById(id+'Preview');if(!c||!e)return;e.textContent=!c.value?'No event connection.':c.value==='__custom__'?'Advanced connection: PinBlocks will pass this event name through to MPF.':'Connected to: '+c.options[c.selectedIndex].text}
function toggleShotProgression(force){
 let cb=document.getElementById('cmProgress'),box=document.getElementById('cmGameplayFields'),sum=document.getElementById('cmBehaviorSummary');
 if(!cb||!box)return;let on=force===undefined?!cb.checked:!!force;cb.checked=on;box.style.display=on?'block':'none';
 if(sum)sum.textContent=on?'Progressing shot. Each successful hit advances one state.':'Simple shot. Every successful hit makes this shot.';
 updateShotAutoEvent();syncShotStateChoices();
}
function updateShotAutoEvent(){
 let n=document.getElementById('cmName')?.value.trim()||'shot',e=n+'_complete',inp=document.getElementById('cmShotComplete'),label=document.getElementById('cmAutoComplete');
 if(inp)inp.value=e;if(label)label.textContent=e;
}
function syncShotStateChoices(){
 let raw=document.getElementById('cmStates')?.value||'',states=raw.split(',').map(x=>x.trim()).filter(Boolean),sel=document.getElementById('cmStartStateSelect'),hidden=document.getElementById('cmStartState');
 if(!sel||!states.length)return;let current=hidden?.value||states[0];sel.innerHTML=states.map(s=>`<option ${s===current?'selected':''}>${esc(s)}</option>`).join('');if(!states.includes(current))current=states[0];sel.value=current;if(hidden)hidden.value=current;
}
function filterComponentSwitches(q){let sel=document.getElementById('cmSwitch');if(!sel)return;let cur=sel.value,f=(project.items.switches||[]).filter(x=>!q||x.toLowerCase().includes(q.toLowerCase()));sel.innerHTML=f.map(x=>`<option>${esc(x)}</option>`).join('');if(f.includes(cur))sel.value=cur}
function guidedComponentHint(t){
 if(typeof tutorialActive==='undefined'||!tutorialActive)return '';
 if(t==='shot')return `<div class=modalGuide><b>GUIDED BUILD · SHOT</b><p>Pick a real switch for something the player can shoot. The name is the gameplay name PinBlocks will use later.</p></div>`;
 if(t==='counter')return `<div class=modalGuide><b>GUIDED BUILD · COUNTER</b><p>For this lesson use <strong>Count Up</strong>, <strong>Start 0</strong>, and <strong>Complete At 3</strong>. These exact values give the Test step one clear goal.</p></div>`;
 return '';
}
function openComponent(t){
 componentType=t;componentEditing=null;
 document.getElementById('cmTitle').textContent='Create '+({shot:'Shot',counter:'Counter',timer:'Timer'})[t];
 let fields=document.getElementById('cmFields');
 if(t==='shot')fields.innerHTML=`${guidedComponentHint(t)}<div class=field><label>SHOT NAME</label><input id=cmName value="left_target"></div><div class=field><label>SWITCH</label><input id=cmSwitchSearch class=selectSearch placeholder="Filter switches…" oninput="filterComponentSwitches(this.value)"><select id=cmSwitch>${project.items.switches.map(s=>`<option>${esc(s)}</option>`).join('')}</select><div class=help>A simple beginner shot becomes active when this switch is hit.</div></div><div class=behaviorCard><div class=behaviorChoice><div><h4>Shot behavior <span class=levelPill>BASIC</span></h4><div class=small id=cmBehaviorSummary>Simple shot. Every successful hit makes this shot.</div></div><button type=button class=secondary onclick="toggleShotProgression()">Add shot progression →</button></div><div id=cmGameplayFields class=gameplayFields style="display:none"><b>Progress through states <span class=levelPill>GAMEPLAY</span></b><div class=small>Each successful shot advances to the next state.</div><input id=cmProgress type=checkbox style="display:none"><div class=field><label>STATES</label><input id=cmStates value="unlit, lit, complete"><div class=help>Example: unlit → lit → complete</div></div><div class=field><label>START STATE</label><select id=cmStartStateSelect onchange="cmStartState.value=this.value"><option>unlit</option><option>lit</option><option>complete</option></select><input id=cmStartState value="unlit" style="display:none"></div><div class=field><label>WHEN COMPLETE</label><div class=help>PinBlocks automatically creates <code id=cmAutoComplete>shot_complete</code>. You can use “this shot is completed” in Build Rules without memorizing the event name.</div><input id=cmShotComplete value="left_target_complete" style="display:none"></div></div></div><details class="hint advancedPanel"><summary><b>Advanced behavior</b> <span class=levelPill>ADVANCED</span></summary><div class=help>Most modes can leave this closed. The shot is active for the whole mode unless you change it.</div><label><input id=cmStartEnabled type=checkbox checked> Shot starts active with the mode</label><div class=connectionRow>${eventConnectionHtml('cmEnableEvent','Activate from another event','', 'enable')}${eventConnectionHtml('cmDisableEvent','Deactivate from another event','', 'disable')}</div></details>`;
 if(t==='counter')fields.innerHTML=`<div class=field><label>COUNTER NAME</label><input id=cmName value="target_hits"></div><div class=field><label>COUNT DIRECTION</label><select id=cmDirection onchange="counterDirectionChanged()"><option value=up>Count Up</option><option value=down>Count Down</option></select><div class=help>Advance Counter always moves one step toward completion. MPF uses <code>direction: up</code> or <code>direction: down</code>.</div></div><div class=grid2><div class=field><label>START VALUE</label><div class=numrow><button type=button onclick="bumpNumber('cmStart',-1)">−</button><input id=cmStart type=text inputmode=numeric value="0"><button type=button onclick="bumpNumber('cmStart',1)">+</button></div></div><div class=field><label>COMPLETE AT</label><div class=numrow><button type=button onclick="bumpNumber('cmComplete',-1)">−</button><input id=cmComplete type=text inputmode=numeric value="5"><button type=button onclick="bumpNumber('cmComplete',1)">+</button></div></div></div><div class=field><label>WHEN COUNTER COMPLETES</label><input id=cmEvent value="target_hits_complete" readonly><div class=help>PinBlocks names this automatically. In Build Rules you can simply choose “counter completes.”</div></div><details class="hint advancedPanel"><summary><b>Advanced counter behavior</b> <span class=levelPill>ADVANCED</span></summary><div class=help>Normally a counter is available for the whole mode and stops when it reaches its goal.</div><label><input id=cmStartEnabled type=checkbox checked> Counter starts active with the mode</label><div class=connectionRow>${eventConnectionHtml('cmEnableEvent','Activate from another event','', 'enable')}${eventConnectionHtml('cmDisableEvent','Deactivate from another event','', 'disable')}</div><label><input id=cmDisableComplete type=checkbox checked> Stop counting when complete</label></details>`;
 if(t==='timer')fields.innerHTML=`<div class=field><label>TIMER NAME</label><input id=cmName value="practice_timer"></div><div class=field><label>TIMER DIRECTION</label><select id=cmDirection onchange="timerDirectionChanged()"><option value=down>Count Down</option><option value=up>Count Up</option></select><div class=help>Countdown is typical for timed modes. Count Up is useful when something should complete after elapsed time.</div></div><div class=grid2><div class=field><label>START VALUE</label><div class=numrow><button type=button onclick="bumpNumber('cmStart',-1,0)">−</button><input id=cmStart type=text inputmode=numeric value="10"><button type=button onclick="bumpNumber('cmStart',1,0)">+</button></div></div><div class=field><label>END VALUE</label><div class=numrow><button type=button onclick="bumpNumber('cmComplete',-1,0)">−</button><input id=cmComplete type=text inputmode=numeric value="0"><button type=button onclick="bumpNumber('cmComplete',1,0)">+</button></div></div></div><div class=field><label>WHEN TIMER COMPLETES</label><input id=cmEvent value="practice_timer_complete" readonly><div class=help>PinBlocks names this automatically. In Build Rules you can simply choose “timer completes.”</div></div><details class="hint advancedPanel"><summary><b>Advanced timer behavior</b> <span class=levelPill>ADVANCED</span></summary><div class=help>Most beginners should start and stop timers in Build Rules. Open this only when the timer itself needs special activation behavior.</div><label><input id=cmStartEnabled type=checkbox> Timer starts running with the mode</label><div class=connectionRow>${eventConnectionHtml('cmEnableEvent','Start from another event','', 'enable')}${eventConnectionHtml('cmDisableEvent','Stop from another event','', 'disable')}</div></details>`;
 document.getElementById('componentModal').style.display='flex';
}
function bumpNumber(id,delta,min=null){
 const e=document.getElementById(id);
 let v=parseInt(e.value,10); if(Number.isNaN(v))v=0;
 v+=delta;if(min!==null)v=Math.max(min,v);
 e.value=String(v);
}
function counterDirectionChanged(){
 if(componentEditing)return;
 if(cmDirection.value==='down'){cmStart.value='5';cmComplete.value='0'}
 else{cmStart.value='0';cmComplete.value='5'}
}
function timerDirectionChanged(){
 if(componentEditing)return;
 if(cmDirection.value==='down'){cmStart.value='10';cmComplete.value='0'}
 else{cmStart.value='0';cmComplete.value='10'}
}
function timerDirection(d){return d.direction||'down'}
function timerStart(d){return d.start!==undefined?d.start:(d.seconds!==undefined?d.seconds:10)}
function timerEnd(d){return d.end!==undefined?d.end:0}
function saveComponent(){if(componentType==='shot'){updateShotAutoEvent();syncShotStateChoices();}if(!componentEditing&&componentType==='counter'&&document.getElementById('cmEvent'))cmEvent.value=(cmName.value.trim()||'counter')+'_complete';if(!componentEditing&&componentType==='timer'&&document.getElementById('cmEvent'))cmEvent.value=(cmName.value.trim()||'timer')+'_complete';
 let n=cmName.value.trim().replace(/\s+/g,'_');if(!n)return alert('Give it a name.');
 let obj=componentType==='shot'?ws().shots:componentType==='counter'?ws().counters:ws().timers;
 if(!componentEditing&&obj[n])return alert('A '+componentType+' named "'+n+'" already exists.');
 if(componentEditing&&n!==componentEditing&&obj[n])return alert('That name is already in use.');
 let d;
 if(componentType==='shot'){let states=cmStates.value.split(',').map(x=>x.trim()).filter(Boolean);if(states.length<2)states=['unlit','complete'];let startState=cmStartState.value.trim()||states[0];if(!states.includes(startState))startState=states[0];d={switch:cmSwitch.value,start_enabled:cmStartEnabled.checked,enable_event:eventConnectionValue('cmEnableEvent'),disable_event:eventConnectionValue('cmDisableEvent'),progression:cmProgress.checked,states,start_state:startState,complete_event:cmShotComplete.value.trim()||n+'_complete'};}
 if(componentType==='counter'){
   let start=Number(cmStart.value||0),complete=Number(cmComplete.value||0),direction=cmDirection.value;
   if(typeof tutorialActive!=='undefined'&&tutorialActive&&(direction!=='up'||start!==0||complete!==3)){
     alert('Guided Build is teaching a 3-hit goal. Set this counter to Count Up, START VALUE 0, and COMPLETE AT 3. You can build other kinds of counters after the guide.');
     return;
   }
   if(direction==='up'&&complete<=start)return alert('A Count Up counter needs a COMPLETE AT value higher than its START VALUE.');
   if(direction==='down'&&complete>=start)return alert('A Count Down counter needs a COMPLETE AT value lower than its START VALUE.');
   d={start,complete,direction,event:cmEvent.value.trim()||n+'_complete',start_enabled:cmStartEnabled.checked,enable_event:eventConnectionValue('cmEnableEvent'),disable_event:eventConnectionValue('cmDisableEvent'),disable_on_complete:cmDisableComplete.checked};
 }
 if(componentType==='timer'){
   let start=Number(cmStart.value||0),end=Number(cmComplete.value||0),direction=cmDirection.value;
   if(direction==='up'&&end<=start)return alert('A Count Up timer needs an END VALUE higher than its START VALUE.');
   if(direction==='down'&&end>=start)return alert('A Count Down timer needs an END VALUE lower than its START VALUE.');
   d={start,end,direction,event:cmEvent.value.trim()||n+'_complete',start_running:cmStartEnabled.checked,start_event:eventConnectionValue('cmEnableEvent'),stop_event:eventConnectionValue('cmDisableEvent')};
 }
 if(componentEditing&&componentEditing!==n){delete obj[componentEditing];renameReferences(componentType,componentEditing,n)}
 obj[n]=d;if(d.event)ws().events.add(d.event);componentModal.style.display='none';componentEditing=null;render()
}
function editComponent(t,n){
 openComponent(t);componentEditing=n;
 let obj=t==='shot'?ws().shots:t==='counter'?ws().counters:ws().timers,d=obj[n];
 cmTitle.textContent='Edit '+({shot:'Shot',counter:'Counter',timer:'Timer'})[t];cmName.value=n;
 if(t==='shot'){cmSwitch.value=d.switch;cmStartEnabled.checked=d.start_enabled!==false;setEventConnection('cmEnableEvent',d.enable_event||'');setEventConnection('cmDisableEvent',d.disable_event||'');cmProgress.checked=!!d.progression;cmStates.value=(d.states||['unlit','lit','complete']).join(', ');cmStartState.value=d.start_state||'unlit';cmShotComplete.value=d.complete_event||n+'_complete';toggleShotProgression(!!d.progression)}
 if(t==='counter'){cmDirection.value=d.direction||'up';cmStart.value=d.start;cmComplete.value=d.complete;cmEvent.value=d.event;cmStartEnabled.checked=d.start_enabled!==false;setEventConnection('cmEnableEvent',d.enable_event||'');setEventConnection('cmDisableEvent',d.disable_event||'');cmDisableComplete.checked=d.disable_on_complete!==false}
 if(t==='timer'){cmDirection.value=timerDirection(d);cmStart.value=timerStart(d);cmComplete.value=timerEnd(d);cmEvent.value=d.event;cmStartEnabled.checked=!!d.start_running;setEventConnection('cmEnableEvent',d.start_event||'');setEventConnection('cmDisableEvent',d.stop_event||'')}
}
function deleteComponent(t,n){if(!confirm('Delete '+n+'? Any rule still using it will be flagged.'))return;let obj=t==='shot'?ws().shots:t==='counter'?ws().counters:ws().timers;delete obj[n];render()}
function renameReferences(t,o,n){for(let r of ws().rules)for(let x of [r.trigger,...r.actions]){if(t==='shot'&&x.type==='shot'&&x.value===o)x.value=n;if(t==='counter'&&(x.type==='counter_complete'||x.type==='advance_counter')&&x.value===o)x.value=n;if(t==='timer'&&['timer_complete','start_timer','stop_timer','reset_timer','restart_timer'].includes(x.type)&&x.value===o)x.value=n}}


/* ===== validation.js ===== */
function diagnostics(){
 let errors=[],warnings=[];
 try{
   let w=ws(); if(!w)return{errors,warnings};
   if(!w.settings.start)warnings.push('Mode has no start event yet.');
   if(!w.settings.stop)warnings.push('Mode has no stop event yet.');
   let switches=Array.isArray(project?.items?.switches)?project.items.switches:[];
   for(let r of (w.rules||[])){
     if(!(r.actions||[]).length)warnings.push('A rule has a trigger but no action.');
     let x=r.trigger||{};
     if(x.type==='switch'&&switches.length&&!switches.includes(x.value))errors.push('Switch "'+x.value+'" does not exist in the loaded project.');
     if(x.type==='shot'&&!w.shots[x.value])errors.push('Rule references missing shot "'+x.value+'".');
     if(x.type==='counter_complete'&&!w.counters[x.value])errors.push('Rule references missing counter "'+x.value+'".');
     if(x.type==='timer_complete'&&!w.timers[x.value])errors.push('Rule references missing timer "'+x.value+'".');
     for(let q of (r.actions||[])){
       if(q.type==='advance_counter'&&!w.counters[q.value])errors.push('Rule advances missing counter "'+q.value+'".');
       if(['start_timer','stop_timer','reset_timer','restart_timer'].includes(q.type)&&!w.timers[q.value])errors.push('Rule controls missing timer "'+q.value+'".');
     }
   }
   for(let [n,d] of Object.entries(w.shots||{}))if(switches.length&&!switches.includes(d.switch))errors.push('Shot "'+n+'" uses missing switch "'+d.switch+'".');let shotSwitches={};for(let[n,d]of Object.entries(w.shots||{})){if(!d.switch)continue;(shotSwitches[d.switch]??=[]).push(n)}for(let[s,names]of Object.entries(shotSwitches))if(names.length>1)warnings.push('Multiple shots use switch "'+s+'": '+names.join(', ')+'. This can be intentional, but review it.');for(let [n,d] of Object.entries(w.shots||{})){if(d.progression){if(!Array.isArray(d.states)||d.states.length<2)errors.push('Shot "'+n+'" progression needs at least two states.');if(d.states&&new Set(d.states).size!==d.states.length)errors.push('Shot "'+n+'" has duplicate progression states.');if(d.states&&!d.states.includes(d.start_state))errors.push('Shot "'+n+'" start state is not in its state list.');if(!d.complete_event)warnings.push('Shot "'+n+'" completes but has no completion event.');}}
   for(let n of Object.keys(w.counters||{}))if(!(w.rules||[]).some(r=>(r.actions||[]).some(a=>a.type==='advance_counter'&&a.value===n)))warnings.push('Counter "'+n+'" exists but no rule advances it.');
   for(let [n,d] of Object.entries(w.timers||{}))if(!d.start_running&&!(w.rules||[]).some(r=>(r.actions||[]).some(a=>['start_timer','restart_timer'].includes(a.type)&&a.value===n)))warnings.push('Timer "'+n+'" exists but no rule starts it.');
   for(let [n,d] of Object.entries(w.counters||{})){
     let dir=d.direction||'up';
     if(dir==='up'&&d.complete<=d.start)errors.push('Counter "'+n+'" counts up but its completion value is not above its start value.');
     if(dir==='down'&&d.complete>=d.start)errors.push('Counter "'+n+'" counts down but its completion value is not below its start value.');
   }
   for(let [n,d] of Object.entries(w.timers||{})){
     let dir=timerDirection(d),start=timerStart(d),end=timerEnd(d);
     if(dir==='up'&&end<=start)errors.push('Timer "'+n+'" counts up but its end value is not above its start value.');
     if(dir==='down'&&end>=start)errors.push('Timer "'+n+'" counts down but its end value is not below its start value.');
   }
   let produced=new Set([w.settings.start,w.settings.stop].filter(Boolean));
   for(let[n,d]of Object.entries(w.shots||{}))if(d.progression)produced.add(d.complete_event||n+'_complete');
   for(let[n,d]of Object.entries(w.counters||{}))produced.add(d.event||n+'_complete');
   for(let[n,d]of Object.entries(w.timers||{}))produced.add(d.event||n+'_complete');
   for(let r of w.rules||[])for(let a of r.actions||[])if(a.type==='post_event'&&a.value)produced.add(a.value);
   for(let[n,d]of Object.entries(w.shots||{}))for(let e of [d.enable_event,d.disable_event])if(e&&!produced.has(e))warnings.push('Shot "'+n+'" uses external/advanced event "'+e+'". PinBlocks cannot verify where it comes from.');
   for(let[n,d]of Object.entries(w.counters||{}))for(let e of [d.enable_event,d.disable_event])if(e&&!produced.has(e))warnings.push('Counter "'+n+'" uses external/advanced event "'+e+'". PinBlocks cannot verify where it comes from.');
   for(let[n,d]of Object.entries(w.timers||{}))for(let e of [d.start_event,d.stop_event])if(e&&!produced.has(e))warnings.push('Timer "'+n+'" uses external/advanced event "'+e+'". PinBlocks cannot verify where it comes from.');
 }catch(e){console.error('diagnostics',e)}
 return{errors:[...new Set(errors)],warnings:[...new Set(warnings)]}
}
function validate(){let d=diagnostics();return[...d.errors,...d.warnings]}
function healthHtml(){let d=diagnostics(),n=d.errors.length+d.warnings.length,cls=d.errors.length?'error':d.warnings.length?'warn':'',head=d.errors.length?`⛔ ${d.errors.length} error${d.errors.length===1?'':'s'} · ${d.warnings.length} warning${d.warnings.length===1?'':'s'}`:d.warnings.length?`⚠ ${d.warnings.length} thing${d.warnings.length===1?'':'s'} to review`:'✓ Mode looks good';let detail=healthOpen&&n?`<div class=healthDetails>${d.errors.map(x=>`<div>⛔ ${esc(x)}</div>`).join('')}${d.warnings.map(x=>`<div>⚠ ${esc(x)}</div>`).join('')}</div>`:'';return`<div class="health ${cls}" onclick="healthOpen=!healthOpen;render()"><b>${head}</b>${n?` · click to ${healthOpen?'hide':'see'} details`:''}${detail}</div>`}
function validationHtml(){let d=diagnostics();return`<div class=validation>${d.errors.map(x=>`<div class=issue>⛔ ${esc(x)}</div>`).join('')}${d.warnings.map(x=>`<div class=issue>⚠ ${esc(x)}</div>`).join('')}${!d.errors.length&&!d.warnings.length?`<div class="issue ok">✓ No obvious beginner-level configuration problems found.</div>`:''}</div>`}


/* ===== compiler.js ===== */
function compile(){
 let w=ws();if(!w)return;let ep={},vp={},lp={},counts={},timerCtl={};
 let add=(m,k,v)=>{(m[k]??=[]).push(v)};
 for(let r of w.rules){let t=trig(r.trigger);for(let a of r.actions){
   if(a.type==='score')add(vp,t,Number(a.value||0));
   if(a.type==='post_event')add(ep,t,a.value);
   if(['light_on','light_off','light_stop','light_color','light_fade'].includes(a.type)&&a.value&&a.value.light){
     let spec=a.type==='light_on'?'on':a.type==='light_off'?'off':a.type==='light_stop'?'stop':a.type==='light_fade'?{color:a.value.color||'white',fade:a.value.fade||'500ms'}:(a.value.color||'white');
     if(!lp[t])lp[t]={};lp[t][a.value.light]=spec;
   }
   if(a.type==='advance_counter')add(counts,a.value,t);
   if(['start_timer','stop_timer','reset_timer','restart_timer'].includes(a.type))add(timerCtl,a.value,{event:t,action:{start_timer:'start',stop_timer:'stop',reset_timer:'reset',restart_timer:'restart'}[a.type]});
 }}
 let y=`#config_version=${w.settings.version||6}\n\nmode:\n  start_events: ${w.settings.start||'ball_started'}\n  stop_events: ${w.settings.stop||'ball_ended'}\n  priority: ${w.settings.priority||100}\n\n`;
 let progressing=Object.entries(w.shots).filter(([n,d])=>d.progression);if(progressing.length){y+='shot_profiles:\n';for(let[n,d]of progressing){y+=`  ${n}_progress:\n    states:\n`;for(let s of (d.states||['unlit','lit','complete']))y+=`      - name: ${s}\n`;y+='    loop: false\n'}y+='\n'}if(Object.keys(w.shots).length){y+='shots:\n';for(let[n,d]of Object.entries(w.shots)){y+=`  ${n}:\n    switch: ${d.switch}\n    start_enabled: ${d.start_enabled!==false}\n`;if(d.progression)y+=`    profile: ${n}_progress\n`;if(d.enable_event)y+=`    enable_events: ${d.enable_event}\n`;if(d.disable_event)y+=`    disable_events: ${d.disable_event}\n`}y+='\n'}
 if(Object.keys(w.counters).length){y+='counters:\n';for(let[n,d]of Object.entries(w.counters)){y+=`  ${n}:\n    starting_count: ${d.start}\n`;let es=[...new Set(counts[n]||[])];if(es.length===1)y+=`    count_events: ${es[0]}\n`;else if(es.length){y+='    count_events:\n';es.forEach(e=>y+=`      - ${e}\n`)}y+=`    count_complete_value: ${d.complete}\n    direction: ${d.direction||'up'}\n    start_enabled: ${d.start_enabled!==false}\n    disable_on_complete: ${d.disable_on_complete!==false}\n`;if(d.enable_event)y+=`    enable_events: ${d.enable_event}\n`;if(d.disable_event)y+=`    disable_events: ${d.disable_event}\n`;y+=`    events_when_complete: ${d.event}\n`}y+='\n'}
 if(Object.keys(w.timers).length){y+='timers:\n';for(let[n,d]of Object.entries(w.timers)){y+=`  ${n}:\n    start_value: ${timerStart(d)}\n    end_value: ${timerEnd(d)}\n    direction: ${timerDirection(d)}\n    start_running: ${!!d.start_running}\n`;let cs=[...(timerCtl[n]||[])];if(d.start_event)cs.push({event:d.start_event,action:'start'});if(d.stop_event)cs.push({event:d.stop_event,action:'stop'});if(cs.length){y+='    control_events:\n';for(let c of cs)y+=`      - event: ${c.event}\n        action: ${c.action}\n`}y+=`    # PinBlocks completion event: ${d.event}\n`}y+='\n'}
 if(Object.keys(lp).length){y+='light_player:\n';for(let[t,lights]of Object.entries(lp)){y+=`  ${t}:\n`;for(let[n,spec]of Object.entries(lights)){if(spec&&typeof spec==='object')y+=`    ${n}:\n      color: ${spec.color}\n      fade: ${spec.fade}\n`;else y+=`    ${n}: ${spec}\n`}}y+='\n'}
 if(Object.keys(ep).length){y+='event_player:\n';for(let[t,es]of Object.entries(ep)){y+=`  ${t}:\n`;[...new Set(es)].forEach(e=>y+=`    - ${e}\n`)}y+='\n'}
 if(Object.keys(vp).length){y+='variable_player:\n';for(let[t,vs]of Object.entries(vp))y+=`  ${t}:\n    score: ${vs.reduce((a,b)=>a+b,0)}\n`;y+='\n'}
 yaml.textContent=y
}
function renderRegistry(){let w=ws();registryPane.innerHTML=`<div class=card><b>Shots</b><p class=small>${Object.keys(w.shots).join(', ')||'None'}</p><b>Counters</b><p class=small>${Object.keys(w.counters).join(', ')||'None'}</p><b>Timers</b><p class=small>${Object.keys(w.timers).join(', ')||'None'}</p></div>`}
function outputTab(t){}


/* ===== simulator.js ===== */
function guidedTestData(){
 if(typeof tutorialActive==='undefined'||!tutorialActive||typeof guidedLessonParts!=='function')return null;
 let p=guidedLessonParts();if(!p.shot||!p.counter)return null;ensureSim();
 let value=Number(p.w.sim.counters[p.counter]??p.cd?.start??0),score=Number(p.w.sim.score||0);
 let shotFires=p.w.sim.firedRules.some(id=>String(id)===String(p.rule?.id));
 let counterMoved=value>Number(p.cd?.start||0),counterDone=value>=Number(p.cd?.complete||3),scoreWorks=score>0;
 return {...p,value,score,shotFires,counterMoved,counterDone,scoreWorks,success:shotFires&&scoreWorks&&counterDone};
}
function guidedTestStatus(){
 let d=guidedTestData();if(!d)return '';
 let check=(ok,label,detail)=>`<div class="lessonCheck ${ok?'pass':''}"><span>${ok?'✓':'○'}</span><div><b>${label}</b><small>${detail}</small></div></div>`;
 let actions=d.success?`<div class=lessonSuccessActions><button onclick="view('export')">See the YAML →</button><button onclick="tutorialActive=false;render()">Keep building freely</button></div>`:'';
 return `<div class="guidedTestResult ${d.success?'success':''}"><div class=guideEyebrow>${d.success?'LESSON COMPLETE':'GUIDED TEST'}</div><h3>${d.success?'Your first mode works!':'Hit the shot 3 times'}</h3><p>${d.success?'You proved that the shot, scoring, and counter are connected.':`Click <b>Make shot: ${esc(d.shot)}</b>. Watch each check turn on as the mode responds.`}</p><div class=lessonChecks>${check(d.shotFires,'Shot fires',d.shotFires?`${d.shot} was triggered.`:'Waiting for the first hit.')}${check(d.scoreWorks,'Score changes',d.scoreWorks?`Player score is ${d.score}.`:'The rule must award points.')}${check(d.counterMoved,'Counter advances',`${d.counter}: ${d.value} / ${d.cd.complete}`)}${check(d.counterDone,'Goal completes',d.counterDone?'Three-hit goal reached.':'Reach 3 / 3.')}</div>${actions}</div>`;
}
function refreshGuidedTest(){let el=document.getElementById('guidedTestMount');if(el)el.innerHTML=guidedTestStatus();}
function renderTest(){
 let w=ws();ensureSim();
 let sr=w.rules.filter(r=>r.trigger&&r.trigger.type==='switch'),hr=w.rules.filter(r=>r.trigger&&r.trigger.type==='shot');
 let inputs='';
 if(sr.length)inputs+=`<div class=testGroupTitle>PLAYFIELD SWITCHES</div>${sr.map(r=>`<button class=testInput onclick="fireRule(${r.id})"><span>HIT SWITCH</span><b>${esc(r.trigger.value)}</b></button>`).join('')}`;
 if(hr.length)inputs+=`<div class=testGroupTitle>PLAYFIELD SHOTS</div>${hr.map(r=>`<button class=testInput onclick="fireRule(${r.id})"><span>MAKE SHOT</span><b>${esc(r.trigger.value)}</b></button>`).join('')}`;
 if(Object.keys(w.timers).length)inputs+=`<div class=testGroupTitle>TIME</div><button class=testInput onclick="tickTimers()"><span>ADVANCE</span><b>1 second</b></button>`;
 let eventRules=w.rules.filter(r=>r.trigger&&r.trigger.type==='event');
 let events=[...new Set(eventRules.map(r=>eventName(r.trigger.value)).filter(Boolean))];
 let advanced=events.length?`<details class=advancedTest><summary>Advanced Test Tools <span>${events.length} MPF event${events.length===1?'':'s'}</span></summary><div class=advancedTestBody><p class=testHelp><b>Post an MPF event directly.</b> This bypasses the physical playfield and is useful for debugging event-driven rules. You normally do not need this while testing player gameplay.</p>${events.map(e=>`<button class="testInput debugInput" onclick="fireEventInput('${jsq(e)}')"><span>POST EVENT</span><b>${esc(e)}</b></button>`).join('')}</div></details>`:'';
 inputs+=advanced;
 let map=w.rules.map((r,i)=>{let raw=r.trigger?.type==='event'?String(r.trigger.value||''):'',adv=raw.includes('{'),body=`<div class=traceTrigger>${esc(triggerText(r.trigger))}</div>${r.actions.length?r.actions.map(a=>`<div class=traceStep>${esc(actionText(a))}</div>`).join(''):'<div class=traceEvent>No actions yet</div>'}`;return adv?`<div class="traceRule advancedRule" id="trace_${r.id}"><details><summary>RULE ${i+1} · Advanced conditional event</summary>${body}<div class=rawEvent>${esc(raw)}</div></details></div>`:`<div class=traceRule id="trace_${r.id}"><b>RULE ${i+1}</b>${body}</div>`}).join('');
 return `<h2>4. Test</h2><div id=guidedTestMount>${guidedTestStatus()}</div><div class=hint><b>Test the mode without running MPF.</b> Use the playfield inputs below and follow the cause → effect trace.</div><div class=testToolbar><button onclick="resetAndRender()">↺ Reset Test</button><span id=testStepCount></span></div><div class="testLayout"><div class="card testInputs"><h3>MACHINE INPUTS</h3><p class=testHelp>Use these like the player would: make shots, hit switches, or advance time.</p>${inputs||'<p class=small>No player-facing test inputs were recognized for this mode.</p>'}</div><div class="card liveStateCard"><h3>LIVE STATE</h3><div id=simScore></div><div id=simCounters></div><div id=simTimers></div><div id=simShots></div><div id=simLights></div></div></div><div class=testStatus><div><span class=statusLabel>LAST INPUT</span><strong id=testLastInput>Waiting for input</strong></div><div><span class=statusLabel>RULES FIRED</span><strong id=testRulesFired>0</strong></div><div><span class=statusLabel>LATEST RESULT</span><strong id=testResult>Ready</strong></div></div><div class="card traceCard"><div class=traceHead><div><h3>TEST RESULTS</h3><p class=small>Follow the play from top to bottom: input → rule → action → anything that responds.</p></div><button onclick="clearTrace()">Clear trace</button></div><div id=simTrace class=simTrace></div></div><div class=card style="margin-top:14px"><h3>RULE MAP</h3><p class=small>Recently fired rules highlight here so you can connect the trace back to the rules you built.</p>${map}</div><button class=primary style="margin-top:16px" onclick="view('export')">Next: Review & Export →</button>`;
}
function ensureSim(){
 let w=ws();if(!w.sim){resetSim();return}
 if(!Array.isArray(w.sim.firedRules))w.sim.firedRules=[];if(!Array.isArray(w.sim.trace))w.sim.trace=[];if(!w.sim.lastInput)w.sim.lastInput='Waiting for input';if(!w.sim.lastResult)w.sim.lastResult='Ready';
 if(!w.sim.counterEnabled)w.sim.counterEnabled={};
 if(!w.sim.counterComplete)w.sim.counterComplete={};
 if(!w.sim.timerRunning)w.sim.timerRunning={};
 if(!w.sim.timerComplete)w.sim.timerComplete={};
 if(!w.sim.shotEnabled)w.sim.shotEnabled={};if(!w.sim.shotStates)w.sim.shotStates={};
 for(let[n,d]of Object.entries(w.counters)){if(!(n in w.sim.counters))w.sim.counters[n]=d.start;if(!(n in w.sim.counterEnabled))w.sim.counterEnabled[n]=d.start_enabled!==false;if(!(n in w.sim.counterComplete))w.sim.counterComplete[n]=false}
 for(let[n,d]of Object.entries(w.timers)){if(!(n in w.sim.timers))w.sim.timers[n]=timerStart(d);if(!(n in w.sim.timerRunning))w.sim.timerRunning[n]=!!d.start_running;if(!(n in w.sim.timerComplete))w.sim.timerComplete[n]=false}
 for(let[n,d]of Object.entries(w.shots)){if(!(n in w.sim.shotEnabled))w.sim.shotEnabled[n]=d.start_enabled!==false;if(!(n in w.sim.shotStates))w.sim.shotStates[n]=d.progression?Math.max(0,(d.states||['unlit','lit','complete']).indexOf(d.start_state||'unlit')):-1}
}
function resetSim(){
 let w=ws();w.sim={score:0,counters:{},counterEnabled:{},counterComplete:{},timers:{},timerRunning:{},timerComplete:{},shotEnabled:{},shotStates:{},lights:{},log:[],trace:[],firedRules:[],eventDepth:0,lastInput:'Waiting for input',lastResult:'Ready'};
 for(let[n,d]of Object.entries(w.counters)){w.sim.counters[n]=d.start;w.sim.counterEnabled[n]=d.start_enabled!==false;w.sim.counterComplete[n]=false}
 for(let[n,d]of Object.entries(w.timers)){w.sim.timers[n]=timerStart(d);w.sim.timerRunning[n]=!!d.start_running;w.sim.timerComplete[n]=false}
 for(let[n,d]of Object.entries(w.shots)){w.sim.shotEnabled[n]=d.start_enabled!==false;w.sim.shotStates[n]=d.progression?Math.max(0,(d.states||['unlit','lit','complete']).indexOf(d.start_state||'unlit')):-1}
}
function resetAndRender(){resetSim();updateSim()}
function clearTrace(){ensureSim();ws().sim.log=[];ws().sim.trace=[];ws().sim.firedRules=[];ws().sim.lastInput='Waiting for input';ws().sim.lastResult='Ready';updateSim()}
function log(s){ws().sim.log.push(s)}
function trace(kind,text,depth=0){ensureSim();ws().sim.trace.push({kind,text,depth,step:ws().sim.trace.length+1});if(kind==='input'||kind==='manual')ws().sim.lastInput=text;if(kind==='action'||kind==='complete')ws().sim.lastResult=text}
function eventName(raw){raw=String(raw||'');let i=raw.indexOf('{');return(i>=0?raw.slice(0,i):raw).trim()}

function advanceShotState(name){let w=ws(),d=w.shots[name];if(!d||!d.progression)return;let states=d.states||['unlit','lit','complete'],i=w.sim.shotStates[name];if(i<0)i=0;if(i>=states.length-1){log('  ↓ Shot '+name+' already COMPLETE');return}let next=i+1;w.sim.shotStates[name]=next;log('  ↓ Shot '+name+': '+states[i]+' → '+states[next]);if(next===states.length-1){let e=d.complete_event||name+'_complete';log('  ✓ '+name+' COMPLETE');if(e)postEvent(e)}}
function jsq(v){return String(v??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r?\n/g,' ')}
function fireEventInput(e){ensureSim();log('▶ Test event: '+e);trace('manual','MANUAL EVENT · '+e,0);postEvent(e,1);updateSim()}
function fireRule(id){
 ensureSim();let r=ws().rules.find(x=>String(x.id)===String(id));if(!r){log('× test input could not find its rule');updateSim();return;}
 if(r.trigger&&r.trigger.type==='shot'&&ws().sim.shotEnabled[r.trigger.value]===false){log('× '+r.trigger.value+' ignored — shot disabled');updateSim();return}
 log('▶ '+triggerText(r.trigger));trace('input',triggerText(r.trigger),0);ws().sim.firedRules.push(r.id);if(r.trigger&&r.trigger.type==='shot')advanceShotState(r.trigger.value);runActions(r.actions);updateSim()
}
function runActions(actions){
 for(let a of actions){
  if(['light_on','light_off','light_stop','light_color','light_fade'].includes(a.type)&&a.value&&a.value.light){let n=a.value.light,before=ws().sim.lights[n]||'off',color=a.type==='light_on'?'on':a.type==='light_off'?'off':a.type==='light_stop'?'released':(a.value.color||'white'),detail=a.type==='light_fade'?`${color} (${a.value.fade||'500ms'} fade)`:color;ws().sim.lights[n]=detail;log('  light '+n+': '+before+' → '+detail);trace('action',`LIGHT · ${n}: ${before} → ${detail}`,ws().sim.eventDepth+1)}
  if(a.type==='score'){let before=ws().sim.score;ws().sim.score+=Number(a.value||0);log('  ↓ '+actionText(a));trace('action',`Score ${before.toLocaleString()} → ${ws().sim.score.toLocaleString()}`,ws().sim.eventDepth+1)}
  if(a.type==='post_event')postEvent(a.value);
  if(a.type==='advance_counter'){
   let d=ws().counters[a.value];if(!d)continue;
   if(!ws().sim.counterEnabled[a.value]||ws().sim.counterComplete[a.value]){log('  '+a.value+' ignored — counter disabled/complete');continue}
   let down=(d.direction||'up')==='down',next=ws().sim.counters[a.value]+(down?-1:1);
   next=down?Math.max(d.complete,next):Math.min(d.complete,next);let before=ws().sim.counters[a.value];ws().sim.counters[a.value]=next;log(`  ↓ Counter ${a.value}: ${next} / ${d.complete}`);trace('action',`Counter ${a.value}: ${before} → ${next} / ${d.complete}`,ws().sim.eventDepth+1);
   if((down&&next<=d.complete)||(!down&&next>=d.complete)){ws().sim.counterComplete[a.value]=true;log('  ✓ '+a.value+' COMPLETE');trace('complete',`Counter ${a.value} COMPLETE`,ws().sim.eventDepth+1);if(d.disable_on_complete!==false){ws().sim.counterEnabled[a.value]=false;log('  '+a.value+' disabled')}postEvent(d.event||a.value+'_complete')}
  }
  if(a.type==='start_timer'&&ws().timers[a.value]){let d=ws().timers[a.value];if(ws().sim.timerComplete[a.value]){ws().sim.timers[a.value]=timerStart(d);ws().sim.timerComplete[a.value]=false}ws().sim.timerRunning[a.value]=true;log('  start timer '+a.value);trace('action','Start timer '+a.value,ws().sim.eventDepth+1)}
  if(a.type==='stop_timer'&&ws().timers[a.value]){ws().sim.timerRunning[a.value]=false;log('  stop timer '+a.value);trace('action','Stop timer '+a.value,ws().sim.eventDepth+1)}
  if(a.type==='reset_timer'&&ws().timers[a.value]){ws().sim.timers[a.value]=timerStart(ws().timers[a.value]);ws().sim.timerRunning[a.value]=false;ws().sim.timerComplete[a.value]=false;log('  reset timer '+a.value);trace('action','Reset timer '+a.value,ws().sim.eventDepth+1)}
  if(a.type==='restart_timer'&&ws().timers[a.value]){ws().sim.timers[a.value]=timerStart(ws().timers[a.value]);ws().sim.timerRunning[a.value]=true;ws().sim.timerComplete[a.value]=false;log('  restart timer '+a.value);trace('action','Restart timer '+a.value,ws().sim.eventDepth+1)}
 }
}
function postEvent(e,baseDepth){
 if(!ws().sim.eventDepth)ws().sim.eventDepth=0;
 if(ws().sim.eventDepth>=25){log('× Event chain stopped — possible loop at '+e);return}
 ws().sim.eventDepth++;
 let depth=baseDepth??ws().sim.eventDepth;log('◆ Event: '+e);trace('event','EVENT · '+e,depth);
 for(let[n,d]of Object.entries(ws().shots)){if(d.enable_event===e){ws().sim.shotEnabled[n]=true;log('  enable shot '+n)}if(d.disable_event===e){ws().sim.shotEnabled[n]=false;log('  disable shot '+n)}}
 for(let[n,d]of Object.entries(ws().counters)){if(d.enable_event===e){ws().sim.counterEnabled[n]=true;log('  enable counter '+n)}if(d.disable_event===e){ws().sim.counterEnabled[n]=false;log('  disable counter '+n)}}
 for(let[n,d]of Object.entries(ws().timers)){if(d.start_event===e){ws().sim.timerRunning[n]=true;log('  start timer '+n)}if(d.stop_event===e){ws().sim.timerRunning[n]=false;log('  stop timer '+n)}}
 for(let r of ws().rules)if(trig(r.trigger)===e){ws().sim.firedRules.push(r.id);log('  ↳ '+triggerText(r.trigger));trace('rule','Rule responds · '+triggerText(r.trigger),depth+1);runActions(r.actions)}
 ws().sim.eventDepth=Math.max(0,ws().sim.eventDepth-1);
}
function tickTimers(){
 ensureSim();for(let[n,v]of Object.entries(ws().sim.timers)){let d=ws().timers[n];if(!ws().sim.timerRunning[n]||ws().sim.timerComplete[n])continue;let down=timerDirection(d)==='down',end=timerEnd(d),next=v+(down?-1:1);next=down?Math.max(end,next):Math.min(end,next);ws().sim.timers[n]=next;log(`  ${n}: ${next}s`);trace('time',`Timer ${n}: ${v}s → ${next}s`,0);if((down&&next<=end)||(!down&&next>=end)){ws().sim.timerComplete[n]=true;ws().sim.timerRunning[n]=false;log('  ✓ '+n+' COMPLETE');trace('complete',`Timer ${n} COMPLETE`,1);postEvent(d.event||'timer_'+n+'_complete')}}
 updateSim()
}
function updateSim(){
 ensureSim();
 const scoreEl=document.getElementById('simScore'),counterEl=document.getElementById('simCounters'),timerEl=document.getElementById('simTimers'),shotEl=document.getElementById('simShots'),lightEl=document.getElementById('simLights'),traceEl=document.getElementById('simTrace'),stepEl=document.getElementById('testStepCount');
 if(!scoreEl||!counterEl||!timerEl||!shotEl||!lightEl||!traceEl)return;
 scoreEl.innerHTML=`<div class=stateGroup><div class=stateTitle>SCORE</div><div class=stateRow><strong>Player score</strong><span>${ws().sim.score}</span></div></div>`;
 counterEl.innerHTML=`<div class=stateGroup><div class=stateTitle>COUNTERS</div>${Object.entries(ws().sim.counters).length?Object.entries(ws().sim.counters).map(([n,v])=>`<div class=stateRow><div><strong>${esc(n)}</strong><div class=small>${v} → ${ws().counters[n].complete} · counts ${ws().counters[n].direction||'up'}</div></div><span class=stateStatus>${ws().sim.counterComplete[n]?'COMPLETE':(ws().sim.counterEnabled[n]?'enabled':'disabled')}</span></div>`).join(''):'<div class=small>No counters in this mode.</div>'}</div>`;
 timerEl.innerHTML=`<div class=stateGroup><div class=stateTitle>TIMERS</div>${Object.entries(ws().sim.timers).length?Object.entries(ws().sim.timers).map(([n,v])=>`<div class=stateRow><div><strong>${esc(n)}</strong><div class=small>${v}s → ${timerEnd(ws().timers[n])}s · counts ${timerDirection(ws().timers[n])}</div></div><span class=stateStatus>${ws().sim.timerComplete[n]?'COMPLETE':(ws().sim.timerRunning[n]?'running':'stopped')}</span></div>`).join(''):'<div class=small>No timers in this mode.</div>'}</div>`;
 shotEl.innerHTML=`<div class=stateGroup><div class=stateTitle>SHOTS</div>${Object.entries(ws().sim.shotEnabled).length?Object.entries(ws().sim.shotEnabled).map(([n,v])=>{let d=ws().shots[n],state=d.progression?(d.states||['unlit','lit','complete'])[ws().sim.shotStates[n]]:'';return `<div class=stateRow><div><strong>${esc(n)}</strong>${d.progression?`<div class=small>State: <b>${esc(state||d.start_state||'unlit')}</b></div>`:''}</div><span class=stateStatus>${v?'enabled':'disabled'}</span></div>`}).join(''):'<div class=small>No shots in this mode.</div>'}</div>`;
 lightEl.innerHTML=`<div class=stateGroup><div class=stateTitle>LIGHTS</div>${Object.keys(ws().sim.lights||{}).length?Object.entries(ws().sim.lights).map(([n,v])=>`<div class=stateRow><strong>${esc(n)}</strong><span class=stateStatus>${esc(v)}</span></div>`).join(''):'<div class=small>No light actions have fired yet.</div>'}</div>`;
 let lastInputEl=document.getElementById('testLastInput'),rulesFiredEl=document.getElementById('testRulesFired'),resultEl=document.getElementById('testResult');
 if(lastInputEl)lastInputEl.textContent=ws().sim.lastInput||'Waiting for input';
 if(rulesFiredEl)rulesFiredEl.textContent=String((ws().sim.firedRules||[]).length);
 if(resultEl)resultEl.textContent=ws().sim.lastResult||'Ready';
 let entries=ws().sim.trace||[];
 traceEl.innerHTML=entries.length?entries.slice(-40).map(x=>`<div class="traceLine ${esc(x.kind)}" style="--depth:${Math.min(Number(x.depth)||0,5)}"><span class=traceMark>${x.kind==='input'?'▶':x.kind==='manual'?'◆':x.kind==='event'?'◆':x.kind==='complete'?'✓':x.kind==='rule'?'↳':'→'}</span><span>${esc(x.text)}</span></div>`).join(''):'<div class=traceEmpty>Nothing yet. Try a playfield input.</div>';
 if(stepEl)stepEl.textContent=entries.length?`${entries.length} trace step${entries.length===1?'':'s'}`:'Ready to test';
 document.querySelectorAll('.traceRule').forEach(x=>x.classList.remove('fired'));for(let id of ws().sim.firedRules.slice(-3)){let e=document.getElementById('trace_'+id);if(e)e.classList.add('fired')};
 refreshGuidedTest();refreshTutorialPanel();guidedHighlight()
}


/* ===== app.js ===== */
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
async function api(path,body){
 if(window.pywebview&&window.pywebview.api){
   const b=body||{};
   if(path==='/api/pick-folder')return await window.pywebview.api.pick_folder();
   if(path==='/api/open')return await window.pywebview.api.open_project(b.path||'');
   if(path==='/api/mode')return await window.pywebview.api.mode(b.name||'');
   if(path==='/api/import-mode')return await window.pywebview.api.import_mode(b.name||'');
   if(path==='/api/install-preview')return await window.pywebview.api.install_preview(b.mode||'');
   if(path==='/api/install-mode')return await window.pywebview.api.install_mode(b.mode||'',b.yaml||'');
   throw new Error('Unknown PinBlocks desktop API path: '+path);
 }
 let r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 return await r.json();
}
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
 // Returning home always leaves the guided lesson. Tutorial state must never
 // leak into an existing/imported mode.
 tutorialActive=false;guidedModeName=null;
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
 <div class=homeChoices><div class=homeChoice><h3>Build Freely</h3><p class=small>Already know the basics? Start with an empty mode.</p><button onclick="openFreeModeWizard()">＋ Build a New Mode</button><button style="margin-top:8px" onclick="openRandomMode()"><span class=randomMark>?</span> Generate Random Mode</button></div>
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
 // Existing modes are read-only sandboxes, never tutorial exercises.
 tutorialActive=false;guidedModeName=null;
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
 // Tutorial state belongs only to the specific guided practice mode.
 if(tutorialActive&&n!==guidedModeName)tutorialActive=false;
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
function openModeWizard(){
 // Any normal "Build a New Mode" entry point must leave Guided Build.
 // startFirstModeTutorial() sets tutorialActive immediately before opening the wizard.
 if(!guidedModeName) tutorialActive=false;
 wmName.value=tutorialActive?nextGuidedModeName():'target_practice';wmStart.value='ball_started';wmStop.value='ball_ended';wmPriority.value=100;wmVersion.value=detectVersion();modeModal.style.display='flex'
}
function openFreeModeWizard(){tutorialActive=false;guidedModeName=null;openModeWizard()}
function detectVersion(){return 6}
function wizardStartChoice(){if(wmStartChoice.value!=='custom')wmStart.value=wmStartChoice.value;else wmStart.value='start_my_mode'}
function wizardStopChoice(){if(wmStopChoice.value!=='custom')wmStop.value=wmStopChoice.value;else wmStop.value='stop_my_mode'}
function createMode(){let n=wmName.value.trim().replace(/\s+/g,'_');if(!n)return alert('Give the mode a name.');if(!/^[A-Za-z0-9_]+$/.test(n))return alert('Mode names may contain only letters, numbers, and underscores.');if(spaces[n])return alert('That mode already exists.');if(tutorialActive)guidedModeName=n;let w=blank(n,true);w.settings={start:wmStart.value.trim(),stop:wmStop.value.trim(),priority:Number(wmPriority.value||100),version:Number(wmVersion.value||6)};spaces[n]=w;currentMode=n;modeModal.style.display='none';
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
function view(v){if(tutorialActive){let g=guidedState();if(g&&v==='test'&&g.step<4){currentView=g.view;render();return}}currentView=v;render()}
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
   // Imported modes are read-only inspection sandboxes. They do not need to be
   // recompiled, and skipping compilation keeps unsupported legacy MPF config
   // from being treated like a PinBlocks-authored mode.
   if(!ws().imported)compile();
   renderRegistry();
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
</div></div><div class=ruleSearchBar><button onclick="toggleRuleDensity()" ${all.length?'':'disabled title="Create a rule first"'}>${compactRules?'Comfortable':'Compact'} view</button><span>${all.length ? `${all.length} rule${all.length===1?'':'s'}` : 'No rules yet'}</span></div>${tutorialActive||!all.length?'':validationHtml()}${body||'<div class=hint><b>No rules yet.</b> Create your first WHEN → DO rule below.</div>'}${tutorialActive&&guidedLessonParts().rule?'':`<div class=wizardbox><h3>Add a rule</h3><button class=primary onclick="triggerModal.style.display='flex'">＋ Create Rule</button></div>`}${tutorialActive&&guidedState()?.step<4?'':`<button class=nextbtn onclick="view('test')">Next: Test Your Mode →</button>`}`}
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
let tutorialActive=false, guidedModeName=null, guidedBaselineScore=0;
function startFirstModeTutorial(){
 tutorialActive=true;guidedModeName=null;openModeWizard();
 setTimeout(()=>{let modal=document.querySelector('#modeModal .modal')||document.getElementById('modeModal');if(!modal)return;
 modal.insertAdjacentHTML('afterbegin',`<div class=tutorialCard><div class=guideEyebrow>GUIDED BUILD · START</div><h3>Build one working piece of gameplay</h3><p>You’ll connect a real switch to a shot, count 3 hits, add scoring, and prove it works in Test.</p><p class=small>PinBlocks picked an unused practice-mode name for you. You can leave it as-is.</p></div>`);},0)
}
function guidedLessonParts(){
 let w=ws(),shots=Object.keys(w?.shots||{}),counters=Object.keys(w?.counters||{});
 let shot=shots[0]||'',counter=counters[0]||'',cd=counter?w.counters[counter]:null;
 let candidates=(w?.rules||[]).filter(r=>r.trigger?.type==='shot'&&r.trigger.value===shot);
 let rule=candidates.find(r=>r.actions?.some(x=>x.type==='score'&&Number(x.value)>0)&&r.actions?.some(x=>x.type==='advance_counter'&&x.value===counter))||candidates.find(r=>r.actions?.some(x=>x.type==='score'&&Number(x.value)>0))||candidates.find(r=>r.actions?.some(x=>x.type==='advance_counter'&&x.value===counter))||candidates[0];
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
 if(!p.rule)return {step:3,title:'Connect the gameplay',text:`Create one rule: WHEN ${p.shot} is made → score points AND advance ${p.counter}.`,view:'rules',target:'createRule'};
 if(!p.hasScore)return {step:3,title:'Add scoring',text:`Rule 1 is connected to ${p.shot}. Now add a Score points action to this same rule.`,view:'rules',target:'addScore'};
 if(!p.hasAdvance)return {step:3,title:'Advance the counter',text:`Scoring is connected. Add another action to this same rule and choose Advance a counter → ${p.counter}.`,view:'rules',target:'addCounter'};
 return {step:4,title:'Prove it works',text:`Make ${p.shot} three times. The checklist below verifies the shot fires, score increases, and ${p.counter} reaches 3.`,view:'test',target:'test'};
}
function guideTrack(step,lessonComplete=false){
 let names=['SHOT','COUNTER','RULE','TEST'];
 return `<div class=guideTrack>${names.map((n,i)=>{
   let nstep=i+1, done=nstep<step||(lessonComplete&&nstep===4), active=nstep===step&&!done;
   return `<div class="guideTrackStep ${done?'done':active?'active':'future'}"><span>${done?'✓':nstep}</span><b>${n}</b><small>${done?'Complete':active?'Current step':'Coming up'}</small></div>`;
 }).join('')}</div>`;
}
function tutorialPanel(){
 let g=guidedState();if(!g)return '';
 let complete=g.step===4&&typeof guidedTestData==='function'&&!!guidedTestData()?.success;
 return `<div class=guidedPanel id=guidedPanel>${guideTrack(g.step,complete)}<div class=guideLesson><div><div class=guideEyebrow>GUIDED BUILD · STEP ${g.step} OF 4</div><h3>${complete?'Your first mode works!':g.title}</h3><p>${complete?'Test complete. The shot fires, scoring works, and the counter reached its goal.':g.text}</p></div><button class=guideExit onclick="exitTutorial()">Exit guide</button></div></div>`;
}
function exitTutorial(){tutorialActive=false;guidedModeName=null;currentView='settings';render()}
function refreshTutorialPanel(){
 let el=document.getElementById('guidedPanel');if(!el)return;
 let html=tutorialPanel(),box=document.createElement('div');box.innerHTML=html;
 let fresh=box.firstElementChild;if(fresh)el.replaceWith(fresh);
}
function guidedHighlight(){
 document.querySelectorAll('.guidedNext').forEach(x=>x.classList.remove('guidedNext'));
 let g=guidedState();if(!g)return;let buttons=[...document.querySelectorAll('button')],el=null;
 if(g.target==='shot')el=buttons.find(x=>x.textContent.includes('Create Shot'));
 if(g.target==='counter')el=buttons.find(x=>x.textContent.includes('Create Counter'));
 if(g.target==='counterEdit'){let p=guidedLessonParts(),card=[...document.querySelectorAll('.card')].find(x=>x.textContent.includes(p.counter));el=card?[...card.querySelectorAll('button')].find(x=>x.textContent.trim()==='Edit'):null}
 if(g.target==='createRule')el=buttons.find(x=>x.textContent.includes('Create Rule'));
 if(g.target==='addScore'||g.target==='addCounter'){let p=guidedLessonParts();el=buttons.find(x=>x.textContent.includes(p.rule?.actions?.length?'Add another action':'Add the first action'));}
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

