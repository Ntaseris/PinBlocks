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
