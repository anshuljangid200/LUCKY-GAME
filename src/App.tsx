import { useState, useEffect, useCallback } from 'react';
import './App.css';

type BoxStatus = 'idle' | 'winning' | 'losing';

interface BoxState {
  id: number;
  status: BoxStatus;
}

const TOTAL_BOXES = 16;
const POOL_SIZE = 5;

function App() {
  const [boxes, setBoxes] = useState<BoxState[]>([]);
  const [winningId, setWinningId] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [_pool, setPool] = useState<boolean[]>([]);
  const [message, setMessage] = useState('TAP A BOX TO START');

  const generatePool = () => {
    // 1 win in 5 rounds
    const newPool = Array(POOL_SIZE).fill(false);
    newPool[Math.floor(Math.random() * POOL_SIZE)] = true;
    return newPool;
  };

  const initializeGame = useCallback(() => {
    const initialBoxes = Array.from({ length: TOTAL_BOXES }, (_, i) => ({
      id: i,
      status: 'idle' as BoxStatus,
    }));
    setBoxes(initialBoxes);

    setPool((prevPool) => {
      let currentPool = [...prevPool];
      if (currentPool.length === 0) {
        currentPool = generatePool();
      }
      const currentRoundStatus = currentPool.pop();
      setWinningId(currentRoundStatus ? Math.floor(Math.random() * TOTAL_BOXES) : null);
      return currentPool;
    });

    setGameOver(false);
    setMessage('TAP A BOX TO START');
  }, []);

  useEffect(() => {
    initializeGame();
    const saved = localStorage.getItem('lucky-game-best');
    if (saved) setBestScore(parseInt(saved));
  }, [initializeGame]);

  const handleBoxClick = (id: number) => {
    if (gameOver) return;

    const isWin = winningId !== null && id === winningId;

    setBoxes((prev) =>
      prev.map((box) => {
        if (box.id === id) {
          return { ...box, status: isWin ? 'winning' : 'losing' };
        }
        if (box.id === winningId) {
          return { ...box, status: 'winning' };
        }
        return box;
      })
    );

    if (isWin) {
      const newScore = score + 20; // More points for hard mode
      setScore(newScore);
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('lucky-game-best', newScore.toString());
      }
      setMessage('🎉 ELITE WIN!');
    } else {
      setScore(0);
      setMessage(winningId !== null ? '💥 SO CLOSE...' : '💥 NO LUCK THIS TIME');
    }

    setGameOver(true);
  };

  return (
    <>
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="game-container fade-up">
        <h1>MYSTIC GRID</h1>


        <div className="stats">
          <div className="stat-item">SCORE <span>{score}</span></div>
          <div className="stat-item">BEST <span>{bestScore}</span></div>
        </div>

        <div className={`status-message ${gameOver ? 'active' : ''}`}>
          {message}
        </div>

        <div className="grid">
          {boxes.map((box) => (
            <div
              key={box.id}
              className={`box ${box.status} ${gameOver ? 'disabled' : ''}`}
              onClick={() => handleBoxClick(box.id)}
            >
              {box.status === 'winning' && <span className="icon">🏆</span>}
              {box.status === 'losing' && <span className="icon">✖</span>}
              {box.status === 'idle' && <div className="box-label">LUCK</div>}
              {box.status !== 'idle' && (
                <div className="box-label">
                  {box.status === 'winning' ? 'WIN' : 'LOSS'}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="controls">
          {gameOver ? (
            <button className="play-button fade-up" onClick={initializeGame}>
              PLAY AGAIN
            </button>
          ) : (
            <div style={{ height: '54px' }}></div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
