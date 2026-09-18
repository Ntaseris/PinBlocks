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
