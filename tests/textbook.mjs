import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {mkdir} from 'node:fs/promises';
if(!process.env.TEST_TEXTBOOK)throw Error('Set TEST_TEXTBOOK to your own Rosen eighth-edition PDF. It is read locally and never uploaded.');
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const args=['--no-sandbox'];
if(process.env.TEST_PROXY_CERT_BYPASS==='1')args.push('--ignore-certificate-errors');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args,headless:true,proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY,bypass:'127.0.0.1,localhost'}:undefined});
const page=await browser.newPage({viewport:{width:1536,height:1024},timezoneId:'America/Asuncion',ignoreHTTPSErrors:process.env.TEST_PROXY_CERT_BYPASS==='1'});
page.setDefaultTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=process.env.TEST_URL||'http://127.0.0.1:8000';

const out=process.env.TEST_SCREENSHOTS||'/tmp/interview-helper-qa';await mkdir(out,{recursive:true});
try {
 await page.goto(base);await page.waitForFunction(()=>window.Study);await page.evaluate(()=>Study.math());
 const started=Date.now();await page.locator('#mathPDF').setInputFiles(process.env.TEST_TEXTBOOK);
 await page.locator('#saveTextbook').waitFor({timeout:180000});
 const rows=await page.locator('#sectionRows tr').evaluateAll(rows=>rows.map(tr=>Object.fromEntries([...tr.querySelectorAll('input')].map(i=>[i.dataset.key,i.value]))));
 assert.equal(rows.length,72);assert.ok(rows.every(s=>s.exercise&&s.answer));assert.deepEqual(rows.find(s=>s.number==='2.1'),{number:'2.1',title:'Sets',start:'144',end:'156',exercise:'154',answer:'1002'});
 console.log('Real textbook indexed:',rows.length,'sections; import ms',Date.now()-started);
 await page.locator('#saveTextbook').click();await page.locator('#mathUnit').selectOption('1');await page.locator('[data-step="read"]').click();
 await page.waitForFunction(()=>document.getElementById('readerStatus')?.textContent.includes('PDF page 144'));
 assert.ok(await page.locator('#pdfCanvas').evaluate(c=>c.width>0&&c.height>0));
 await page.locator('#mathNotes').fill('Private actual-book verification note');await page.locator('#markMathRead').click();await page.locator('#goMathPractice').click();assert.equal(await page.locator('#pdfPage').inputValue(),'154');
 await page.locator('#exerciseWork').fill('Private actual-book exercise draft');await page.locator('#exerciseDone').click();await page.locator('#revealMathAnswer').click();await page.locator('#answerSource').click();assert.equal(await page.locator('#pdfPage').inputValue(),'1002');await page.waitForFunction(()=>document.getElementById('readerStatus')?.textContent.includes('PDF page 1002'));
 await page.reload();await page.waitForFunction(()=>window.Study);await page.evaluate(()=>Study.math());await page.locator('#mathUnit').waitFor();await page.locator('[data-step="read"]').click();assert.equal(await page.locator('#mathNotes').inputValue(),'Private actual-book verification note');await page.locator('[data-step="practice"]').click();assert.equal(await page.locator('#exerciseWork').inputValue(),'Private actual-book exercise draft');
 await page.locator('.optional-material summary').click();await page.locator('#openChapterMaterial').click();assert.equal(await page.locator('#pdfPage').inputValue(),'218');
 assert.deepEqual(errors,[]);console.log('PASS: uploaded 1118-page Rosen PDF; all 72 sections, exercises and answers; real reading canvas; chapter links; notes and exercise persistence.');
}finally{await browser.close()}
