export function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
export function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(e){alert('Progress could not be saved. Export your work or free browser storage before continuing.');return false}}
let dbPromise;
export function database(){return dbPromise??=new Promise((resolve,reject)=>{const r=indexedDB.open('interview-helper-private-files',1);r.onupgradeneeded=()=>r.result.createObjectStore('files');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
export async function fileGet(key){const db=await database();return new Promise((resolve,reject)=>{const r=db.transaction('files').objectStore('files').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
export async function filePut(key,value){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').put(value,key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Browser storage is full.'))})}
export async function fileDelete(key){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').delete(key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const $=id=>document.getElementById(id);
export function download(name,value,type='application/json'){const a=document.createElement('a'),u=URL.createObjectURL(new Blob([value],{type}));a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
