'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Trophy, User, Ghost } from 'lucide-react';

export default function TicTacToePage() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  
  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every((square) => square !== null);

  const handleClick = (i: number) => {
    if (board[i] || winner) return;
    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  return (
    <div className="max-w-md mx-auto py-4 flex flex-col gap-6 animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link href="/fun" className="p-2 rounded-full glass-card text-muted hover:text-caramel-700 bg-white border border-warm-border">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-caramel-700">
            Settle The Bill
          </span>
          <h1 className="text-2xl font-serif font-black text-roast-900">
            Tic-Tac-Toe
          </h1>
        </div>
        <button onClick={resetGame} className="p-2 rounded-full glass-card text-caramel-600 hover:text-caramel-800 bg-white border border-warm-border">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Game Board */}
      <div className="glass-card p-8 rounded-3xl border border-warm-border shadow-glass flex flex-col items-center bg-white relative">
        
        {/* Status Area */}
        <div className="mb-8 text-center">
          {winner ? (
            <div className="flex flex-col items-center gap-2 animate-bounce">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h2 className="text-xl font-black text-roast-900">Player {winner} Wins!</h2>
            </div>
          ) : isDraw ? (
            <div className="flex flex-col items-center gap-2 text-muted">
              <Ghost className="w-8 h-8" />
              <h2 className="text-xl font-bold">It&apos;s a Draw!</h2>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-roast-800 font-bold">
              <User className="w-5 h-5" />
              <span>Next Player: <span className={`text-xl ${xIsNext ? 'text-caramel-600' : 'text-blue-500'}`}>{xIsNext ? 'X' : 'O'}</span></span>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
          {board.map((cell, i) => (
            <button
              key={i}
              onClick={() => handleClick(i)}
              className={`aspect-square rounded-2xl flex items-center justify-center text-5xl font-black transition-all ${
                cell === 'X' ? 'text-caramel-600 bg-caramel-50 border-caramel-200' : 
                cell === 'O' ? 'text-blue-500 bg-blue-50 border-blue-200' : 
                'bg-warm-subtle border-warm-border hover:bg-caramel-50 hover:border-caramel-200 cursor-pointer'
              } border-2 shadow-sm ${!cell && !winner && 'hover:scale-105'}`}
            >
              {cell}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
