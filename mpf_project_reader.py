#!/usr/bin/env python3
from __future__ import annotations
import json
from collections import defaultdict
from pathlib import Path
try:
    import yaml
except ImportError:
    raise SystemExit("PyYAML is required. Install with: python -m pip install pyyaml")

SECTIONS=("switches","coils","lights","shots","shot_groups","counters","timers",
"sequences","state_machines","multiballs","ball_devices","drop_targets",
"drop_target_banks","accruals","event_player","variable_player","show_player",
"sound_player","slide_player")
EVENT_KEYS={"events_when_complete","events_when_hit","start_events","stop_events",
"enable_events","disable_events","reset_events","restart_events","pause_events",
"resume_events","count_events","control_events"}

class MPFProjectReader:
    def __init__(self, root):
        self.root=Path(root).expanduser().resolve()
        self.items={s:defaultdict(list) for s in SECTIONS}
        self.modes={}
        self.events=defaultdict(set)
        self.files=[]
        self.errors=[]

    def yaml_files(self):
        config=self.root/"config"
        if config.is_dir():
            for f in sorted(config.rglob("*")):
                if f.is_file() and f.suffix.lower() in (".yaml",".yml"): yield f,None
        modes=self.root/"modes"
        if modes.is_dir():
            for md in sorted(x for x in modes.iterdir() if x.is_dir()):
                self.modes.setdefault(md.name,[])
                cfg=md/"config"
                if cfg.is_dir():
                    for f in sorted(cfg.rglob("*")):
                        if f.is_file() and f.suffix.lower() in (".yaml",".yml"): yield f,md.name

    def scan(self):
        if not self.root.is_dir(): raise ValueError(f"Not a directory: {self.root}")
        found=False
        for f,mode in self.yaml_files():
            found=True; self.read(f,mode)
        if not found: raise ValueError("No YAML found under config/ or modes/*/config/")
        return self

    def read(self,f,mode):
        rel=str(f.relative_to(self.root))
        try: data=yaml.safe_load(f.read_text(encoding="utf-8-sig")) or {}
        except Exception as e:
            self.errors.append((rel,str(e))); return
        if not isinstance(data,dict):
            self.errors.append((rel,"Top-level YAML is not a mapping")); return
        self.files.append(rel)
        if mode: self.modes.setdefault(mode,[]).append(rel)
        for section in SECTIONS:
            vals=data.get(section)
            if isinstance(vals,dict):
                for name,value in vals.items():
                    self.items[section][str(name)].append({"file":rel,"mode":mode,"data":value})
                    if section=="event_player":
                        self.event(str(name),rel); self.posted(value,rel)
        self.walk(data,rel)

    def event(self,name,source):
        if isinstance(name,str) and name.strip(): self.events[name.strip()].add(source)
    def posted(self,v,source):
        if isinstance(v,str): self.event(v,source)
        elif isinstance(v,list):
            for x in v: self.posted(x,source)
        elif isinstance(v,dict):
            for k in v: self.event(str(k),source)
    def event_value(self,v,source):
        if isinstance(v,str):
            for x in v.split(","): self.event(x,source)
        elif isinstance(v,list):
            for x in v: self.event_value(x,source)
        elif isinstance(v,dict):
            if "event" in v: self.event(v["event"],source)
            for k,x in v.items():
                if k!="event": self.event_value(x,source)
    def walk(self,obj,source):
        if isinstance(obj,dict):
            for k,v in obj.items():
                k=str(k)
                if k in EVENT_KEYS or k.endswith("_events"): self.event_value(v,source)
                self.walk(v,source)
        elif isinstance(obj,list):
            for x in obj: self.walk(x,source)

    def result(self):
        out={"project":str(self.root),"project_name":self.root.name,"files_read":len(self.files),
             "counts":{s:len(self.items[s]) for s in SECTIONS},
             "items":{s:sorted(self.items[s]) for s in SECTIONS},
             "modes":sorted(self.modes),"events":sorted(self.events),
             "errors":[{"file":f,"error":e} for f,e in self.errors]}
        out["counts"]["modes"]=len(self.modes)
        out["counts"]["events_discovered"]=len(self.events)
        return out
