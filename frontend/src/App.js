import React from 'react';
import './App.css';
import Game from './components/Game.tsx';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Subsequences</h1>
      </header>
      <main>
        <Game />
      </main>
    </div>
  );
}

export default App;
