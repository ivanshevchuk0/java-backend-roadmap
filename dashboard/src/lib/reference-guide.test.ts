import {describe,expect,it} from 'vitest';
import {parseGuide} from '../components/ReferenceGuide';
describe('reference guide presentation',()=>{
 it('turns source resource markers into clean labels and video hints',()=>{
  const guide=parseGuide('[\u0040article\u0040Read the fixture guide](https://example.org/guide)\n\n[\u0040official\u0040Platform docs](https://example.org/docs)\n\n[\u0040video\u0040API walkthrough](https://example.org/watch)');
  expect(guide.links.map(link=>link.title)).toEqual(['Read the fixture guide','Platform docs','API walkthrough']);
  expect(guide.links.map(link=>link.video)).toEqual([false,false,true]);
 });
 it('omits code fences and credential URLs, retaining safe unique resource links',()=>{
  const guide=parseGuide('Explain the input boundary.\n\n```java\ncompleteExercise();\n```\n\n[Private](https://user:secret@example.org)\n\n[Docs](https://example.org/docs)\n\n[Docs again](https://example.org/docs)');
  expect(guide.paragraphs.join(' ')).not.toContain('completeExercise');
  expect(guide.links).toHaveLength(1);expect(guide.links[0]).toMatchObject({url:'https://example.org/docs',video:false});
 });
});
