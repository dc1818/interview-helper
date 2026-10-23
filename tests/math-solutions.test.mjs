import test from 'node:test';import assert from 'node:assert/strict';
import {extractSolutions,readSolutionZip} from '../assets/math-solutions.js';
const span=(text,x,y)=>({text,x,y,baseline:y+8,bottom:y+10,size:10});
const page=(number,spans)=>({number,width:612,height:792,spans});
test('solution parser uses exact section and margin labels, preserves continuation and excludes chapter extras',()=>{
 const data=extractSolutions([page(1,[span('Section 2.1',58,41),span('SECTION 2.1',58,90),span('2.',58,120),span('First answer',80,120),span('4. is an inline example',100,140)]),page(2,[span('continued proof',80,70),span('4.',58,100),span('Second answer',80,100),span('SECTION 2.2',58,150),span('2.',58,180),span('Different section',80,180),span('SUPPLEMENTARY EXERCISES',58,230),span('2.',58,260)])]);
 assert.deepEqual(Object.keys(data),['2.1','2.2']);assert.deepEqual(Object.keys(data['2.1']),['2','4']);assert.equal(data['2.1']['2'].regions.length,2);assert.match(data['2.1']['2'].text,/continued proof/);assert.doesNotMatch(data['2.1']['4'].text,/Different section/);assert.equal(data['2.2']['2'].regions[0].height,50);
});
test('invalid or incomplete ZIP cannot replace a verified key',async()=>{
 await assert.rejects(readSolutionZip(new Blob(['not a zip'])),/ZIP/);
 const end=new Uint8Array(22);new DataView(end.buffer).setUint32(0,0x06054b50,true);await assert.rejects(readSolutionZip(new Blob([end])),/13 original/);
});
