import React from 'react';
import GameBoard from './components/GameBoard';
import Keyboard from './components/Keyboard';
import Header from './components/Header';
import './styles/main.css';
import TestLoader from './components/TestLoader';

const App: React.FC = () => {
    return (
        <div className="App">
          <TestLoader />
        </div>
        
    );
};

export default App;