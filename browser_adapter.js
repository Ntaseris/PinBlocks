(function(){
  const isDesktop=()=>!!(window.pywebview&&window.pywebview.api);
  const sections=['switches','coils','lights','shots','shot_groups','counters','timers','sequences','state_machines','multiballs','ball_devices','drop_targets','drop_target_banks','accruals','event_player','variable_player','show_player','sound_player','slide_player'];
  const eventKeys=new Set(['events_when_complete','events_when_hit','start_events','stop_events','enable_events','disable_events','reset_events','restart_events','pause_events','resume_events','count_events','control_events']);
  let selectedFiles=[],parsedFiles=[],browserProject=null;
  const demoFiles=[
    {path:'config/config.yaml',text:'#config_version=6\nhardware:\n  platform: smart_virtual\nswitches:\n  s_left_target:\n    number: 1\n  s_center_target:\n    number: 2\n  s_right_target:\n    number: 3\nlights:\n  l_left_target:\n    number: 1\n  l_center_target:\n    number: 2\n  l_right_target:\n    number: 3\nmodes:\n  - base\n'},
    {path:'modes/base/config/base.yaml',text:'#config_version=6\nmode:\n  start_events: ball_started\n  stop_events: ball_ended\n  priority: 100\n'}
  ];
  const cleanPath=p=>String(p||'').replace(/\\/g,'/').replace(/^\.\//,'');
  function addEvents(value,out){
    if(typeof value==='string')value.split(',').forEach(x=>{x=x.trim();if(x)out.add(x)});
    else if(Array.isArray(value))value.forEach(x=>addEvents(x,out));
    else if(value&&typeof value==='object')Object.values(value).forEach(x=>addEvents(x,out));
  }
  function walk(obj,out){
    if(Array.isArray(obj))return obj.forEach(x=>walk(x,out));
    if(!obj||typeof obj!=='object')return;
    Object.entries(obj).forEach(([k,v])=>{if(eventKeys.has(k)||k.endsWith('_events'))addEvents(v,out);walk(v,out)});
  }
  function readProject(files,name){
    const items=Object.fromEntries(sections.map(s=>[s,new Set()])),modes=new Set(),registeredModes=new Set(),events=new Set(),errors=[];
    parsedFiles=[];
    for(const f of files){
      const path=cleanPath(f.path);if(!/\.ya?ml$/i.test(path))continue;
      if(!(/^config\//.test(path)||/^modes\/[^/]+\/config\//.test(path)))continue;
      let data={};try{data=window.jsyaml.load(f.text)||{};if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('Top-level YAML is not a mapping')}catch(e){errors.push({file:path,error:e.message});continue}
      const mm=path.match(/^modes\/([^/]+)\/config\//);if(mm)modes.add(mm[1]);
      if(/^config\/[^/]+\.ya?ml$/i.test(path)&&Array.isArray(data.modes))data.modes.forEach(m=>{if(typeof m==='string')registeredModes.add(m)});
      sections.forEach(s=>{if(data[s]&&typeof data[s]==='object'&&!Array.isArray(data[s]))Object.keys(data[s]).forEach(k=>items[s].add(String(k)))});
      walk(data,events);parsedFiles.push({path,text:f.text,data,mode:mm&&mm[1]});
    }
    if(!parsedFiles.length)throw new Error('No YAML found under config/ or modes/*/config/. Choose the root MPF game folder.');
    const result={project:'browser',project_name:name||'MPF Browser Project',files_read:parsedFiles.length,counts:{},items:{},modes:[...modes].sort(),registered_modes:[...registeredModes].sort(),events:[...events].sort(),errors};
    sections.forEach(s=>{result.items[s]=[...items[s]].sort();result.counts[s]=result.items[s].length});result.counts.modes=result.modes.length;result.counts.events_discovered=result.events.length;
    browserProject=result;return result;
  }
  function modeData(name){
    const files=parsedFiles.filter(f=>f.mode===name),merged={};
    const merge=(a,b)=>Object.entries(b||{}).forEach(([k,v])=>{if(v&&typeof v==='object'&&!Array.isArray(v)&&a[k]&&typeof a[k]==='object'&&!Array.isArray(a[k]))merge(a[k],v);else if(!(k in a))a[k]=v});
    files.forEach(f=>merge(merged,f.data));return {name,exists:files.length>0,files:files.map(f=>f.path),config:merged,errors:[]};
  }
  function simpleImport(name){
    const c=modeData(name).config||{},mode=c.mode||{},first=v=>Array.isArray(v)?v[0]:v;
    const w={name,isNew:false,settings:{start:String(first(mode.start_events)||''),stop:String(first(mode.stop_events)||''),priority:Number(mode.priority||100),version:6},rules:[],shots:{},counters:{},timers:{},events:[],imported:true,importSummary:{},unsupported:[],sourceFiles:modeData(name).files};
    Object.entries(c.shots||{}).forEach(([n,d])=>{if(d&&typeof d.switch==='string')w.shots[n]={switch:d.switch,start_enabled:d.start_enabled!==false,enable_event:String(first(d.enable_events)||''),disable_event:String(first(d.disable_events)||''),progression:false,states:['unlit','lit','complete'],start_state:'unlit',complete_event:n+'_complete'};else w.unsupported.push('Shot "'+n+'" does not use one simple switch.')});
    Object.entries(c.counters||{}).forEach(([n,d])=>{w.counters[n]={start:Number(d.starting_count||0),complete:Number(d.count_complete_value||5),direction:d.direction||'up',event:String(first(d.events_when_complete)||n+'_complete'),start_enabled:d.start_enabled!==false,disable_on_complete:d.disable_on_complete!==false,enable_event:String(first(d.enable_events)||''),disable_event:String(first(d.disable_events)||'')}});
    Object.entries(c.timers||{}).forEach(([n,d])=>{w.timers[n]={start:Number(d.start_value??10),end:Number(d.end_value??0),direction:d.direction||'down',event:n+'_complete',start_running:!!d.start_running,start_event:'',stop_event:''}});
    const actions={};const add=(e,t,v)=>{if(e)(actions[e]??=[]).push({type:t,value:v})};
    Object.entries(c.variable_player||{}).forEach(([e,v])=>{if(v&&typeof v.score==='number')add(e,'score',v.score);else w.unsupported.push('Complex variable_player event "'+e+'" was not translated.')});
    Object.entries(c.event_player||{}).forEach(([e,v])=>{(typeof v==='string'?[v]:Array.isArray(v)?v:Object.keys(v||{})).forEach(x=>add(e,'post_event',x))});
    let rid=1,bid=1;Object.entries(actions).forEach(([e,aa])=>w.rules.push({id:rid++,open:false,trigger:{id:bid++,type:'event',value:e},actions:aa.map(a=>({id:bid++,...a}))}));
    w.importSummary={shots:Object.keys(w.shots).length,counters:Object.keys(w.counters).length,timers:Object.keys(w.timers).length,rules:w.rules.length,unsupported:w.unsupported.length};return w;
  }
  async function chooseFolder(){
    const input=document.getElementById('browserFolderInput');
    return new Promise(resolve=>{input.value='';input.onchange=async()=>{selectedFiles=await Promise.all([...input.files].filter(f=>/\.ya?ml$/i.test(f.name)).map(async f=>({path:f.webkitRelativePath||f.name,text:await f.text()})));let root=(input.files[0]?.webkitRelativePath||'').split('/')[0]||'MPF Project';try{readProject(selectedFiles.map(f=>({path:f.path.split('/').slice(1).join('/'),text:f.text})),root);resolve({path:root})}catch(e){resolve({error:e.message})}};input.click()})
  }
  window.PinBlocksBrowser={
    active:()=>!isDesktop(),
    async api(path,body={}){
      if(path==='/api/pick-folder')return chooseFolder();
      if(path==='/api/open')return browserProject||{error:'Choose an MPF game folder or try the demo machine first.'};
      if(path==='/api/import-mode')try{return simpleImport(body.name)}catch(e){return{error:e.message}};
      if(path==='/api/mode')return modeData(body.name);
      if(path==='/api/install-preview'||path==='/api/install-mode')return{error:'Direct installation is available in the PinBlocks desktop app. In the browser, download the generated YAML and add it to your MPF project.'};
      return{error:'Unsupported browser action.'};
    },
    loadDemo(){selectedFiles=demoFiles;return readProject(demoFiles,'PinBlocks Demo Machine')}
  };
  document.addEventListener('DOMContentLoaded',()=>{if(isDesktop())document.querySelectorAll('.webOnly').forEach(x=>x.style.display='none');else{document.body.classList.add('browserEdition');const p=document.getElementById('projectPath');if(p)p.closest('details').style.display='none';const b=document.querySelector('.loadProjectBtn');if(b)b.style.display='none';document.querySelector('.headerVersion').textContent+=' · Web Beta'}});
})();
