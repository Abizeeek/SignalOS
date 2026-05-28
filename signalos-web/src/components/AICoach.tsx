import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send } from 'lucide-react';

export function AICoach() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'You are entering prime focus hours. Should we enable Monk Mode?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages([...messages, { role: 'user', content: input }]);
    setInput('');
    
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I have logged that workflow adjustment for future sessions.' }]);
    }, 1000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-30 p-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all hover:scale-105 cursor-pointer"
      >
        <Bot size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            drag
            dragMomentum={true}
            dragTransition={{ power: 0.2, timeConstant: 200 }}
            dragElastic={0.1}
            className="fixed bottom-24 right-8 z-40 w-80 glass-panel rounded-3xl overflow-hidden shadow-2xl flex flex-col border-indigo-500/20 bg-slate-900/90 backdrop-blur-xl cursor-grab active:cursor-grabbing"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-indigo-500/10 select-none">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-indigo-400" />
                <span className="text-sm font-medium text-slate-200">Executive Coach</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                onPointerDown={(e) => e.stopPropagation()}
                className="text-slate-400 hover:text-slate-200 cursor-pointer p-1 rounded-lg hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <div 
              onPointerDown={(e) => e.stopPropagation()}
              className="flex-1 p-4 space-y-4 max-h-80 overflow-y-auto custom-scrollbar"
            >
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${msg.role === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'glass-panel border-white/5 text-slate-300 rounded-bl-none'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {input === '' && messages.length > 2 && messages.length % 2 !== 0 && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-2xl max-w-[85%] text-sm glass-panel border-white/5 text-slate-300 rounded-bl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75" />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              )}
            </div>

            <form 
              onSubmit={handleSend} 
              onPointerDown={(e) => e.stopPropagation()}
              className="p-3 border-t border-white/10 bg-black/20"
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask for focus insights..."
                  className="w-full bg-transparent border border-white/10 rounded-xl py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 text-slate-200 transition-all"
                />
                <button type="submit" className="absolute right-2 text-indigo-400 hover:text-indigo-300 p-1 cursor-pointer">
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
