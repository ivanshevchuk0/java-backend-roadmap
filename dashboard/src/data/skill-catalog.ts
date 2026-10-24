import { topics } from './skills';
import { skillDetails } from './learning';
import { javaTopics, javaSkillDetails, javaOptionalIds, javaTopicIds } from './java-roadmap';

/** One canonical skill catalog. Maps can share IDs; progress is never copied between maps. */
export const allTopics = [...topics, ...javaTopics];
export const allSkillDetails = { ...skillDetails, ...javaSkillDetails };
export const optionalSkillIds = javaOptionalIds;
export const javaSkillIds = new Set(javaTopicIds);
export const topicById = new Map(allTopics.map(topic => [topic.id, topic]));
