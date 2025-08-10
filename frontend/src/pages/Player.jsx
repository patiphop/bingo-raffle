import { useState } from 'react';
import { apiJoin, pollBoard } from '../lib/api.js';

export default function Player(){
  const [current, setCurrent] = useState({ gameId:'', participantId:'', cardId:'', gridSize:5, freeCenter:true });
  const [cells, setCells] = useState(null);
  const [lastValue, setLastValue] = useState('');

  const buildCells = (cells, gridSize, freeCenter)=>{
    return (
      <div id="cardGrid" className="grid grid-5">
        {Array.from({length:gridSize}).map((_,r)=>
          Array.from({length:gridSize}).map((_,c)=>{
            const v = cells[r][c];
            const isFree = freeCenter && r===Math.floor(gridSize/2) && c===Math.floor(gridSize/2);
            return <div key={`${r}-${c}`} className={'cell' + (isFree?' free':'')}>{isFree?'FREE':v}</div>
          })
        )}
      </div>
    );
  };

  const onJoin = async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = { gameId: fd.get('gameId'), displayName: fd.get('displayName') };
    try{
      const res = await apiJoin(payload);
      const next = { ...current, gameId: payload.gameId, participantId: res.participantId };
      if(res.cardId){ next.cardId = res.cardId; }
      setCurrent(next);
      if(res.cells){
        next.gridSize = res.gridSize || 5;
        next.freeCenter = !!res.freeCenter;
        setCells(res.cells);
      }
      startPolling(next.gameId);
    }catch(err){ alert(err.message||String(err)); }
  };

  async function startPolling(gameId){
    if(!gameId) return;
    await pollBoard(gameId, (snap)=>{
      setLastValue(snap.lastValue ?? '');
    });
  }

  return (
    <main className="container">
      <section className="card">
        <h2>Join Game</h2>
        <form onSubmit={onJoin} className="row">
          <label>Game ID <input name="gameId" required placeholder="G_abc123" /></label>
          <label>Display Name <input name="displayName" required placeholder="Pat" /></label>
          <button className="button" type="submit">Join</button>
        </form>
        <pre className="muted">{JSON.stringify({ participantId: current.participantId, cardId: current.cardId }, null, 2)}</pre>
      </section>

      {cells && (
        <section className="card">
          <h2>Your Card</h2>
          {buildCells(cells, current.gridSize, current.freeCenter)}
          <button className="button" style={{display:'none'}}>Claim Bingo</button>
        </section>
      )}

      <section className="card">
        <h2>Live Status</h2>
        <div className="big">{String(lastValue)}</div>
        <div className="muted">Auto-refresh</div>
      </section>
    </main>
  );
}

