import { Link } from 'react-router-dom';
import './shared.css';

export default function Home(){
  return (
    <>
      <header className="container">
        <h1>Bingo / Raffle</h1>
        <p>Frontend for GitHub Pages + Google Apps Script backend</p>
      </header>
      <main className="container grid">
        <section className="card">
          <h2>Host Console</h2>
          <p>Start/End game, Draw/Undo, and open the live board.</p>
          <Link className="button" to="/host">Open Host</Link>
        </section>
        <section className="card">
          <h2>Player</h2>
          <p>Join a game and play Bingo or watch Raffle results.</p>
          <Link className="button" to="/player">Open Player</Link>
        </section>
        <section className="card">
          <h2>Board (Projector)</h2>
          <p>Full-screen live board for the event screen.</p>
          <Link className="button" to="/board">Open Board</Link>
        </section>
      </main>
      <footer className="container small">
        <details>
          <summary>Backend Settings (Apps Script Web App URL)</summary>
          <EnvHelper/>
        </details>
      </footer>
    </>
  );
}

function EnvHelper(){
  const sheetUrl = import.meta.env?.SHEET_URL || '';
  if(sheetUrl){
    return <p className="muted">Using SHEET_URL from .env</p>;
  }
  return (
    <div>
      <label htmlFor="apiBaseUrl">API Base URL:</label>
      <input id="apiBaseUrl" placeholder="https://script.google.com/macros/s/XXXX/exec" defaultValue={(typeof localStorage!=='undefined' && localStorage.getItem('apiBaseUrl'))||''} />
      <button onClick={()=>{
        const el = document.getElementById('apiBaseUrl');
        localStorage.setItem('apiBaseUrl', (el?.value||'').trim());
        alert('Saved API Base URL.');
      }} className="button">Save</button>
      <p className="muted">Stored in localStorage. Pages will use this for API calls.</p>
    </div>
  );
}

