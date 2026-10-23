// Only the audited Rosen 8e chapter files are accepted; no solution content is shipped.
import {nativePage} from './math-exercises.js';
const hashes={"IRG_Ch05.pdf": "109d7065b58ce04297aa00d2bd05df1f4fac0e827fdbdf02aad953b918ab2773", "IRG_Ch02.pdf": "a07a75e6e8a586a80b10ea3e30f6d0304fcd5c2bd6127f183781ae6d119ac969", "IRG_Ch10.pdf": "c603feeb010373f0fd716934d7ec2944847e65b3b7b3b0a8813714555ab768f5", "IRG_Ch08.pdf": "90780b71380740cfefe544989a53a2fb04972846015969de8032edf2f9652df2", "IRG_Ch03.pdf": "5727df44eb16c71d61654ea23b9020ed63bd224e13d778cb125f60aa59fa2b3d", "IRG_Ch04.pdf": "5d7dcc9d5a0f37061839d28d7a8bcd83414b0611a81df084afb260df948263e0", "IRG_Ch09.pdf": "ce3d3d50c52240597404fa79bc0c5c16d73b38632570937532ecdfa3dbfecb90", "IRG_Ch06.pdf": "79c3810d16a29ccedf6e6591e5caaa9ca155c3cc3c8cbefe682d880653f98e08", "IRG_Ch11.pdf": "ab7854b19fa4bd78e7f0bed7a27aeead333195e236d857689f09a459644db689", "IRG_Ch13.pdf": "165a6634ad2a7a9d4213d38146a3f301f30ab7429838147b64bdae30e13ccf78", "IRG_Ch07.pdf": "93e3544b17051f20f0b6c69674a32053001334dfa6fb8a6524be970d02a64c6d", "IRG_Ch12.pdf": "bd2314fbeb96f0943f356ad63640afb90ae56795dd8710a1a94792d0c18782af", "IRG_Ch01.pdf": "480653ce99b8a2af592e81c552d2b9d99b03c2374e0a796b9e9ec743b413e4ec"};
export async function readSolutionZip(file){
 if(file.size>30*1024*1024)throw Error('Choose the original solution ZIP (maximum 30 MB).');
 const bytes=new Uint8Array(await file.arrayBuffer()),v=new DataView(bytes.buffer),files={};
 let end=-1;for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(v.getUint32(i,true)===0x06054b50){end=i;break}
 if(end<0)throw Error('This is not a supported ZIP archive.');
 const count=v.getUint16(end+10,true);let pos=v.getUint32(end+16,true);
 if(count>200||v.getUint16(end+4,true)!==0)throw Error('Unsupported ZIP archive.');
 for(let i=0;i<count;i++){
  if(pos+46>bytes.length||v.getUint32(pos,true)!==0x02014b50)throw Error('Damaged ZIP directory.');
  const flags=v.getUint16(pos+8,true),method=v.getUint16(pos+10,true),size=v.getUint32(pos+20,true),length=v.getUint32(pos+24,true),nl=v.getUint16(pos+28,true),el=v.getUint16(pos+30,true),cl=v.getUint16(pos+32,true),offset=v.getUint32(pos+42,true);
  const name=new TextDecoder().decode(bytes.slice(pos+46,pos+46+nl)).split(/[\\/]/).pop();pos+=46+nl+el+cl;
  if(!hashes[name])continue;
  if(files[name]||flags&1||![0,8].includes(method)||length>2*1024*1024||offset+30>bytes.length||v.getUint32(offset,true)!==0x04034b50)throw Error('Unsupported or duplicate chapter file.');
  const start=offset+30+v.getUint16(offset+26,true)+v.getUint16(offset+28,true);
  if(start+size>bytes.length)throw Error('Truncated chapter file.');
  let data=bytes.slice(start,start+size);
  if(method===8){const reader=new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader(),chunks=[];let total=0;for(;;){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>length){await reader.cancel();throw Error('Invalid expanded chapter size.')}chunks.push(value)}data=new Uint8Array(await new Blob(chunks).arrayBuffer());}
  if(data.length!==length)throw Error('Incomplete chapter file.');
  const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',data))].map(x=>x.toString(16).padStart(2,'0')).join('');
  if(digest!==hashes[name])throw Error('This chapter is not the verified Rosen 8th-edition solution key. Your existing key is unchanged.');
  files[name]=new Blob([data],{type:'application/pdf'});
 }
 if(Object.keys(files).length!==13)throw Error('The ZIP must include all 13 original IRG_Ch01–IRG_Ch13 PDFs.');
 return files;
}
export function extractSolutions(pages){
 const sections={};let section=null,current=null;
 for(const page of pages){
  const spans=page.spans.filter(s=>s.y>60&&s.y<page.height-35),rows=[];
  for(const s of [...spans].sort((a,b)=>a.baseline-b.baseline||a.x-b.x)){let row=rows.findLast(r=>Math.abs(r.baseline-s.baseline)<2);if(!row){row={baseline:s.baseline,spans:[]};rows.push(row)}row.spans.push(s)}
  const events=[];
  for(const row of rows){row.spans.sort((a,b)=>a.x-b.x);const text=row.spans.map(s=>s.text).join(' ').replace(/\s+/g,' ').trim(),m=text.match(/^SECTION\s+(\d+\.\d+)\b/),label=row.spans.find(s=>s.x<70&&/^\d+\.(?:\s|$)/.test(s.text));
   if(m)events.push({y:Math.min(...row.spans.map(s=>s.y))-4,section:m[1]});
   else if(/^SUPPLEMENTARY EXERCISES/.test(text))events.push({y:Math.min(...row.spans.map(s=>s.y))-4,stop:true});
   else if(label)events.push({y:label.y-4,number:String(parseInt(label.text))});
  }
  let top=60;
  const append=bottom=>{if(!current||bottom<=top)return;current.regions.push({page:page.number,x:54,y:top,width:page.width-108,height:bottom-top});current.text+=spans.filter(s=>s.baseline>=top&&s.y<bottom).map(s=>s.text).join(' ')+'\n'};
  for(const event of events.sort((a,b)=>a.y-b.y)){append(event.y);top=event.y;
   if(event.section){section=event.section;sections[section]??={};current=null}
   else if(event.stop){section=null;current=null}
   else if(section){if(Number(event.number)%2||sections[section][event.number])throw Error('Unexpected solution numbering in section '+section);current=sections[section][event.number]={text:'',regions:[]};}
  }
  append(page.height-35);
 }
 return sections;
}
export async function buildSolutions(pdf){const pages=[];for(let n=1;n<=pdf.numPages;n++)pages.push(await nativePage(pdf,n));return extractSolutions(pages)}
