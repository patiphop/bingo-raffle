import { useEffect, useState } from 'react';
import { pollBoard } from '../lib/api.js';

export default function Board(){
  const [snap, setSnap] = useState(null);
  const params = new URLSearchParams(window.location.hash.split('?')[1]||'');
  const gameId = params.get('gameId');

  useEffect(()=>{
    (async ()=>{
      if(!gameId) return;
      await pollBoard(gameId, setSnap);
    })();
  },[gameId]);

  useEffect(()=>{
    if(!snap) return;
  },[snap]);

  const renderNumbers = (min=1, max=75, called=[])=>{
    const set = new Set(called||[]);
    return (
      <div className="gridBoard">
        {Array.from({length:(max-min+1)}).map((_,idx)=>{
          const n = min + idx;
          const called = set.has(n);
          return <div key={n} className={'n' + (called?' called':'')}>{n}</div>;
        })}
      </div>
    );
  };

  if(!gameId){
    return <main className="container"><h1 id="gameName">Missing gameId in URL</h1></main>;
  }

  return (
    <main className="container">
      <h1 id="gameName">{snap?.game ? `${snap.game.name} — ${snap.game.status}` : 'Live Board'}</h1>
      <div id="lastValue" className="giant">{snap?.lastValue ?? ''}</div>
      <div className="row">
        <span className="muted">Updated: <span id="updated">{snap?.lastUpdatedAt || ''}</span></span>
      </div>
      <section id="numbersSection" className="card dark" style={{display: (snap?.game && snap.game.type==='RAFFLE') ? 'none' : ''}}>
        <h2>Numbers</h2>
        {renderNumbers((snap?.numberMin||1),(snap?.numberMax||75), snap?.called||[])}
      </section>
      <section className="card dark">
        <h2>Winners</h2>
        <ol id="winners">
          {(snap?.winners||[]).map((x,idx)=> <li key={idx}>#{x.rank} {x.displayName} — {x.pattern}</li>)}
        </ol>
      </section>
    </main>
  );
}

