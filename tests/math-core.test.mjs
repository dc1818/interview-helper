import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildSections,validateSections,groupCourse} from '../assets/math-core.js';
import {problems} from '../assets/practice-data.js';
const course=JSON.parse(readFileSync(new URL('../assets/math-course.json',import.meta.url)));
test('recovered playlist keeps all 85 unique videos in exact order',()=>{assert.equal(course.videos.length,85);assert.equal(new Set(course.videos.map(v=>v.youtube_video_id)).size,85);assert.deepEqual(course.videos.map(v=>v.playlist_index),Array.from({length:85},(_,i)=>i+1));});
test('introduction has no reading and uncovered sections remain reading-only',()=>{const sections=[{id:'2.1',number:'2.1',title:'Sets'},{id:'13.99',number:'13.99',title:'Uncovered fixture'}];const units=groupCourse(course,sections);assert.deepEqual(units[0].sections,[]);assert.equal(units[0].key,'intro');assert.ok(units.find(g=>g.sections.includes('2.1')));assert.equal(units.at(-1).readingOnly,true);assert.deepEqual(units.at(-1).sections,['13.99']);assert.deepEqual(units.flatMap(g=>g.videos).map(v=>v.playlist_index),course.videos.map(v=>v.playlist_index));});
test('matches titles across editions without blindly reusing section numbers',()=>{const units=groupCourse(course,[{id:'3.8',number:'3.8',title:'Sets'}]);assert.ok(units[1].sections.includes('3.8'));});
test('section ownership and exercise pages are bounded by next section',()=>{const pages=[['Contents','1.1 First','1.2 Second'],['1.1 First','Body'],['1.1 Exercises'],['1.2 Second'],['1.2 Exercises']];const sections=buildSections(pages);assert.equal(sections.length,2);assert.deepEqual(sections.map(s=>[s.start,s.end,s.exercise]),[[2,3,3],[4,5,5]]);});
test('invalid and duplicate page ranges cannot be saved',()=>{assert.throws(()=>validateSections([{number:'1.1',title:'A',start:0,end:3}],4));assert.throws(()=>validateSections([{number:'1.1',title:'A',start:1,end:3,exercise:4}],5));assert.throws(()=>validateSections([{number:'1.1',title:'A',start:1,end:2},{number:'1.1',title:'B',start:3,end:4}],4));});
test('all scheduled algorithms have runnable test cases',()=>{const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');const list=JSON.parse(html.match(/const codingSets=(\[[\s\S]*?\]);/)[1]);for(const title of list.flat()){const p=problems.find(p=>p.title===title);assert.ok(p,title);assert.ok(p.tests.length>0);assert.ok(p.tests.every(t=>Array.isArray(t.args)&&t.expected!==undefined));}});
test('bookmarks preserve shared exercise pages and keep chapter material separate',()=>{
 const pages=[['0.1 Front matter'],['1.1 First'],['Exercises'],['continued exercise','1.2 Second'],['Exercises','1. answer','Key Terms and Results'],['Review Questions'],['Answers to Odd-Numbered Exercises','Section 1.1'],['Section 1.2']];
 const bookmarks=[{number:'1.1',title:'First',start:2},{number:'1.2',title:'Second',start:4},{title:'End-of-Chapter Material',start:5},{title:'Appendices',start:7},{title:'Answers to Odd-Numbered Exercises',start:7}];
 const sections=buildSections(pages,bookmarks);
 assert.equal(sections.length,2);assert.deepEqual(sections.map(s=>[s.start,s.end,s.exercise,s.answer]),[[2,4,3,7],[4,5,5,8]]);
 assert.deepEqual(sections[1].optional,{start:5,end:6});assert.deepEqual(validateSections(sections,8)[1].optional,{start:5,end:6});
});
