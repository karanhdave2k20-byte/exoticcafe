import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, RefreshCw, Flame, Music, Coffee, Trophy } from 'lucide-react';
import { ChatMessage } from '../types';

interface AiMitraScreenProps {
  tableNumber: number;
  userName: string;
}

export const AiMitraScreen: React.FC<AiMitraScreenProps> = ({
  tableNumber,
  userName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: `Hello ${userName}! 👋 I am **AI Mitra**, your personal dining and music companion at **TableHive Café** (Table #${tableNumber}). How can I delight your table today?`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    { text: "Suggest 2025–2026 trending new songs to play", icon: Flame, tag: "New Songs" },
    { text: "What are the chef's best spicy snack pairings?", icon: Coffee, tag: "Snack Pairing" },
    { text: "Live cricket match updates & scores", icon: Trophy, tag: "Live Cricket" },
    { text: "Recommend a relaxing acoustic playlist", icon: Music, tag: "Chill Vibe" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      const reply = data.reply || "I am right here at your TableHive table! Try asking for dish pairings or trending music!";

      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          role: 'model',
          text: reply,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          role: 'model',
          text: "🎶 **Trending Now at TableHive:** Stree 2's *Aaj Ki Raat*, Anuv Jain's *Jo Tum Mere Ho*, and Sabrina Carpenter's *Espresso*! Check out our **Music** tab for live radio and 15+ new chartbuster tracks!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] max-w-md mx-auto">
      {/* AI Mitra Header */}
      <div className="p-3.5 bg-white border-b border-slate-200/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-xs text-slate-900">AI Mitra Companion</h3>
              <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-extrabold uppercase">
                Gemini
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Live for Table #{tableNumber}</p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: `init-${Date.now()}`,
                role: 'model',
                text: `Welcome back ${userName}! What would you like to explore on our TableHive menu or music playlists?`,
              },
            ])
          }
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          title="Reset Chat"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Suggestion Chips */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200/60 overflow-x-auto no-scrollbar flex items-center gap-1.5 flex-shrink-0">
        {quickQuestions.map((q, idx) => {
          const Icon = q.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSendMessage(q.text)}
              className="px-2.5 py-1 rounded-xl bg-white border border-slate-200/90 hover:border-purple-300 text-[11px] font-semibold text-slate-700 flex items-center gap-1 flex-shrink-0 shadow-2xs hover:bg-purple-50/50 transition-all cursor-pointer"
            >
              <Icon className="w-3 h-3 text-purple-600" />
              <span>{q.tag}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                  isUser
                    ? 'bg-brand-700 text-white font-bold'
                    : 'bg-purple-600 text-white font-bold'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  isUser
                    ? 'bg-brand-700 text-white rounded-tr-xs'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
            <span>AI Mitra is typing recommendations...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 bg-white border-t border-slate-200/90 flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AI Mitra about songs, dishes, or drinks..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-purple-500 shadow-2xs"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md hover:shadow-lg disabled:opacity-40 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
