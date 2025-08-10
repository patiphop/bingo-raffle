/**
 * Google Apps Script backend for Bingo/Raffle (MVP+)
 * Endpoints: /api/start, /api/join, /api/card, /api/draw, /api/undo, /api/claim, /api/board, /api/end, /api/reset
 * Storage: Google Sheets
 */

const SHEET_GAMES = 'Games';
const SHEET_PARTICIPANTS = 'Participants';
const SHEET_CARDS = 'Cards';
const SHEET_DRAWS = 'Draws';
const SHEET_WINNERS = 'Winners';
const SHEET_CONFIG = 'Config';
const SHEET_BOARD_CACHE = 'BoardCache';

function doGet(e) {
  const path = (e && e.pathInfo) || '';
  if (path === 'api/board') return handleBoard(e);
  if (path === 'api/card') return handleCard(e);
  return ContentService.createTextOutput('Not Found').setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const path = (e && e.pathInfo) || '';
  const body = (e && e.postData && e.postData.contents) ? JSON.parse(e.postData.contents) : {};
  if (path === 'api/start') return handleStart(body);
  if (path === 'api/join') return handleJoin(body);
  if (path === 'api/draw') return handleDraw(body);
  if (path === 'api/undo') return handleUndo(body);
  if (path === 'api/claim') return handleClaim(body);
  if (path === 'api/end') return handleEnd(body);
  if (path === 'api/reset') return handleReset(body);
  return ContentService.createTextOutput('Not Found').setMimeType(ContentService.MimeType.TEXT);
}

// ---------- Utils ----------
function getSheet(name){ return SpreadsheetApp.getActive().getSheetByName(name); }
function jsonOutput(obj){ return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function nowISO(){ return new Date().toISOString(); }
function randId(prefix){ return prefix + '_' + Math.random().toString(36).substr(2,6); }

function loadGames(){ return getSheet(SHEET_GAMES).getDataRange().getValues(); }
function loadParticipants(){ return getSheet(SHEET_PARTICIPANTS).getDataRange().getValues(); }
function loadCards(){ return getSheet(SHEET_CARDS).getDataRange().getValues(); }
function loadDraws(){ return getSheet(SHEET_DRAWS).getDataRange().getValues(); }
function loadWinners(){ return getSheet(SHEET_WINNERS).getDataRange().getValues(); }

function getGame(gameId){
  const rows = loadGames();
  for (var i=0;i<rows.length;i++){
    const r = rows[i];
    if (r[0] === gameId){
      return {
        rowIndex: i+1,
        gameId: r[0],
        name: r[1],
        type: r[2],
        gridSize: Number(r[3]),
        numberMin: Number(r[4]),
        numberMax: Number(r[5]),
        freeCenter: r[6] === true || r[6] === 'TRUE' || r[6] === 1,
        winPatternsCSV: r[7] || '',
        maxWinners: Number(r[8]||0),
        noDuplicateWinners: r[9] === true || r[9] === 'TRUE' || r[9] === 1,
        status: r[10],
        boardRefreshSec: Number(r[13]||3),
        seed: r[14] || '',
        createdAt: r[15],
        endedAt: r[16]
      };
    }
  }
  return null;
}

// Draw list helpers (raw vs display)
function getCalledRawList(gameId){
  const rows = loadDraws();
  const out = [];
  for (var i=0;i<rows.length;i++){
    const r = rows[i];
    if (r[1] === gameId && r[5] !== true){ // undone flag falsey
      out.push(r[2]); // raw value (number or participantId string)
    }
  }
  return out;
}

function getCalledNumbers(gameId){
  return getCalledRawList(gameId).map(function(v){ return Number(v); }).filter(function(n){ return !isNaN(n); });
}

function getWinnersList(gameId){
  const rows = loadWinners();
  const out = [];
  for (var i=0;i<rows.length;i++){
    const r = rows[i];
    if (r[1] === gameId){
      out.push({ winnerId:r[0], gameId:r[1], participantId:r[2], pattern:r[3], rank:Number(r[4]), claimedAt:r[5], verifiedAt:r[6], prize:r[7], status:r[8] });
    }
  }
  out.sort(function(a,b){ return (a.rank||9999) - (b.rank||9999); });
  return out;
}

function getDisplayName(participantId){
  const rows = loadParticipants();
  for (var i=0;i<rows.length;i++){
    const r = rows[i];
    if (r[0] === participantId) return r[2];
  }
  return '';
}

// ---------- Endpoints ----------
function handleStart(cfg){
  const gameId = randId('G');
  const seed = Math.random().toString(36).substr(2,10);
  const sh = getSheet(SHEET_GAMES);
  sh.appendRow([
    gameId,
    cfg.name||'Bingo Game',
    (cfg.type||'BINGO').toUpperCase(),
    Number(cfg.gridSize||5),
    Number(cfg.numberMin||1),
    Number(cfg.numberMax||75),
    !!cfg.freeCenter,
    (cfg.winPatterns||[]).join(','),
    Number(cfg.maxWinners||0),
    !!cfg.noDuplicateWinners,
    'LIVE',
    '',
    '',
    Number(cfg.boardRefreshSec||3),
    seed,
    nowISO(),
    ''
  ]);
  return jsonOutput({
    gameId: gameId,
    joinUrl: 'https://user.github.io/app/join?gameId='+gameId,
    boardUrl: 'https://user.github.io/app/board?gameId='+gameId
  });
}

function handleJoin(p){
  const g = getGame(p.gameId);
  if (!g) return jsonOutput({ error: 'Game not found' });
  if (g.status !== 'LIVE') return jsonOutput({ error: 'Game not live' });

  const participantId = randId('P');
  getSheet(SHEET_PARTICIPANTS).appendRow([participantId, p.gameId, p.displayName||'Player', '', nowISO(), false]);

  if (g.type === 'BINGO'){
    const cells = generateCard(g.numberMin, g.numberMax, g.gridSize, g.freeCenter, g.seed, participantId);
    const cardId = randId('C');
    getSheet(SHEET_CARDS).appendRow([cardId, p.gameId, participantId, g.gridSize, JSON.stringify(cells), g.freeCenter, '', nowISO()]);
    return jsonOutput({ participantId, cardId, gridSize: g.gridSize, cells, freeCenter: g.freeCenter });
  }
  return jsonOutput({ participantId, message: 'Joined raffle' });
}

function handleCard(e){
  const gameId = e.parameter.gameId;
  const participantId = e.parameter.participantId;
  const rows = loadCards();
  for (var i=0;i<rows.length;i++){
    const r = rows[i];
    if (r[1]===gameId && r[2]===participantId){
      return jsonOutput({ cardId: r[0], gridSize: Number(r[3]), cells: JSON.parse(r[4]), freeCenter: !!r[5] });
    }
  }
  return jsonOutput({ error: 'Card not found' });
}

function handleDraw(p){
  const g = getGame(p.gameId);
  if (!g) return jsonOutput({ error: 'Game not found' });
  if (g.status !== 'LIVE') return jsonOutput({ error: 'Game not live' });

  if (g.type === 'RAFFLE'){
    // Build candidate pool: participants who joined, not yet drawn, and (if noDuplicateWinners) not already winners
    const participants = loadParticipants().filter(function(r){ return r[1]===p.gameId; });
    const drawnRaw = new Set(getCalledRawList(p.gameId));
    const existingWinners = new Set(getWinnersList(p.gameId).map(function(w){ return w.participantId; }));
    const pool = [];
    for (var i=0;i<participants.length;i++){
      const pid = participants[i][0];
      if (drawnRaw.has(pid)) continue;
      if (g.noDuplicateWinners && existingWinners.has(pid)) continue;
      pool.push(pid);
    }
    if (!pool.length) return jsonOutput({ error:'No participants to draw' });
    const picked = pool[Math.floor(Math.random()*pool.length)];

    const seq = appendDraw(p.gameId, picked); // store participantId as value
    // auto-register winner if within cap
    const winners = getWinnersList(p.gameId);
    if (!g.maxWinners || winners.length < g.maxWinners){
      const winnerId = randId('W');
      const rank = winners.length + 1;
      getSheet(SHEET_WINNERS).appendRow([winnerId, p.gameId, picked, 'RAFFLE', rank, nowISO(), nowISO(), '', 'VERIFIED']);
    }
    const calledNames = getCalledRawList(p.gameId).map(function(v){ return getDisplayName(v); });
    return jsonOutput({ sequence: seq, value: getDisplayName(picked), drawnAt: nowISO(), called: calledNames });
  }

  // BINGO draw numbers
  const drawValue = getNextDrawValue(p.gameId, g.numberMin, g.numberMax);
  if (drawValue == null) return jsonOutput({ error:'No more values to draw' });
  const seq = appendDraw(p.gameId, drawValue);
  const called = getCalledNumbers(p.gameId);
  return jsonOutput({ sequence: seq, value: drawValue, drawnAt: nowISO(), called: called });
}

function handleUndo(p){
  const sh = getSheet(SHEET_DRAWS);
  const data = sh.getDataRange().getValues();
  for (var i=data.length-1;i>=0;i--){
    const r = data[i];
    if (r[1]===p.gameId && r[5]!==true){ sh.getRange(i+1,6).setValue(true); break; }
  }
  return jsonOutput({ ok:true });
}

function handleClaim(p){
  const g = getGame(p.gameId);
  if (!g) return jsonOutput({ error: 'Game not found' });
  if (g.type !== 'BINGO') return jsonOutput({ error: 'Claim only for BINGO' });

  const result = validateBingo(p.gameId, p.participantId, g);
  if (!result.valid){ return jsonOutput({ valid:false }); }

  const winners = getWinnersList(p.gameId);
  if (g.noDuplicateWinners && winners.some(function(w){ return w.participantId===p.participantId; })){
    return jsonOutput({ valid:false, reason:'duplicate' });
    }
  const currentCount = winners.length;
  if (g.maxWinners && currentCount >= g.maxWinners){
    return jsonOutput({ valid:false, reason:'maxWinnersReached' });
  }

  const winnerId = randId('W');
  const rank = currentCount + 1;
  getSheet(SHEET_WINNERS).appendRow([winnerId, p.gameId, p.participantId, result.pattern, rank, nowISO(), nowISO(), '', 'VERIFIED']);
  return jsonOutput({ valid:true, pattern: result.pattern, rank: rank });
}

function handleBoard(e){
  const gameId = e.parameter.gameId;
  const g = getGame(gameId);
  if (!g) return jsonOutput({ error: 'Game not found' });
  var called = [];
  var lastValue = null;
  if (g.type === 'RAFFLE'){
    const raw = getCalledRawList(gameId);
    called = raw.map(function(v){ return getDisplayName(v); });
    lastValue = called.length ? called[called.length-1] : null;
  } else {
    called = getCalledNumbers(gameId);
    lastValue = called.length ? called[called.length-1] : null;
  }
  const winners = getWinnersList(gameId).map(function(w){
    return { rank:w.rank, displayName: getDisplayName(w.participantId), pattern: w.pattern, time: w.claimedAt };
  });
  return jsonOutput({
    game: { name: g.name, status: g.status, type: g.type },
    numberMin: g.numberMin,
    numberMax: g.numberMax,
    called: called,
    lastValue: lastValue,
    winners: winners,
    lastUpdatedAt: nowISO()
  });
}

function handleEnd(p){
  const g = getGame(p.gameId);
  if (!g) return jsonOutput({ error: 'Game not found' });
  const sh = getSheet(SHEET_GAMES);
  sh.getRange(g.rowIndex, 11).setValue('ENDED');
  sh.getRange(g.rowIndex, 17).setValue(nowISO());
  return jsonOutput({ ok:true });
}

function handleReset(p){
  const g = getGame(p.gameId);
  if (!g) return jsonOutput({ error: 'Game not found' });
  [SHEET_PARTICIPANTS, SHEET_CARDS, SHEET_DRAWS, SHEET_WINNERS].forEach(function(name){
    const sh = getSheet(name);
    const data = sh.getDataRange().getValues();
    for (var i=data.length-1;i>=2;i--){
      if (data[i-1][1] === p.gameId){ sh.deleteRow(i); }
    }
  });
  const sh = getSheet(SHEET_GAMES);
  sh.getRange(g.rowIndex, 11).setValue('DRAFT');
  return jsonOutput({ ok:true });
}

// ---------- Domain logic ----------
function generateCard(min, max, gridSize, freeCenter, seed, participantId){
  const pool = [];
  for (var n=min;n<=max;n++){ pool.push(n); }
  var card = [];
  for (var r=0;r<gridSize;r++){
    var row = [];
    for (var c=0;c<gridSize;c++){
      var idx = Math.floor(Math.random() * pool.length);
      row.push(pool.splice(idx,1)[0]);
    }
    card.push(row);
  }
  if (freeCenter){
    var m = Math.floor(gridSize/2);
    card[m][m] = 'FREE';
  }
  return card;
}

function getNextDrawValue(gameId, min, max){
  const called = getCalledNumbers(gameId);
  const set = {};
  for (var i=0;i<called.length;i++){ set[called[i]] = true; }
  const remaining = [];
  for (var n=min;n<=max;n++){ if (!set[n]) remaining.push(n); }
  if (!remaining.length) return null;
  return remaining[Math.floor(Math.random()*remaining.length)];
}

function validateBingo(gameId, participantId, game){
  const cards = loadCards();
  var cardRow = null;
  for (var i=0;i<cards.length;i++){
    var r = cards[i];
    if (r[1]===gameId && r[2]===participantId){ cardRow = r; break; }
  }
  if (!cardRow) return { valid:false };
  var gridSize = Number(cardRow[3]);
  var cells = JSON.parse(cardRow[4]);
  var freeCenter = !!cardRow[5];

  const calledNums = new Set(getCalledNumbers(gameId));
  var mask = [];
  for (var r=0;r<gridSize;r++){
    var row = [];
    for (var c=0;c<gridSize;c++){
      var v = cells[r][c];
      var hit = (v === 'FREE') || calledNums.has(Number(v));
      row.push(hit);
    }
    mask.push(row);
  }
  if (freeCenter){ var m = Math.floor(gridSize/2); mask[m][m] = true; }

  const patterns = (game.winPatternsCSV||'ROW,COLUMN,DIAGONAL').split(',').map(function(s){return s.trim();}).filter(String);

  function hasRow(){
    for (var r=0;r<gridSize;r++){ var ok=true; for (var c=0;c<gridSize;c++){ if(!mask[r][c]){ok=false;break;} } if(ok) return true; }
    return false;
  }
  function hasCol(){
    for (var c=0;c<gridSize;c++){ var ok=true; for (var r=0;r<gridSize;r++){ if(!mask[r][c]){ok=false;break;} } if(ok) return true; }
    return false;
  }
  function hasDiag(){
    var ok1=true; for (var i=0;i<gridSize;i++){ if(!mask[i][i]){ok1=false;break;} }
    var ok2=true; for (var j=0;j<gridSize;j++){ if(!mask[j][gridSize-1-j]){ok2=false;break;} }
    return ok1 || ok2;
  }
  function hasFourCorners(){ return mask[0][0] && mask[0][gridSize-1] && mask[gridSize-1][0] && mask[gridSize-1][gridSize-1]; }

  if (patterns.indexOf('ROW')>=0 && hasRow()) return { valid:true, pattern:'ROW' };
  if (patterns.indexOf('COLUMN')>=0 && hasCol()) return { valid:true, pattern:'COLUMN' };
  if (patterns.indexOf('DIAGONAL')>=0 && hasDiag()) return { valid:true, pattern:'DIAGONAL' };
  if (patterns.indexOf('FOUR_CORNERS')>=0 && hasFourCorners()) return { valid:true, pattern:'FOUR_CORNERS' };
  return { valid:false };
}

function appendDraw(gameId, value){
  const sh = getSheet(SHEET_DRAWS);
  const seq = sh.getLastRow(); // simple incremental sequence
  sh.appendRow(['', gameId, value, seq, nowISO(), false]);
  return seq;
}
