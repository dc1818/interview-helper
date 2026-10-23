// Browser adaptation of the helper's native-span exercise catalog.
// Question labels use font weight, column order and exact heading boundaries.
export const EXERCISE_SCHEMA=1;
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
const numberLabel=/^([∗*★]{0,2}\s*)?(\d{1,3})[.)](?!\d)\s*/;
const chapterHeading=/^(Key Terms and Results|Review Questions|Supplementary Exercises|Computer Projects|Computer Exercises|Computations and Explorations|Writing Projects|Chapter Review|Self.Test)$/i;
export async function nativePage(pdf,number){
 const page=await pdf.getPage(number),viewport=page.getViewport({scale:1}),content=await page.getTextContent();
 await page.getOperatorList();
 const spans=content.items.filter(x=>x.str?.trim()).map((x,index)=>{
  const [left,baseline]=viewport.convertToViewportPoint(x.transform[4],x.transform[5]);
  const size=Math.hypot(x.transform[2],x.transform[3]);let name='';try{name=page.commonObjs.get(x.fontName)?.name||''}catch{}
  return {text:x.str,x:left,y:baseline-size*.82,bottom:baseline+size*.22,baseline,width:x.width,size,bold:/bold|semibold|black/i.test(name),fontKnown:!!name,index};
 });
 return {number,width:viewport.width,height:viewport.height,spans};
}
function sectionMarker(span){const m=clean(span.text).match(/^(\d{1,2}\.\d{1,2})(?:\s+[^\d].*)?$/);return m&&span.size>=16?m[1]:null}
function lines(spans){
 const rows=[];
 for(const s of [...spans].sort((a,b)=>a.baseline-b.baseline||a.x-b.x)){
  let row=rows.findLast(r=>Math.abs(r.baseline-s.baseline)<2.5);
  if(!row){row={baseline:s.baseline,spans:[]};rows.push(row)}row.spans.push(s);
 }
 return rows.map(r=>{r.spans.sort((a,b)=>a.x-b.x);return {...r,text:clean(r.spans.map(s=>s.text).join(' ')),y:Math.min(...r.spans.map(s=>s.y)),bottom:Math.max(...r.spans.map(s=>s.bottom))}}).sort((a,b)=>a.baseline-b.baseline);
}
function labelAt(row){
 const first=row.spans.find(s=>!/^\s*[∗*★]+\s*$/.test(s.text)),match=first&&clean(first.text).match(numberLabel);
 if(!match||(!first.bold&&first.fontKnown))return null;
 return {number:String(Number(match[2])),starred:/[∗*★]/.test(row.text.slice(0,8)),label:row.text.match(numberLabel)?.[0]?.trim()||match[0].trim()};
}
function segmentsFor(page,top,bottom){
 const body=page.spans.filter(s=>s.baseline>=top&&s.y<bottom);
 if(!body.length)return [];
 const xMin=Math.min(...body.map(s=>s.x)),xMax=Math.max(...body.map(s=>s.x+s.width));
 const candidates=body.filter(s=>numberLabel.test(clean(s.text))&&(s.bold||!s.fontKnown));
 const right=candidates.map(s=>s.x).filter(x=>x>page.width*.48&&x<page.width*.65);
 // The book uses two columns for exercise sets, including continuation pages.
 const split=right.length?Math.min(...right)-10:(xMin+xMax)/2;
 const isTwo=xMax-xMin>page.width*.55&&body.some(s=>s.x>split+4)&&body.some(s=>s.x<split-50)&&(right.length>0||!body.some(s=>s.width>page.width*.65));
 const bounds=isTwo?[[Math.max(0,xMin-4),split],[split,Math.min(page.width,xMax+4)]]:[[Math.max(0,xMin-4),Math.min(page.width,xMax+4)]];
 return bounds.map(([left,right],col)=>({page:page.number,col,left,right,top,bottom,lines:lines(body.filter(s=>s.x>=left&&s.x<right))}));
}
function splitQuestionPanels(seg){
 const paired=seg.lines.find(row=>row.spans.filter(s=>numberLabel.test(clean(s.text))&&(s.bold||!s.fontKnown)).length>1);
 if(!paired)return [seg];
 const labels=paired.spans.filter(s=>numberLabel.test(clean(s.text))&&(s.bold||!s.fontKnown));
 const after=seg.lines.find(row=>row.y>paired.bottom+2&&labelAt(row));
 const top=paired.y-3,bottom=after?after.y-3:seg.bottom;
 const slice=(left,right,y,end)=>({...seg,left,right,top:y,bottom:end,lines:lines(seg.lines.flatMap(r=>r.spans).filter(s=>s.x>=left&&s.x<right&&s.baseline>=y&&s.y<end))});
 const pieces=[];
 if(top>seg.top+3)pieces.push(slice(seg.left,seg.right,seg.top,top));
 for(let i=0;i<labels.length;i++)pieces.push(slice(i?labels[i].x-5:seg.left,labels[i+1]?labels[i+1].x-5:seg.right,top,bottom));
 if(bottom<seg.bottom-3)pieces.push(...splitQuestionPanels(slice(seg.left,seg.right,bottom,seg.bottom)));
 return pieces;
}
const region=(seg,top,bottom)=>({page:seg.page,x:seg.left,y:Math.max(seg.top,top),width:seg.right-seg.left,height:Math.max(0,Math.min(seg.bottom,bottom)-Math.max(seg.top,top))});
export function extractQuestions(pages,section){
 const questions=[];let context={text:[],from:1,to:Infinity},active=null,started=false,stopped=false,previous=0;
 for(const page of pages){
  let top=50,bottom=page.height-25;
  const biography=page.spans.find(s=>/^[A-Z][A-Z .’'-]+\(\d{4}[–—-]\d{4}\)/.test(s.text)&&s.y>200);if(biography)bottom=Math.min(bottom,biography.y-22);
  const ex=page.spans.find(s=>/^Exercises$/i.test(clean(s.text))&&s.size>=11&&s.y>50);
  const boundary=page.spans.filter(s=>s.y>50&&((sectionMarker(s)&&sectionMarker(s)!==section.number)||(chapterHeading.test(clean(s.text))&&s.size>=11))).sort((a,b)=>a.y-b.y)[0];
  if(boundary)bottom=Math.min(bottom,boundary.y-4);
  if(!started&&ex&&ex.y<bottom){top=ex.bottom+2;started=true}
  if(!started){
   // The original helper also permits a headingless set beginning at bold question 1.
   const first=page.spans.find(s=>/^1[.)]\s*$/.test(clean(s.text))&&s.bold&&s.size<12&&s.y>50&&s.y<bottom);
   if(!first)continue;top=first.y-2;started=true;
  }
  for(const seg of segmentsFor(page,top,bottom).flatMap(splitQuestionPanels)){
   let regionTop=seg.top;
   for(const row of seg.lines){
    const label=labelAt(row);
    const shared=row.text.match(/^(?:In|For) Exercises?\s+(\d+)(?:\s*(?:[–—-]|through|and|to)\s*(\d+))?/i);
    if(!label&&shared){if(active){const r=region(seg,regionTop,row.y-3);if(r.height>2)active.regions.push(r)}active=null;context={text:[],from:Number(shared[1]),to:Number(shared[2]||shared[1])};regionTop=row.y}
    if(label&&Number(label.number)>previous){
     if(active){const r=region(seg,regionTop,row.y-3);if(r.height>2)active.regions.push(r)}
     active={...label,text:'',lines:[],regions:[],instructions:Number(label.number)>=context.from&&Number(label.number)<=context.to?context.text.join('\n'):''};questions.push(active);previous=Number(label.number);regionTop=row.y-2;
    }
    if(active)active.lines.push(row.text);else context.text.push(row.text);
   }
   if(active){const r=region(seg,regionTop,seg.bottom);if(r.height>2)active.regions.push(r)}
  }
  if(boundary){stopped=true;break}
 }
 for(const q of questions){q.text=q.lines.join('\n');delete q.lines;q.pages=[...new Set(q.regions.map(r=>r.page))]}
 const labels=new Set(questions.map(q=>Number(q.number))),missing=[];for(let n=1;n<=previous;n++)if(!labels.has(n))missing.push(n);
 return {schema:EXERCISE_SCHEMA,section:section.number,questions,missing,bounded:stopped};
}
export function extractAnswers(pages,section){
 const answers={};let started=false,current=null,lastBaseline=null;
 for(const page of pages){
  // Native content order retains full-width answer diagrams above two-column bands.
  // A geometry-only two-column sort can skip answers before a mid-page section marker.
  for(const span of [...page.spans].sort((a,b)=>(a.index??0)-(b.index??0))){
   if(span.y<50||span.y>page.height-25)continue;
   const text=clean(span.text),marker=text.match(/^Section\s+(\d{1,2}\.\d{1,2})$/i);
   if(marker){if(started&&marker[1]!==section.number)return answers;started=marker[1]===section.number;current=null;continue}
   if(!started)continue;
   if(/^(Supplementary Exercises|CHAPTER\s+\d+)$/i.test(text))return answers;
   const m=text.match(numberLabel);
   if(m&&(span.bold||!span.fontKnown)&&Number(m[2])%2===1){current=String(Number(m[2]));answers[current]??={text:'',pages:[]}}
   if(current){if(lastBaseline!==null&&Math.abs(span.baseline-lastBaseline)>3)answers[current].text+='\n';answers[current].text+=span.text+' ';if(!answers[current].pages.includes(page.number))answers[current].pages.push(page.number)}
   lastBaseline=span.baseline;
  }
 }
 return answers;
}
export async function buildExerciseCatalog(pdf,section,onProgress=()=>{}){
 const pages=[];
 for(let n=section.exercise||section.start;n<=section.end;n++){pages.push(await nativePage(pdf,n));onProgress(n)}
 const catalog=extractQuestions(pages,section);
 if(section.answer){const answerPages=[];for(let n=section.answer;n<=Math.min(pdf.numPages,section.answer+15);n++){const p=await nativePage(pdf,n);answerPages.push(p);const markers=p.spans.map(s=>clean(s.text)).filter(t=>/^Section\s+\d+\.\d+$/i.test(t));if(n>section.answer&&markers.some(t=>t!=='Section '+section.number))break}catalog.answers=extractAnswers(answerPages,section)}
 else catalog.answers={};return catalog;
}
