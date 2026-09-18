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
