// ESM API client for Apps Script backend using SHEET_URL from Vite env
// Priority: SHEET_URL (.env) -> localStorage('apiBaseUrl') -> ''
const ENV_BASE = (import.meta.env?.SHEET_URL || '').trim();
const LS_BASE = (typeof localStorage !== 'undefined' ? (localStorage.getItem('apiBaseUrl') || '') : '').trim();
const API_BASE = ENV_BASE || LS_BASE || '';

function ensureBase(){
  if(!API_BASE){ throw new Error('Please set SHEET_URL in .env (or localStorage apiBaseUrl)'); }
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

function pollBoard(gameId, onUpdate, intervalSec){
  let stopped = false;
  const stop = () => { stopped = true; };
  const iv = Number(intervalSec || (Number((typeof localStorage!=='undefined' && localStorage.getItem('boardRefreshSec')) || 3)));
  let lastStamp = '';
  (async function loop(){
    while(!stopped){
      try{
        const snap = await apiBoard(gameId);
        if(snap && snap.lastUpdatedAt && snap.lastUpdatedAt !== lastStamp){
          lastStamp = snap.lastUpdatedAt;
          if(typeof onUpdate === 'function') onUpdate(snap);
        }
      }catch(e){ console.warn('poll error', e); }
      await new Promise(r=>setTimeout(r, iv*1000));
    }
  })();
  return stop;
}

export {
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
};

