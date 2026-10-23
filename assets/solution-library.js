import {readSolutionZip,buildSolutions} from './math-solutions.js';
import {buildExerciseCatalog,EXERCISE_SCHEMA} from './math-exercises.js';
import {fileGet,filePut,fileDelete,$} from './study-store.js';
const key=book=>'solution-key-v1-'+book.id;
export const getSolutionKey=book=>fileGet(key(book));
export function solutionImportPanel(){return `<section class="card pad"><h2>Optional answer key</h2><p>Add your Rosen 8th-edition instructor solution ZIP to unlock even-numbered worked solutions. Odd answers already come from your textbook. Both files stay in this browser.</p><label for="solutionZip">Choose solution key ZIP</label><input id="solutionZip" disabled type="file" accept=".zip,application/zip"><p id="solutionImportStatus" role="status">Checking saved key…</p><button id="removeSolutionKey" class="button secondary" hidden>Remove imported answer key</button></section>`}
export async function wireSolutionImport(book,pdf,loadPDF){
 const input=$('solutionZip'),status=$('solutionImportStatus'),remove=$('removeSolutionKey');
 const saved=await getSolutionKey(book);if(!input.isConnected)return;
 status.textContent=saved?`${saved.count} even-numbered solutions ready · ${Object.keys(saved.sections).length} sections · Saved in this browser`:'No optional key imported. Textbook odd-numbered answers remain available.';remove.hidden=!saved;
 remove.onclick=async()=>{try{await fileDelete(key(book));remove.hidden=true;status.textContent='Imported key removed. Your textbook, working and progress are unchanged.'}catch(e){status.textContent='Could not remove key: '+e.message}};
 input.onchange=async()=>{const file=input.files[0];if(!file)return;input.disabled=true;remove.disabled=true;const bookInput=$('mathPDF');bookInput.disabled=true;
 try{
  status.textContent='Checking solution ZIP locally…';const files=await readSolutionZip(file),sections={};
  const front=[];for(let n=1;n<=Math.min(25,pdf.numPages);n++)front.push((await (await pdf.getPage(n)).getTextContent()).items.map(x=>x.str).join(' '));
  if(!/(?:eighth|8th)\s+edition/i.test(front.join(' ')))throw Error('This key requires a verified eighth-edition textbook.');
  for(const [name,blob]of Object.entries(files)){
   if(!input.isConnected)throw Error('Import canceled because you left this page.');
   status.textContent='Reading worked solutions · '+name;const doc=await loadPDF(blob);
   try{for(const [number,answers]of Object.entries(await buildSolutions(doc)))sections[number]={file:name,answers}}finally{await doc.loadingTask.destroy()}
   await new Promise(r=>setTimeout(r,0));
  }
  if(book.sections.length!==72||Object.keys(sections).length!==72)throw Error('Section coverage does not match the verified 72-section textbook.');
  let count=0;
  for(const s of book.sections){
   if(!input.isConnected)throw Error('Import canceled because you left this page.');status.textContent='Checking textbook exercises against solutions · Section '+s.number;
   const cache=['exercise-catalog',EXERCISE_SCHEMA,book.id,s.number,s.exercise,s.end,s.answer].join('-');let catalog=await fileGet(cache);
   if(!catalog||catalog.questions.some(q=>Number(q.number)%2===1&&!catalog.answers?.[q.number])){catalog=await buildExerciseCatalog(pdf,s);await filePut(cache,catalog)}
   const expected=catalog.questions.filter(q=>Number(q.number)%2===0).map(q=>q.number),actual=Object.keys(sections[s.number]?.answers||{});
   if(catalog.missing.length||!catalog.questions.length||catalog.questions.some(q=>Number(q.number)%2===1&&!catalog.answers?.[q.number])||JSON.stringify(expected)!==JSON.stringify(actual))throw Error('Exercise numbering does not match in section '+s.number+'. Your existing key is unchanged.');
   count+=actual.length;
  }
  await filePut(key(book),{name:file.name,sections,files,count});status.textContent=`${count} even-numbered solutions ready · 72 sections verified · Saved in this browser`;remove.hidden=false;
 }catch(e){status.textContent='Key was not imported: '+e.message}finally{input.disabled=false;remove.disabled=false;bookInput.disabled=false;input.value=''}
 };
 input.disabled=false;
}
let renderVersion=0;
export function cancelSolution(){renderVersion++}
export async function renderSolution(host,answer,file,loadPDF){
 const version=++renderVersion;host.replaceChildren();host.setAttribute('aria-busy','true');let doc;
 try{doc=await loadPDF(file);for(const [i,r]of answer.regions.entries()){
  if(version!==renderVersion||!host.isConnected)return;
  const page=await doc.getPage(r.page),scale=Math.min(3,Math.max(600,host.clientWidth*devicePixelRatio)/r.width),canvas=document.createElement('canvas');canvas.width=Math.ceil(r.width*scale);canvas.height=Math.ceil(r.height*scale);canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Worked solution excerpt '+(i+1)+' from imported key, PDF page '+r.page);host.append(canvas);
  await page.render({canvasContext:canvas.getContext('2d'),viewport:page.getViewport({scale}),transform:[1,0,0,1,-r.x*scale,-r.y*scale],background:'#fff'}).promise;
 }}catch(e){if(version===renderVersion&&host.isConnected)host.textContent='Solution could not render: '+e.message}finally{if(doc)await doc.loadingTask.destroy();if(version===renderVersion)host.setAttribute('aria-busy','false')}
}
