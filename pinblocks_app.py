#!/usr/bin/env python3
from __future__ import annotations
import re, shutil, os
from datetime import datetime
from pathlib import Path
import sys
import yaml
from mpf_project_reader import MPFProjectReader


def resource_path(name):
    """Resolve bundled static assets both from source and a PyInstaller build."""
    base = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent))
    return base / name

APP_VERSION="0.32.0 Beta 1"
state={"project":None,"root":None}

def scan_project(path):
    p=Path(path).expanduser().resolve()
    state["root"]=p
    return MPFProjectReader(p).scan().result()

def merge_dict(dst, src):
    for k,v in src.items():
        if isinstance(v,dict) and isinstance(dst.get(k),dict):
            merge_dict(dst[k],v)
        elif k not in dst:
            dst[k]=v
        elif isinstance(dst[k],dict) and isinstance(v,dict):
            merge_dict(dst[k],v)
    return dst

def mode_details(name):
    root=state.get("root")
    if not root: raise ValueError("Load a project first.")
    cfg=root/"modes"/name/"config"
    if not cfg.is_dir():
        return {"name":name,"exists":False,"files":[],"config":{}}
    merged={}; files=[]; errors=[]
    for f in sorted(cfg.rglob("*")):
        if f.is_file() and f.suffix.lower() in (".yaml",".yml"):
            rel=str(f.relative_to(root)); files.append(rel)
            try:
                data=yaml.safe_load(f.read_text(encoding="utf-8-sig")) or {}
                if isinstance(data,dict): merge_dict(merged,data)
            except Exception as e: errors.append({"file":rel,"error":str(e)})
    return {"name":name,"exists":True,"files":files,"config":merged,"errors":errors}



SUPPORTED_IMPORT_SECTIONS={"mode","shots","shot_profiles","counters","timers","event_player","variable_player"}

def _first(v, default=None):
    if isinstance(v,list): return v[0] if v else default
    return v if v is not None else default

def _events(v):
    if v is None:return []
    if isinstance(v,str):return [x.strip() for x in v.split(",") if x.strip()]
    if isinstance(v,list):return [str(x) for x in v if isinstance(x,(str,int,float))]
    return []

def _num(v,default=0):
    try:return int(v)
    except Exception:return default

def import_mode(name):
    details=mode_details(name)
    if not details.get("exists"):raise ValueError("Mode folder not found.")
    c=details.get("config") or {}
    w={"name":name,"isNew":False,"settings":{"start":"","stop":"","priority":100,"version":6},
       "rules":[],"shots":{},"counters":{},"timers":{},"events":[],
       "imported":True,"importSummary":{},"unsupported":[],"sourceFiles":details.get("files",[])}
    mode=c.get("mode") if isinstance(c.get("mode"),dict) else {}
    w["settings"]["start"]=str(_first(mode.get("start_events"),""))
    w["settings"]["stop"]=str(_first(mode.get("stop_events"),""))
    w["settings"]["priority"]=_num(mode.get("priority"),100)

    profiles=c.get("shot_profiles") if isinstance(c.get("shot_profiles"),dict) else {}
    shots=c.get("shots") if isinstance(c.get("shots"),dict) else {}
    for n,d in shots.items():
        if not isinstance(d,dict):continue
        sw=d.get("switch")
        if not isinstance(sw,str):
            w["unsupported"].append(f'Shot "{n}" does not use one simple switch.')
            continue
        profile=d.get("profile"); pd=profiles.get(profile,{}) if profile else {}
        states=[]
        if isinstance(pd,dict) and isinstance(pd.get("states"),list):
            for s in pd["states"]:
                if isinstance(s,dict) and s.get("name") is not None:states.append(str(s["name"]))
                elif isinstance(s,str):states.append(s)
        prog=bool(states)
        w["shots"][str(n)]={"switch":sw,"start_enabled":bool(d.get("start_enabled",True)),
            "enable_event":str(_first(d.get("enable_events"),"") or ""),
            "disable_event":str(_first(d.get("disable_events"),"") or ""),
            "progression":prog,"states":states or ["unlit","lit","complete"],
            "start_state":states[0] if states else "unlit","complete_event":str(n)+"_complete"}
        known={"switch","start_enabled","enable_events","disable_events","profile"}
        extra=sorted(set(d)-known)
        if extra:w["unsupported"].append(f'Shot "{n}" has additional MPF settings: '+", ".join(extra))

    counters=c.get("counters") if isinstance(c.get("counters"),dict) else {}
    count_event_map={}
    for n,d in counters.items():
        if not isinstance(d,dict):continue
        direction=str(d.get("direction","up"))
        start=_num(d.get("starting_count"),0); complete=_num(d.get("count_complete_value"),5)
        ev=str(_first(d.get("events_when_complete"),str(n)+"_complete"))
        w["counters"][str(n)]={"direction":direction,"start":start,"complete":complete,"event":ev,
            "start_enabled":bool(d.get("start_enabled",True)),
            "disable_on_complete":bool(d.get("disable_on_complete",True)),
            "enable_event":str(_first(d.get("enable_events"),"") or ""),
            "disable_event":str(_first(d.get("disable_events"),"") or "")}
        count_event_map[str(n)]=_events(d.get("count_events"))
        known={"direction","starting_count","count_complete_value","events_when_complete","count_events",
               "start_enabled","disable_on_complete","enable_events","disable_events"}
        extra=sorted(set(d)-known)
        if extra:w["unsupported"].append(f'Counter "{n}" has additional MPF settings: '+", ".join(extra))

    timers=c.get("timers") if isinstance(c.get("timers"),dict) else {}
    timer_controls=[]
    for n,d in timers.items():
        if not isinstance(d,dict):continue
        direction=str(d.get("direction","down")); sv=_num(d.get("start_value"),10); ev=_num(d.get("end_value"),0)
        event=str(n)+"_complete"
        w["timers"][str(n)]={"direction":direction,"start":sv,"end":ev,"duration":abs(sv-ev),
            "event":event,"start_running":bool(d.get("start_running",False)),"start_event":"","stop_event":""}
        ce=d.get("control_events")
        if isinstance(ce,list):
            for x in ce:
                if isinstance(x,dict) and x.get("event") and x.get("action"):
                    timer_controls.append((str(x["event"]),str(n),str(x["action"])))
        known={"direction","start_value","end_value","start_running","control_events"}
        extra=sorted(set(d)-known)
        if extra:w["unsupported"].append(f'Timer "{n}" has additional MPF settings: '+", ".join(extra))

    # Build event -> actions, then emit one visual rule per event.
    actions={}
    def add(ev,typ,val):
        if not ev:return
        actions.setdefault(str(ev),[]).append({"type":typ,"value":val})
    vp=c.get("variable_player") if isinstance(c.get("variable_player"),dict) else {}
    for ev,val in vp.items():
        if isinstance(val,dict) and "score" in val and isinstance(val["score"],(int,float)):
            add(ev,"score",val["score"])
            extra=set(val)-{"score"}
            if extra:w["unsupported"].append(f'variable_player event "{ev}" also changes: '+", ".join(sorted(extra)))
        else:w["unsupported"].append(f'variable_player event "{ev}" is more complex than simple score.')
    ep=c.get("event_player") if isinstance(c.get("event_player"),dict) else {}
    for ev,val in ep.items():
        posted=[]
        if isinstance(val,str):posted=[val]
        elif isinstance(val,list):posted=[x for x in val if isinstance(x,str)]
        elif isinstance(val,dict):posted=[str(x) for x in val.keys()]
        for x in posted:add(ev,"post_event",x)
        if not posted:w["unsupported"].append(f'event_player event "{ev}" could not be translated.')
    for counter,evs in count_event_map.items():
        for ev in evs:add(ev,"advance_counter",counter)
    amap={"start":"start_timer","stop":"stop_timer","reset":"reset_timer","restart":"restart_timer"}
    for ev,timer,action in timer_controls:
        if action in amap:add(ev,amap[action],timer)
        else:w["unsupported"].append(f'Timer "{timer}" control action "{action}" is not visualized.')

    counter_complete={d["event"]:n for n,d in w["counters"].items()}
    # MPF timer completion events are timer_<name>_complete. PinBlocks-authored\n    # timers also carry an event field for its visual model; accept either form\n    # when importing so our own generated modes round-trip correctly.\n    timer_complete={f"timer_{n}_complete":n for n in w["timers"]}\n    timer_complete.update({d["event"]:n for n,d in w["timers"].items() if d.get("event")})
    shot_events={f"{n}_hit":n for n in w["shots"]}
    rid=1; bid=1
    for ev,acts in actions.items():
        if ev in shot_events:tt,tv="shot",shot_events[ev]
        elif ev in counter_complete:tt,tv="counter_complete",counter_complete[ev]
        elif ev in timer_complete:tt,tv="timer_complete",timer_complete[ev]
        elif ev.endswith("_active") and ev[:-7] in (state.get("project") or {}).get("items",{}).get("switches",[]):tt,tv="switch",ev[:-7]
        else:tt,tv="event",ev
        rule={"id":rid,"open":False,"trigger":{"id":bid,"type":tt,"value":tv},"actions":[]};rid+=1;bid+=1
        for a in acts:
            rule["actions"].append({"id":bid,"type":a["type"],"value":a["value"]});bid+=1
        w["rules"].append(rule)

    top_extra=sorted(set(c)-SUPPORTED_IMPORT_SECTIONS)
    for s in top_extra:w["unsupported"].append(f'Unsupported section preserved in project but not visualized: {s}')
    w["importSummary"]={"shots":len(w["shots"]),"counters":len(w["counters"]),"timers":len(w["timers"]),
                        "rules":len(w["rules"]),"unsupported":len(w["unsupported"])}
    return w

MODE_NAME_RE=re.compile(r"^[A-Za-z0-9_]+$")
def machine_config():
    root=state.get("root")
    if not root: raise ValueError("Load an MPF project first.")
    p=root/"config"/"config.yaml"
    if not p.is_file(): raise ValueError("PinBlocks could not find config/config.yaml in the loaded project.")
    return p
def mode_paths(name):
    root=state["root"]; d=root/"modes"/name
    return d,d/"config"/f"{name}.yaml"
def register_mode_text(text,name):
    lines=text.splitlines(True); start=None
    for i,line in enumerate(lines):
        if re.match(r"^modes\s*:\s*(?:#.*)?$",line.rstrip("\r\n")): start=i;break
    if start is None:
        sep="" if not text or text.endswith(("\n","\r")) else "\n"
        return text+sep+"\nmodes:\n  - "+name+"\n",True
    end=len(lines)
    for i in range(start+1,len(lines)):
        raw=lines[i]
        if raw.strip() and not raw.lstrip().startswith("#") and len(raw)-len(raw.lstrip())==0: end=i;break
    block=lines[start+1:end]
    for line in block:
        m=re.match(r"^\s*-\s*([A-Za-z0-9_]+)\s*(?:#.*)?$",line.rstrip("\r\n"))
        if m and m.group(1)==name:return text,False
    indent="  "
    for line in block:
        m=re.match(r"^(\s*)-\s+",line)
        if m:indent=m.group(1);break
    lines.insert(end,f"{indent}- {name}\n"); return "".join(lines),True
def preview_install(name):
    if not MODE_NAME_RE.fullmatch(name or ""): raise ValueError("Mode names may contain only letters, numbers, and underscores.")
    cfg=machine_config(); root=state["root"]; mode_dir,mode_file=mode_paths(name)
    _,changed=register_mode_text(cfg.read_text(encoding="utf-8"),name); warnings=[]
    if mode_file.exists():warnings.append("That mode YAML already exists. PinBlocks will not overwrite it.")
    elif mode_dir.exists():warnings.append("That mode folder already exists; the target YAML does not.")
    if not changed:warnings.append("The mode is already in the machine modes list.")
    return {"mode":name,"mode_file":str(mode_file.relative_to(root)),"machine_config":str(cfg.relative_to(root)),"warnings":warnings,"target_exists":mode_file.exists()}
def install_mode(name,yaml_text):
    info=preview_install(name)
    if info["target_exists"]:raise ValueError("The target mode YAML already exists. PinBlocks will not overwrite an existing mode.")
    cfg=machine_config(); root=state["root"]; _,mode_file=mode_paths(name)
    original=cfg.read_text(encoding="utf-8"); updated,changed=register_mode_text(original,name); backup=None
    mode_file.parent.mkdir(parents=True,exist_ok=True)
    try:
        mode_file.write_text((yaml_text or "").rstrip()+"\n",encoding="utf-8")
        if changed:
            backup=cfg.with_name("config.yaml.pinblocks-backup-"+datetime.now().strftime("%Y%m%d-%H%M%S"))
            shutil.copy2(cfg,backup); cfg.write_text(updated,encoding="utf-8")
    except Exception:
        try:mode_file.unlink()
        except Exception:pass
        raise
    return {"mode":name,"mode_file":str(mode_file.relative_to(root)),"machine_config":str(cfg.relative_to(root)),"backup":str(backup.relative_to(root)) if backup else None}

class DesktopAPI:
    """Python API exposed directly to the PinBlocks desktop window."""
    def app_info(self):
        return {"app":"PinBlocks","version":APP_VERSION}

    def pick_folder(self):
        import webview
        window=webview.windows[0] if webview.windows else None
        if not window:return {"path":""}
        result=window.create_file_dialog(webview.FileDialog.FOLDER)
        path=""
        if result:
            path=result[0] if isinstance(result,(list,tuple)) else str(result)
        return {"path":path}

    def open_project(self, path=""):
        path=(path or "").strip()
        if not path:return {"error":"Choose an MPF project folder."}
        try:
            state["project"]=scan_project(path)
            return state["project"]
        except Exception as e:return {"error":str(e)}

    def mode(self, name=""):
        try:return mode_details(name or "")
        except Exception as e:return {"error":str(e)}

    def import_mode(self, name=""):
        try:return import_mode(name or "")
        except Exception as e:return {"error":str(e)}

    def install_preview(self, mode=""):
        try:return preview_install(mode or "")
        except Exception as e:return {"error":str(e)}

    def install_mode(self, mode="", yaml=""):
        try:return globals()["install_mode"](mode or "",yaml or "")
        except Exception as e:return {"error":str(e)}


def main():
    import webview
    api=DesktopAPI()
    # Serve the bundled frontend through pywebview's lifecycle-managed internal
    # asset server. This avoids macOS WebKit's unreliable file:// handling in a
    # frozen .app while keeping the Python API on the direct JS bridge.
    asset_root=resource_path(".").resolve()
    os.chdir(asset_root)
    webview.create_window(
        f"PinBlocks — {APP_VERSION}",
        "index.html",
        js_api=api,
        width=1440,
        height=900,
        min_size=(1100,700),
        resizable=True,
        background_color="#f4f4f2",
    )
    webview.start(debug=False,http_server=True)

if __name__=="__main__":main()
