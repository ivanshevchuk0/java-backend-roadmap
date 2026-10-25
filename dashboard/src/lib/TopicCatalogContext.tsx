import {createContext,useContext} from 'react';
import {allTopics,allSkillDetails} from '../data/skill-catalog';
import type {Topic} from '../data/skills';
import type {SkillDetail} from '../data/learning';
export type TopicCatalog={topics:Topic[];details:Record<string,SkillDetail>};
const context=createContext<TopicCatalog>({topics:allTopics,details:allSkillDetails});
export const TopicCatalogProvider=context.Provider;
export const useTopicCatalog=()=>useContext(context);
