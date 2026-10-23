// Browser adaptation of the helper's grouped curriculum and section ownership rules.
export const normal=s=>String(s??'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function groupCourse(course,sections){
 const groups=[];
 for(const v of course.videos){
  const primary=v.primary_match;
  const key=v.course_intro?'intro':primary?.section_number||'video-'+v.playlist_index;
  let g=groups.at(-1);
  if(!g||g.key!==key){g={id:'video-'+v.playlist_index,key,title:v.course_intro?'Course introduction':primary?.section_title||v.video_title,videos:[],sections:[]};groups.push(g)}
  g.videos.push(v);
  if(!v.course_intro&&!v.course_outro){
   const refs=(v.coverage_matches||[]).filter(x=>x.scope!=='chapter'&&(x.required_study_target||x.relationship==='primary'));
   if(primary&&!refs.length)refs.push(primary);
   for(const ref of refs){
    // Match titles rather than blindly applying edition-specific section numbers.
    const section=sections.find(s=>normal(s.title)===normal(ref.section_title))||sections.find(s=>s.number===ref.section_number&&normal(s.title).includes(normal(ref.section_title)));
    if(section&&!g.sections.includes(section.id))g.sections.push(section.id);
   }
   if(primary&&!g.sections.length)g.unmatched=true;
  }
 }
 const covered=new Set(groups.flatMap(g=>g.sections));
 for(const s of sections)if(!covered.has(s.id))groups.push({id:'reading-'+s.id,key:s.id,title:s.number+' '+s.title,videos:[],sections:[s.id],readingOnly:true});
 return groups;
}
export function linesFromItems(items){
 const lines=[];let lastY=null;
 for(const item of items){if(!item.str)continue;const y=Math.round(item.transform[5]);if(lastY===null||Math.abs(y-lastY)>3){lines.push(item.str);lastY=y}else lines[lines.length-1]+=' '+item.str;}
 return lines.map(s=>s.replace(/\s+/g,' ').trim());
}
export function heading(line){const m=line.match(/^(\d{1,2}\.\d{1,2})\s+([A-Za-z][A-Za-z\s,:;()&'’–-]{2,110})$/);if(!m||/exercises|review|answers/i.test(m[2]))return null;return {number:m[1],title:m[2].trim()}}
export function buildSections(pages,outline=[]){
 const found=new Map();
 const bookmarked=outline.filter(h=>h.number&&h.start>0&&Number(h.number.split('.')[0])>0);
 // Complete section bookmarks are more reliable than chapter summaries and running headers.
 if(bookmarked.length){for(const h of bookmarked)found.set(h.number,{...h,id:h.number})}
 else pages.forEach((lines,index)=>{
  const candidates=lines.map(heading).filter(h=>h&&Number(h.number.split('.')[0])>0);
  if(candidates.length>3||lines.some(x=>/^contents$/i.test(x)))return;
  for(const h of candidates)if(!found.has(h.number))found.set(h.number,{id:h.number,number:h.number,title:h.title,start:index+1});
 });
 const sections=[...found.values()].sort((a,b)=>a.start-b.start);
 const answersStart=outline.find(h=>/answers to.*exercises/i.test(h.title))?.start||pages.findIndex(ls=>ls.some(l=>/^Answers to Odd.Numbered Exercises$/i.test(l)))+1;
 for(let i=0;i<sections.length;i++){
  const s=sections[i],next=sections[i+1];
  const boundary=outline.find(h=>h.start>s.start&&/^(End-of-Chapter Material|Appendices|Suggested Readings|Answers to)/i.test(h.title));
  // A new section may begin halfway through the previous section's final exercise page.
  const sharedBoundary=boundary&&pages[boundary.start-1].findIndex(l=>/^Key Terms and Results$/i.test(l))>1;
  s.end=Math.min(next?(bookmarked.length?next.start:next.start-1):pages.length,boundary?boundary.start-(sharedBoundary?0:1):pages.length);
  s.end=Math.max(s.start,s.end);
  s.exercise=null;s.answer=null;
  for(let p=s.start;p<=s.end;p++)if(pages[p-1].some(l=>new RegExp('^(?:'+s.number.replace('.','\\.')+'\\s+)?Exercises$','i').test(l))){s.exercise=p;break;}
  if(answersStart>0)for(let p=answersStart;p<=pages.length;p++)if(pages[p-1].some(l=>new RegExp('^Section\\s+'+s.number.replace('.','\\.')+'$','i').test(l))){s.answer=p;break;}
  const chapterEnd=outline.find(h=>h.start>=s.start&&/^End-of-Chapter Material$/i.test(h.title)&&(!next||h.start<=next.start||next.number.split('.')[0]===s.number.split('.')[0]));
  if(chapterEnd){const nextChapter=sections.find(x=>x.start>chapterEnd.start);s.optional={start:chapterEnd.start,end:nextChapter?nextChapter.start-1:(outline.find(h=>h.start>chapterEnd.start&&/^Appendices$/i.test(h.title))?.start||chapterEnd.start+1)-1}}
 }
 return sections;
}
export function validateSections(sections,pageCount){
 if(!Array.isArray(sections)||!sections.length)throw Error('Add at least one numbered section.');
 const ids=new Set();
 return sections.map(s=>{const n=String(s.number).trim(),start=Number(s.start),end=Number(s.end);if(!/^\d{1,2}\.\d{1,2}$/.test(n)||ids.has(n)||!String(s.title).trim()||!Number.isInteger(start)||!Number.isInteger(end)||start<1||end<start||end>pageCount)throw Error('Check section numbers, titles and PDF page ranges. Section numbers must be unique.');ids.add(n);const r={id:n,number:n,title:String(s.title).trim(),start,end,exercise:s.exercise?Number(s.exercise):null,answer:s.answer?Number(s.answer):null};if(r.exercise&&(!Number.isInteger(r.exercise)||r.exercise<start||r.exercise>end))throw Error('Exercise pages must lie within their section.');if(r.answer&&(!Number.isInteger(r.answer)||r.answer<1||r.answer>pageCount))throw Error('Answer pages must be valid PDF pages.');if(s.optional&&Number.isInteger(s.optional.start)&&Number.isInteger(s.optional.end)&&s.optional.start>=1&&s.optional.end>=s.optional.start&&s.optional.end<=pageCount)r.optional=s.optional;return r;});
}
