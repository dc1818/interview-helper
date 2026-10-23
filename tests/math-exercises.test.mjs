import test from 'node:test';
import assert from 'node:assert/strict';
import {extractQuestions,extractAnswers} from '../assets/math-exercises.js';
function span(text,x,y,{bold=false,size=10,width=text.length*5}={}){return {text,x,y,baseline:y+8,bottom:y+11,width,size,bold,fontKnown:true}}
const page=spans=>({number:1,width:600,height:700,spans});
test('questions follow column order, preserve subparts and stop at the next section',()=>{
 const p=page([span('Exercises',40,60,{size:14}),span('1.',40,90,{bold:true}),span('First problem.',55,90),span('2. A numbered premise, not another question.',50,110),span('a) Keep this subpart.',50,125),span('2.',40,150,{bold:true}),span('Second problem.',55,150),span('3.',320,90,{bold:true}),span('Third problem.',335,90),span('2.2',40,220,{size:24,bold:true}),span('4.',40,280,{bold:true})]);
 const c=extractQuestions([p],{number:'2.1'});assert.deepEqual(c.questions.map(q=>q.number),['1','2','3']);assert.match(c.questions[0].text,/numbered premise/);assert.match(c.questions[0].text,/subpart/);assert.ok(c.questions.every(q=>q.regions.every(r=>r.y+r.height<220)));
});
test('side-by-side label-only diagrams remain separate questions',()=>{
 const p=page([span('Exercises',40,60,{size:14}),span('1.',40,90,{bold:true}),span('2.',160,90,{bold:true}),span('Diagram A',60,130),span('Diagram B',180,130),span('3.',320,90,{bold:true}),span('Third prompt.',335,90),span('Key Terms and Results',40,240,{size:14})]);
 const c=extractQuestions([p],{number:'2.1'});assert.deepEqual(c.questions.map(q=>q.number),['1','2','3']);assert.match(c.questions[0].text,/Diagram A/);assert.doesNotMatch(c.questions[0].text,/Diagram B/);assert.match(c.questions[1].text,/Diagram B/);assert.ok(c.questions[0].regions[0].x+c.questions[0].regions[0].width<=c.questions[1].regions[0].x);
});
test('shared directions attach to their stated question range',()=>{
 const p=page([span('Exercises',40,60,{size:14}),span('In Exercises 1–2, use the supplied table.',40,80),span('1.',40,110,{bold:true}),span('First prompt.',55,110),span('2.',40,150,{bold:true}),span('Second prompt.',55,150),span('3.',320,90,{bold:true}),span('Other prompt.',335,90)]);
 const c=extractQuestions([p],{number:'2.1'});assert.match(c.questions[0].instructions,/supplied table/);assert.match(c.questions[1].instructions,/supplied table/);assert.equal(c.questions[2].instructions,'');
});
test('headingless sets start at a native bold label and report missing labels',()=>{
 const c=extractQuestions([page([span('1.',40,80,{bold:true}),span('Question.',55,80),span('3.',40,130,{bold:true}),span('Question.',55,130)])],{number:'9.4'});assert.equal(c.questions.length,2);assert.deepEqual(c.missing,[2]);
});
test('odd answers are linked by exact section and ignore regular numbers inside prose',()=>{
 const p=page([span('Section 2.1',40,60,{bold:true}),span('1.',40,90,{bold:true}),span('Answer with 2. in its text.',55,90),span('3.',190,90,{bold:true}),span('Another answer.',205,90),span('Section 2.2',40,130,{bold:true}),span('1.',40,150,{bold:true}),span('Wrong section.',55,150)]);
 const a=extractAnswers([p],{number:'2.1'});assert.deepEqual(Object.keys(a),['1','3']);assert.match(a['1'].text,/2\./);assert.doesNotMatch(a['3'].text,/Wrong section/);assert.equal(a['2'],undefined);
});
test('answer order keeps a full-width diagram band before a mid-page section heading',()=>{
 const spans=[span('Section 13.2',40,60,{bold:true}),span('19.',40,90,{bold:true}),span('diagram labels',200,140),span('21.',40,250,{bold:true}),span('23.',190,250,{bold:true}),span('25.',305,250,{bold:true}),span('last diagram',360,290),span('Section 13.3',40,410,{bold:true}),span('1.',40,450,{bold:true})].map((s,index)=>({...s,index}));
 const a=extractAnswers([page(spans)],{number:'13.2'});assert.deepEqual(Object.keys(a),['19','21','23','25']);assert.match(a['25'].text,/last diagram/);assert.equal(a['1'],undefined);
});
