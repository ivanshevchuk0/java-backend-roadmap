import { allTopics } from './skill-catalog';
import { isReferenceTopic, referenceSkillKey, type RawRoadmapNode, type ReferenceMapId } from '../lib/reference-roadmaps';

// Original semantic aliases only. Official diagrams/content are never bundled.
// One existing record can appear in both maps, but never represents two nodes in one map.
export const normalizeSkillLabel = (value: string) => value.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,' ').trim();
const aliases: Record<string,string> = {
  'learn the basics':'core-java','basics of oop':'oop','classes and objects':'java-classes',
  'basic syntax':'java-syntax','data types':'java-data-types','variables and scopes':'java-scope',
  'arrays':'java-arrays','strings and methods':'java-strings','pass by value pass by reference':'java-methods',
  'encapsulation':'java-encapsulation','inheritance':'java-inheritance','interfaces':'java-interfaces',
  'abstraction':'java-abstraction','static keyword':'java-static-final','method overloading overriding':'java-polymorphism',
  'packages':'java-packages','annotations':'java-annotations','enums':'java-enums','record':'java-records',
  'exception handling':'java-exceptions','set':'java-set','map':'java-map','queue':'java-queue','iterator':'java-iteration',
  'generic collections':'generics','lambda expressions':'lambdas','functional interfaces':'java-functional-interfaces',
  'stream api':'streams','optionals':'java-optional','i o operations':'io','file operations':'java-path-files',
  'threads':'java-threads','concurrency':'java-concurrency','virtual threads':'java-virtual-threads','java memory model':'java-memory-model',
  'maven':'java-maven-lifecycle','gradle':'java-gradle','javadoc':'java-documentation','junit':'junit','mocking mockito':'java-test-doubles',
  'jdbc':'java-jdbc','spring spring boot':'spring','spring data jpa':'persistence',
  'java':'core-java','what is http':'http','git':'git-maven','transactions':'transactions',
  'relational databases':'sql','postgresql':'persistence','n 1 problem':'java-relationships','unit testing':'junit','integration testing':'service-tests','ci cd':'ci',
};
const known = new Set(allTopics.map(topic=>topic.id));
export function aliasesForMap(map:ReferenceMapId,nodes:RawRoadmapNode[]):Map<string,string> {
  const used=new Set<string>(), result=new Map<string,string>();
  for(const node of nodes) {
    if(!isReferenceTopic(node)){result.set(node.id,referenceSkillKey(map,node.id));continue;}
    const key=normalizeSkillLabel(node.data.label??'');
    const exact=allTopics.find(topic=>normalizeSkillLabel(topic.title)===key)?.id;
    const candidate=aliases[key]??exact;
    if(candidate&&known.has(candidate)&&!used.has(candidate)) { result.set(node.id,candidate);used.add(candidate); }
    else result.set(node.id,referenceSkillKey(map,node.id));
  }
  return result;
}
export const epamSkillIds = new Set(['core-java','oop','java-syntax','java-data-types','java-scope','java-arrays','java-strings','java-methods','java-classes','java-encapsulation','java-constructors','java-polymorphism','java-interfaces','java-inheritance','java-exceptions','java-equality','collections','java-list','java-set','java-map','java-queue','generics','lambdas','streams','io','java-path-files','java-try-resources','algorithms','git-maven','junit','sql','java-jdbc','spring','persistence']);
export function referencePriority(map:ReferenceMapId,node:RawRoadmapNode,key:string):'focus'|'support'|'later' {
  const label=normalizeSkillLabel(node.data.label??'');
  if(epamSkillIds.has(key)||map==='java'&&/^(conditionals|loops|type casting|math operations|lifecycle of a program|attributes and methods|access specifiers|final keyword|static vs dynamic binding|array vs arraylist|stack|dequeue|dependency injection|testing)$/.test(label)||/^(postgresql|spring spring boot|spring data jpa|java|git|github|rest|json apis|relational databases|unit testing|integration testing|transactions|migrations|database indexes|ci cd|authentication|web security|owasp risks)$/.test(label))return'focus';
  if(map==='java'&&!/^(ebean|quarkus|javalin|play framework|bazel|testng|cucumber jvm|jmeter|cryptography|virtual threads|java memory model)$/.test(label))return'support';
  if(/http|dns|internet|hosting|security|testing|database|sql|api|caching|redis|observability|logging|normalization|acid|oop|functional/.test(label))return'support';
  return'later';
}
