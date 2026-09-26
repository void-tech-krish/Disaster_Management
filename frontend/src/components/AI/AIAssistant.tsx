import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'ai', text: 'Hello! I am DisasterGuard AI, your disaster preparedness assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chat', { 
        message: text,
        context: {
          location: { city: 'Vijayawada', state: 'Andhra Pradesh' }, // Dummy context for now
          weather: { condition: 'Partly Cloudy', temperature: 31 },
          risks: []
        }
      });
      
      const aiMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        sender: 'ai', 
        text: response.data.answer 
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        sender: 'ai', 
        text: 'AI assistant is temporarily unavailable. Your risk and weather information are still available.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "What's my current risk?",
    "What should my family prepare?",
    "Explain today's weather"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-dg-primary hover:bg-orange-600 text-white rounded-full p-4 shadow-lg flex items-center justify-center font-bold transition-transform hover:scale-105"
        >
          <span className="text-2xl mr-2">🤖</span> AI Assistant
        </button>
      )}

      {isOpen && (
        <div className="bg-dg-surface w-80 sm:w-96 rounded-[18px] shadow-2xl border border-dg-border flex flex-col h-[500px] overflow-hidden">
          {/* Header */}
          <div className="bg-dg-bg p-4 border-b border-dg-border flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-dg-navy flex items-center">
                <span className="text-xl mr-2">🤖</span> DisasterGuard AI
              </h3>
              <p className="text-[10px] font-bold text-dg-muted uppercase tracking-wider">AI-powered disaster assistant</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-dg-muted hover:text-dg-danger font-bold text-xl">
              &times;
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl p-3 text-sm font-medium ${msg.sender === 'user' ? 'bg-orange-100 text-dg-navy border border-orange-200' : 'bg-white text-dg-navy border border-dg-border shadow-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-dg-muted border border-dg-border shadow-sm rounded-xl p-3 text-xs font-bold animate-pulse">
                  AI is analyzing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-slate-50 border-t border-dg-border flex flex-wrap gap-2">
              {suggestedQuestions.map(q => (
                <button 
                  key={q} 
                  onClick={() => handleSend(q)}
                  className="bg-white border border-dg-border text-dg-primary text-[10px] font-bold px-2 py-1 rounded-md hover:bg-orange-50 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-dg-surface border-t border-dg-border">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your risk..."
                className="flex-1 bg-dg-bg border border-dg-border rounded-lg px-3 py-2 text-sm text-dg-navy focus:outline-none focus:border-dg-primary"
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-dg-primary text-white px-3 py-2 rounded-lg font-bold disabled:opacity-50 hover:bg-orange-600 transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
