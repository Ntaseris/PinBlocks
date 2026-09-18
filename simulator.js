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
 document.querySelectorAll('.traceRule').forEach(x=>x.classList.remove('fired'));for(let id of ws().sim.firedRules.slice(-3)){let e=document.getElementById('trace_'+id);if(e)e.classList.add('fired')};refreshGuidedTest()
}
