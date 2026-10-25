import {useCallback,useEffect,useState} from 'react';
import type {RawRoadmap,ReferenceMapId} from './reference-roadmaps';
export interface ReferencePayload {
  roadmap:RawRoadmap;guides:Record<string,string>;
  source:{url:string;revision:string;checkedAt:string;licenseUrl:string};
  audit:{nodes:number;edges:number;skills:number;groups:number};
}
const memory=new Map<ReferenceMapId,ReferencePayload>();
const key=(map:ReferenceMapId)=>`learning-os:reference-cache:v1:${map}`;
function valid(value:unknown):value is ReferencePayload {
  const p=value as ReferencePayload;return !!p?.roadmap&&Array.isArray(p.roadmap.nodes)&&Array.isArray(p.roadmap.edges)&&p.roadmap.nodes.length>0&&!!p.source?.revision&&!!p.guides;
}
export function useReferenceRoadmap(map:ReferenceMapId,enabled:boolean) {
  const [payloads,setPayloads]=useState<Partial<Record<ReferenceMapId,ReferencePayload>>>({});
  const [error,setError]=useState(''),[loading,setLoading]=useState(false),[attempt,setAttempt]=useState(0);
  useEffect(()=>{
    const stored:Partial<Record<ReferenceMapId,ReferencePayload>>={};
    for(const id of ['java','backend'] as ReferenceMapId[])try{const p=JSON.parse(localStorage.getItem(key(id))??'null');if(valid(p)){stored[id]=p;memory.set(id,p);}}catch{}
    setPayloads(old=>({...stored,...old}));
  },[]);
  useEffect(()=>{
    if(!enabled)return;
    let active=true;const controller=new AbortController();
    const cached=memory.get(map);if(cached)setPayloads(old=>({...old,[map]:cached}));
    else try{const p=JSON.parse(localStorage.getItem(key(map))??'null');if(valid(p)){memory.set(map,p);setPayloads(old=>({...old,[map]:p}));}}catch{/* A graph cache is expendable; progress is separate. */}
    setLoading(true);setError('');
    void fetch(`/api/reference-roadmaps/${map}`,{signal:controller.signal,credentials:'same-origin'}).then(async response=>{
      if(!response.ok)throw Error('The official roadmap could not be loaded. Retry when online; saved progress is unchanged.');
      const p=await response.json();if(!valid(p))throw Error('The official roadmap response is incomplete.');
      if(active){memory.set(map,p);setPayloads(old=>({...old,[map]:p}));try{localStorage.setItem(key(map),JSON.stringify(p));}catch{/* Cloud progress is unaffected by cache space. */}}
    }).catch(()=>{if(active&&!controller.signal.aborted)setError('The official roadmap could not be loaded. Retry when online; saved progress is unchanged.');}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;controller.abort();};
  },[map,enabled,attempt]);
  return{payload:payloads[map]??memory.get(map),payloads,loading,error,retry:useCallback(()=>setAttempt(n=>n+1),[])};
}
