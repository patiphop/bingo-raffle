// Minimal API client for Apps Script backend
const API_BASE = localStorage.getItem('apiBaseUrl') || '';

function ensureBase(){
  if(!API_BASE){ throw new Error('Please set API Base URL on index.html'); }
}

async function getJSON(path){
  ensureBase();
  const res = await fetch(API_BASE + path, { method: 'GET' });
  if(!res.ok){ throw new Error('HTTP ' + res.status); }
  return await res.json();
}

async function postJSON(path, payload){
  ensureBase();
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload||{})
  });
  if(!res.ok){
    let msg = 'HTTP ' + res.status;
    try { const t = await res.text(); if(t) msg += ('\n' + t); } catch {}
    throw new Error(msg);
  }
  try { return await res.json(); } catch { return {}; }
}

// Host
function apiStart(cfg){ return postJSON('/api/start', cfg); }
function apiDraw(p){ return postJSON('/api/draw', p); }
function apiUndo(p){ return postJSON('/api/undo', p); }
function apiEnd(p){ return postJSON('/api/end', p); }
function apiReset(p){ return postJSON('/api/reset', p); }

// Public
function apiJoin(p){ return postJSON('/api/join', p); }
function apiCard(gameId, participantId){ return getJSON(`/api/card?gameId=${encodeURIComponent(gameId)}&participantId=${encodeURIComponent(participantId)}`); }
function apiClaim(p){ return postJSON('/api/claim', p); }
function apiBoard(gameId){ return getJSON(`/api/board?gameId=${encodeURIComponent(gameId)}`); }

// Polling helper with ETag-like timestamp guard (client-side)
let __polling = false;
async function pollBoard(gameId, onUpdate, intervalSec){
  intervalSec = Number(intervalSec || (Number(localStorage.getItem('boardRefreshSec')) || 3));
  if(__polling) return; __polling = true;
  let lastStamp = '';
  while(true){
    try{
      const snap = await apiBoard(gameId);
      if(snap && snap.lastUpdatedAt && snap.lastUpdatedAt !== lastStamp){
        lastStamp = snap.lastUpdatedAt;
        if(typeof onUpdate === 'function') onUpdate(snap);
      }
    }catch(e){ console.warn('poll error', e); }
    await new Promise(r=>setTimeout(r, intervalSec*1000));
  }
}

// Expose for tests and Node
if (typeof globalThis !== 'undefined') {
  const apiExport = {
    ensureBase,
    getJSON,
    postJSON,
    apiStart,
    apiDraw,
    apiUndo,
    apiEnd,
    apiReset,
    apiJoin,
    apiCard,
    apiClaim,
    apiBoard,
    pollBoard,
    get __polling() { return __polling; },
    set __polling(value) { __polling = value; }
  };
  // namespace to avoid polluting globals
  globalThis.__api__ = apiExport;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = globalThis.__api__;
}
