import { useState, useRef } from 'react';
import { apiStart, apiDraw, apiUndo, apiEnd, apiReset, apiBoard } from '../lib/api.js';
import QRCode from 'qrcode';

export default function Host(){
  const [currentGameId, setCurrentGameId] = useState(null);
  const [startResult, setStartResult] = useState('');
  const [called, setCalled] = useState([]);
  const [lastValue, setLastValue] = useState('');
  const [winners, setWinners] = useState([]);
  const [joinUrl, setJoinUrl] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const qrRef = useRef(null);

  const onStart = async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const winPatterns = fd.getAll('winPatterns');
    const cfg = {
      name: fd.get('name') || 'Bingo Game',
      type: fd.get('type') || 'BINGO',
      gridSize: Number(fd.get('gridSize')||5),
      numberMin: Number(fd.get('numberMin')||1),
      numberMax: Number(fd.get('numberMax')||75),
      freeCenter: !!fd.get('freeCenter'),
      winPatterns,
      maxWinners: Number(fd.get('maxWinners')||1),
      noDuplicateWinners: !!fd.get('noDuplicateWinners'),
      boardRefreshSec: Number(fd.get('boardRefreshSec')||3)
    };
    try{
      const res = await apiStart(cfg);
      setCurrentGameId(res.gameId);
      setStartResult(JSON.stringify(res,null,2));
      // Build player join URL based on current site path (GitHub Pages safe)
      const base = `${location.origin}${location.pathname}`; // e.g., https://user.github.io/repo/
      const playerUrl = `${base}#/player?gameId=${encodeURIComponent(res.gameId)}`;
      setJoinUrl(playerUrl);
      try {
        const dataUrl = await QRCode.toDataURL(playerUrl, { width: 200, margin: 1 });
        setQrUrl(dataUrl);
      } catch(e) {
        console.warn('QR error', e);
        setQrUrl('');
      }
    }catch(err){ alert(err.message||String(err)); }
  };

  const onDraw = async ()=>{
    if(!currentGameId) return;
    const res = await apiDraw({gameId: currentGameId});
    setLastValue(res.value ?? '');
    setCalled((res.called||[]).slice().reverse());
  };
  const onUndo = async ()=>{
    if(!currentGameId) return;
    await apiUndo({gameId: currentGameId});
    const b = await apiBoard(currentGameId);
    setLastValue(b.lastValue ?? '');
    setCalled((b.called||[]).slice().reverse());
    setWinners(b.winners||[]);
  };
  const onEnd = async ()=>{
    if(!currentGameId) return;
    if(!confirm('End this game?')) return;
    await apiEnd({gameId: currentGameId});
    alert('Game ended.');
  };
  const onReset = async ()=>{
    if(!currentGameId) return;
    if(!confirm('Reset this game to DRAFT and clear sub-data?')) return;
    await apiReset({gameId: currentGameId});
    alert('Game reset.');
  };

  const boardHref = currentGameId ? `#/board?gameId=${encodeURIComponent(currentGameId)}` : '#/board';

  return (
    <main className="container">
      <section className="card">
        <h2>Start Game</h2>
        <form onSubmit={onStart} className="grid">
          <label>Game Name <input name="name" required placeholder="Company Party Bingo" defaultValue="Company Party Bingo" /></label>
          <label>Type
            <select name="type" defaultValue="BINGO">
              <option value="BINGO">BINGO</option>
              <option value="RAFFLE">RAFFLE</option>
            </select>
          </label>
          <div className="row">
            <label>Grid Size <input type="number" name="gridSize" defaultValue={5} min={3} max={5} /></label>
            <label>Number Min <input type="number" name="numberMin" defaultValue={1} /></label>
            <label>Number Max <input type="number" name="numberMax" defaultValue={75} /></label>
            <label>Free Center <input type="checkbox" name="freeCenter" defaultChecked /></label>
          </div>
          <fieldset>
            <legend>Win Patterns</legend>
            <label><input type="checkbox" name="winPatterns" value="ROW" defaultChecked /> ROW</label>
            <label><input type="checkbox" name="winPatterns" value="COLUMN" defaultChecked /> COLUMN</label>
            <label><input type="checkbox" name="winPatterns" value="DIAGONAL" defaultChecked /> DIAGONAL</label>
            <label><input type="checkbox" name="winPatterns" value="FOUR_CORNERS" /> FOUR_CORNERS</label>
          </fieldset>
          <div className="row">
            <label>Max Winners <input type="number" name="maxWinners" defaultValue={3} min={1} /></label>
            <label>No Duplicate Winners <input type="checkbox" name="noDuplicateWinners" defaultChecked /></label>
            <label>Board Refresh (sec) <input type="number" name="boardRefreshSec" defaultValue={3} min={2} max={5} /></label>
          </div>
          <button className="button" type="submit">Start</button>
        </form>
        <div className="muted" style={{whiteSpace:'pre-wrap'}}>{startResult}</div>
      </section>

      {currentGameId && (
        <>
          <section className="card">
            <h2>Live Controls</h2>
            <div className="row">
              <button onClick={onDraw} className="button">Draw Next</button>
              <button onClick={onUndo} className="button secondary">Undo</button>
              <button onClick={onEnd} className="button danger">End Game</button>
              <button onClick={onReset} className="button warning">Reset</button>
              <a href={boardHref} className="button outline" target="_blank" rel="noreferrer">Open Board</a>
            </div>
            <div className="row">
              <label>Join URL <input readOnly value={joinUrl} /></label>
            </div>
            {qrUrl && (
              <div className="row">
                <img alt="Join QR" src={qrUrl} style={{maxWidth:160}} />
              </div>
            )}
          </section>
          <section className="card">
            <h2>Called</h2>
            <div className="big">{String(lastValue)}</div>
            <ol className="called">
              {called.map((v,idx)=> <li key={idx}>{v}</li>)}
            </ol>
          </section>
          <section className="card">
            <h2>Winners</h2>
            <ol>
              {(winners||[]).map((x,idx)=> <li key={idx}>#{x.rank} {x.displayName} — {x.pattern}</li>)}
            </ol>
          </section>
        </>
      )}
    </main>
  );
}

