import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Host from './pages/Host.jsx';
import Player from './pages/Player.jsx';
import Board from './pages/Board.jsx';

export default function App(){
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/host" element={<Host/>} />
        <Route path="/player" element={<Player/>} />
        <Route path="/board" element={<Board/>} />
      </Routes>
    </HashRouter>
  );
}

