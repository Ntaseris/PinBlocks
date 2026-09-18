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
