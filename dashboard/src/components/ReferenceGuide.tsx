import {useEffect,useState} from 'react';
import type {ReferenceInfo} from '../lib/reference-learning';
import {getResources} from '../lib/learning';
import type {Progress} from '../lib/types';

export function parseGuide(markdown:string) {
  const text=markdown.replace(/```[\s\S]*?```/g,'').replace(/!\[[^\]]*\]\([^)]*\)/g,'');
  const links=[...text.matchAll(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g)].flatMap(match=>{
    try{const url=new URL(match[2]);return url.username||url.password?[]:[{title:match[1].replace(/`/g,''),url:url.href,video:/youtube\.com|youtu\.be|vimeo\.com/i.test(url.hostname)}];}catch{return[];}
  });
  const paragraphs=text.replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/^#{1,6}\s+.*$/gm,'').replace(/^\s*[-*>]\s*/gm,'').replace(/[`*_]/g,'').split(/\n\s*\n/).map(part=>part.trim()).filter(part=>part&&!/^visit the following resources/i.test(part));
  return{paragraphs,links:[...new Map(links.map(link=>[link.url,link])).values()]};
}
const cache=new Map<string,{markdown:string;url:string}>();
export function ReferenceGuide({reference,skillId,progress,onChange,onResource}:{reference:ReferenceInfo;skillId:string;progress:Progress;onChange:(edit:(p:Progress)=>Progress)=>void;onResource:(id?:string)=>void}) {
  const key=`${reference.map}:${reference.nodeId}:${reference.revision}`;
  const [guide,setGuide]=useState<{markdown:string;url:string}|undefined>(cache.get(key)),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
  useEffect(()=>{
    const cached=cache.get(key);
    let active=true;const controller=new AbortController();setError('');setGuide(cached);
    try{const stored=JSON.parse(localStorage.getItem(`learning-os:guide:v1:${key}`)??'null');if(stored?.markdown&&typeof stored.url==='string'){cache.set(key,stored);setGuide(stored);}}catch{}
    void fetch(`/api/reference-roadmaps/${reference.map}?node=${encodeURIComponent(reference.nodeId)}`,{signal:controller.signal,credentials:'same-origin'}).then(async response=>{if(!response.ok)throw Error('This guide is temporarily unavailable. You can still save notes and progress.');const value=await response.json() as {markdown:string;url:string};if(typeof value.markdown!=='string'||typeof value.url!=='string')throw Error('Invalid topic guide.');if(active){cache.set(key,value);setGuide(value);try{localStorage.setItem(`learning-os:guide:v1:${key}`,JSON.stringify(value));}catch{}}}).catch(cause=>{if(active&&!controller.signal.aborted)setError(cause instanceof Error?cause.message:'Guide unavailable.');});
    return()=>{active=false;controller.abort();};
  },[key,reference.map,reference.nodeId,attempt]);
  const parsed=guide?parseGuide(guide.markdown):undefined,resources=getResources(progress).filter(resource=>!resource.archived);
  return <section className="topic-section reference-guide"><h3>Official topic guide</h3><p className="fine-print">From <a href={reference.sourceUrl} target="_blank" rel="noreferrer">roadmap.sh</a> · loaded for personal study. Exercises below are your separate practice.</p>{error&&<p className="reference-guide-error" role="status">{error}<button className="text-button" onClick={()=>setAttempt(n=>n+1)}>Retry guide</button></p>}{!guide&&!error&&<p className="fine-print" role="status">Loading this skill’s explanation and materials…</p>}{parsed&&<><div className="reference-guide-explanation">{parsed.paragraphs.slice(0,3).map((text,index)=><p key={index}>{text}</p>)}</div>{parsed.paragraphs.length>3&&<details className="skill-practice-option"><summary>Read the rest of the guide</summary>{parsed.paragraphs.slice(3).map((text,index)=><p key={index}>{text}</p>)}</details>}<div className="resource-list">{parsed.links.map(link=><a key={link.url} href={link.url} target="_blank" rel="noreferrer"><span><strong>{link.title}</strong><small>{link.video?'VIDEO / PLAYLIST':'DOCUMENTATION / LEARNING RESOURCE'}</small></span><span>↗</span></a>)}</div>{!parsed.links.some(link=>link.video)&&<p className="fine-print">No video link in this guide. Add a YouTube resource below if you use one.</p>}</>}<a className="text-button" href={guide?.url??reference.guideUrl} target="_blank" rel="noreferrer">Open source guide ↗</a>
    <details className="learning-associations reference-link-resources"><summary>Link your courses, videos or books</summary><p className="fine-print">Linking a resource never changes course or skill completion.</p>{resources.map(resource=><label key={resource.id}><input type="checkbox" checked={resource.skillIds.includes(skillId)} onChange={event=>{const checked=event.target.checked;onChange(p=>{const current=getResources(p).find(item=>item.id===resource.id)!;return{...p,resources:{...p.resources,[current.id]:{...current,skillIds:checked?[...new Set([...current.skillIds,skillId])]:current.skillIds.filter(id=>id!==skillId),updatedAt:new Date().toISOString()}}};});}}/>{resource.title}</label>)}<button className="text-button" onClick={()=>onResource()}>Add a resource in Courses →</button></details>
  </section>;
}
