'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Bot, User, Trash2, Sparkles, Coffee, Loader2 } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';

interface ChatMessage {
  role: 'user' | 'model' | 'ai';
  text: string;
}

const STORAGE_KEY = 'tablehive_ai_chat_history';

export default function AITalkPage() {
  const { showToast } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([
          {
            role: 'model',
            text: 'Hello! I am your Exotic AI Barista & Culinary Sommelier. Ask me anything about coffee roasts, pastry pairings, our secret menu, or even a fun coffee fact while you dine!',
          },
        ]);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const clearHistory = () => {
    const welcome: ChatMessage[] = [
      {
        role: 'model',
        text: 'Chat history cleared. How can I delight your table today?',
      },
    ];
    setMessages(welcome);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(welcome));
    showToast('Conversation cleared', 'info');
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: query };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
      } else {
        throw new Error(data.error || 'Could not reach AI Barista.');
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: `I apologize, I had trouble connecting to the barista neural network: ${err.message}. Single-origin Colombian beans pair divinely with our New York Cheesecake!`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'What dessert pairs best with Cappuccino?',
    'Tell me a fun coffee barista joke!',
    'Which item has the highest caffeine punch?',
    'Explain the difference between Latte and Flat White',
  ];

  return (
    <div className="max-w-2xl mx-auto py-2 flex flex-col h-[82vh] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-warm-border">
        <div className="flex items-center gap-3">
          <Link href="/fun" className="p-2 rounded-full glass-card text-muted hover:text-caramel-700 bg-white border border-warm-border">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-gold border border-caramel-300">
              <img src="/ai_bot_logo.jpg" alt="AI Barista" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-roast-900 leading-none">
                Exotic AI Barista
              </h2>
              <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-semibold mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Gemini Powered • Online
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={clearHistory}
          className="p-2 rounded-full glass-card text-muted hover:text-rose-600 bg-white border border-warm-border transition-colors"
          title="Clear History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3 pr-1">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 max-w-[85%] ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm ${
                isUser 
                  ? 'bg-caramel-600 text-white' 
                  : 'bg-gradient-to-tr from-caramel-500 to-caramel-500 text-white'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-caramel-500 to-caramel-600 text-white font-medium rounded-tr-none shadow-gold'
                    : 'glass-card border border-warm-border bg-white text-roast-900 rounded-tl-none shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted mr-auto glass-card px-4 py-2.5 rounded-2xl bg-white border border-warm-border shadow-sm">
            <Loader2 className="w-4 h-4 text-caramel-600 animate-spin" />
            <span>Barista is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1.5 rounded-full text-[11px] font-medium glass-card border border-warm-border bg-warm-subtle hover:bg-white hover:border-caramel-500 text-roast-800 whitespace-nowrap transition-all flex-shrink-0 shadow-sm"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 pt-2"
      >
        <input
          type="text"
          placeholder="Ask our AI Barista anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 glass-input px-4 py-3 rounded-full text-xs bg-white border border-warm-border text-roast-900"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-11 h-11 rounded-full btn-primary flex items-center justify-center p-0 disabled:opacity-40 shadow-gold"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
