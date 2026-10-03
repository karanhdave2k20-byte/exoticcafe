'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Trophy, Sparkles } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';

type Board = number[][];

export default function Game2048Page() {
  const { showToast } = useStore();
  const [board, setBoard] = useState<Board>([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const tileNames: Record<number, string> = {
    2: 'Bean 🌱',
    4: 'Light ☕',
    8: 'Espresso ⚡',
    16: 'Macchiato 🥛',
    32: 'Cortado 🤎',
    64: 'Cappuccino ☁️',
    128: 'Mocha 🍫',
    256: 'Affogato 🍨',
    512: 'Cold Brew 🧊',
    1024: 'Irish Gold 🏆',
    2048: 'Exotic Master 👑',
  };

  const spawnTile = (currentBoard: Board): Board => {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return currentBoard;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const val = Math.random() < 0.9 ? 2 : 4;

    const newBoard = currentBoard.map(row => [...row]);
    newBoard[randomCell.r][randomCell.c] = val;
    return newBoard;
  };

  const startNewGame = useCallback(() => {
    let fresh: Board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    fresh = spawnTile(fresh);
    fresh = spawnTile(fresh);
    setBoard(fresh);
    setScore(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    startNewGame();
    try {
      const saved = localStorage.getItem('tablehive-2048-best');
      if (saved) setBestScore(parseInt(saved, 10));
    } catch (e) {}
  }, [startNewGame]);

  const slideRow = (row: number[]) => {
    let filtered = row.filter(x => x !== 0);
    let points = 0;
    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2;
        points += filtered[i];
        filtered[i + 1] = 0;
      }
    }
    filtered = filtered.filter(x => x !== 0);
    while (filtered.length < 4) {
      filtered.push(0);
    }
    return { row: filtered, points };
  };

  const move = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameOver) return;

    let current = board.map(r => [...r]);
    let addedScore = 0;
    let moved = false;

    if (direction === 'left') {
      for (let r = 0; r < 4; r++) {
        const { row: newRow, points } = slideRow(current[r]);
        addedScore += points;
        if (newRow.some((val, idx) => val !== current[r][idx])) moved = true;
        current[r] = newRow;
      }
    } else if (direction === 'right') {
      for (let r = 0; r < 4; r++) {
        const reversed = [...current[r]].reverse();
        const { row: newRow, points } = slideRow(reversed);
        addedScore += points;
        const unreversed = newRow.reverse();
        if (unreversed.some((val, idx) => val !== current[r][idx])) moved = true;
        current[r] = unreversed;
      }
    } else if (direction === 'up') {
      for (let c = 0; c < 4; c++) {
        const col = [current[0][c], current[1][c], current[2][c], current[3][c]];
        const { row: newCol, points } = slideRow(col);
        addedScore += points;
        for (let r = 0; r < 4; r++) {
          if (current[r][c] !== newCol[r]) moved = true;
          current[r][c] = newCol[r];
        }
      }
    } else if (direction === 'down') {
      for (let c = 0; c < 4; c++) {
        const col = [current[3][c], current[2][c], current[1][c], current[0][c]];
        const { row: newCol, points } = slideRow(col);
        addedScore += points;
        const unreversed = newCol.reverse();
        for (let r = 0; r < 4; r++) {
          if (current[r][c] !== unreversed[r]) moved = true;
          current[r][c] = unreversed[r];
        }
      }
    }

    if (moved) {
      const nextBoard = spawnTile(current);
      setBoard(nextBoard);
      setScore(prev => {
        const newScore = prev + addedScore;
        if (newScore > bestScore) {
          setBestScore(newScore);
          localStorage.setItem('tablehive-2048-best', newScore.toString());
        }
        return newScore;
      });
    }
  }, [board, gameOver, bestScore]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        move('up');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        move('down');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        move('left');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        move('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const getTileColor = (val: number) => {
    switch (val) {
      case 2: return 'bg-warm-subtle text-roast-900 border-warm-border shadow-sm font-semibold';
      case 4: return 'bg-[#F5EBDC] text-roast-900 border-[#DFCDB8] shadow-sm font-semibold';
      case 8: return 'bg-[#EEDBC3] text-roast-900 border-[#D4B591] shadow-sm font-bold';
      case 16: return 'bg-[#F0C78A] text-roast-950 border-[#E09F48] shadow-sm font-bold';
      case 32: return 'bg-[#E09F48] text-white border-[#C88736] shadow-sm font-bold';
      case 64: return 'bg-[#C88736] text-white border-[#B87326] shadow-sm font-bold';
      case 128: return 'bg-[#B87326] text-white border-[#9E5E19] shadow-gold font-black';
      case 256: return 'bg-[#9E5E19] text-white border-[#7E4812] shadow-gold font-black';
      case 512: return 'bg-[#7E4812] text-white border-[#5B330B] shadow-gold font-black';
      case 1024: return 'bg-gradient-to-r from-caramel-500 to-yellow-500 text-white font-black shadow-gold';
      case 2048: return 'bg-gradient-to-r from-caramel-500 via-caramel-500 to-amber-600 text-white font-black shadow-glow animate-pulse';
      default: return 'bg-warm-subtle/50 text-transparent border-warm-border/40';
    }
  };

  return (
    <div className="max-w-md mx-auto py-4 flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/fun" className="p-2 rounded-full glass-card text-muted hover:text-caramel-700 bg-white border border-warm-border">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-caramel-700">
            Café Roaster Edition
          </span>
          <h1 className="text-2xl font-serif font-black text-roast-900">
            2048 Coffee Roast
          </h1>
        </div>
        <button
          onClick={startNewGame}
          className="p-2 rounded-full glass-card text-muted hover:text-caramel-700 bg-white border border-warm-border"
          title="Restart Game"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Scores Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-3 rounded-2xl text-center border border-warm-border bg-white shadow-sm">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted block">Score</span>
          <span className="text-xl font-black text-roast-900 font-mono">{score}</span>
        </div>
        <div className="glass-card p-3 rounded-2xl text-center border border-warm-border bg-white shadow-sm">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted block flex items-center justify-center gap-1">
            <Trophy className="w-3 h-3 text-amber-500" />
            <span>Best</span>
          </span>
          <span className="text-xl font-black text-caramel-600 font-mono">{bestScore}</span>
        </div>
      </div>

      {/* 4x4 Game Grid */}
      <div className="w-full aspect-square glass-card p-3 rounded-3xl border border-warm-border shadow-glass grid grid-cols-4 grid-rows-4 gap-2.5 bg-warm-subtle">
        {board.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`rounded-2xl border flex flex-col items-center justify-center p-1 transition-all duration-150 select-none ${getTileColor(cell)}`}
            >
              {cell > 0 && (
                <>
                  <span className="text-lg sm:text-2xl font-black font-mono leading-none">
                    {cell}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-semibold opacity-90 truncate max-w-full text-center mt-1">
                    {tileNames[cell]}
                  </span>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Mobile Touch Controls */}
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto w-full pt-1">
        <div />
        <button
          onClick={() => move('up')}
          className="btn-secondary py-3 text-sm font-bold shadow-sm"
        >
          ▲
        </button>
        <div />
        <button
          onClick={() => move('left')}
          className="btn-secondary py-3 text-sm font-bold shadow-sm"
        >
          ◀
        </button>
        <button
          onClick={() => move('down')}
          className="btn-secondary py-3 text-sm font-bold shadow-sm"
        >
          ▼
        </button>
        <button
          onClick={() => move('right')}
          className="btn-secondary py-3 text-sm font-bold shadow-sm"
        >
          ▶
        </button>
      </div>

      <p className="text-[11px] text-muted text-center">
        Use arrow keys, WASD, or on-screen buttons to slide & merge coffee beans.
      </p>
    </div>
  );
}
