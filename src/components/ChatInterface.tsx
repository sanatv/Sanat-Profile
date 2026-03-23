'use client';

import { useRef, useEffect, useState } from 'react';
import { Send, User, Bot, Volume2 } from 'lucide-react';
import styles from './ChatInterface.module.css';

export default function ChatInterface() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => (v.name.includes('Google') || v.name.includes('Siri')) && v.lang.includes('en-US')) 
                          || voices.find(v => v.lang.includes('en-US')) 
                          || null;
                          
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue || isLoading) return;
    
    // Natively append user message
    const userMessage = { id: Date.now().toString(), role: 'user', content: inputValue };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      let assistantContent = '';
      const assistantId = (Date.now() + 1).toString();

      // Immediately append an empty assistant message proxy
      setMessages([...newMessages, { id: assistantId, role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        assistantContent += decoder.decode(value, { stream: true });
        // Update the assistant message natively with the new streaming chunk
        setMessages([...newMessages, { id: assistantId, role: 'assistant', content: assistantContent }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`glass-panel ${styles.chatContainer}`}>
      <div className={styles.chatHeader}>
        <div>
          <h2 className="text-gradient">AI Recruiter Assistant</h2>
          <p className={styles.subtitle}>Ask me anything about Sanat's profile</p>
        </div>
      </div>
      
      <div className={styles.messagesContainer}>
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <Bot size={48} className={styles.emptyIcon} />
            <p>Hi! I'm Sanat's AI Assistant.</p>
            <p style={{marginTop: '8px', fontSize: '0.9rem'}}>Try asking: "What was his impact at EY?"</p>
          </div>
        )}
        
        {messages.map((m: any) => (
          <div key={m.id} className={`${styles.messageWrapper} ${m.role === 'user' ? styles.user : styles.assistant}`}>
            <div className={styles.avatar}>
              {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div className={styles.messageContent}>
              <div className={styles.text}>{m.content}</div>
              {m.role === 'assistant' && !isLoading && (
                <button 
                  onClick={() => speak(m.content)}
                  className={styles.speakBtn}
                  title="Read aloud"
                >
                  <Volume2 size={14} /> Listen
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.messageWrapper} ${styles.assistant}`}>
            <div className={styles.avatar}><Bot size={18} /></div>
            <div className={styles.typingIndicator}>
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={onSubmit} className={styles.inputArea}>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="e.g. Tell me about his experience at EY..."
          className={styles.input}
          disabled={isLoading}
        />
        <button type="submit" disabled={!inputValue || isLoading} className={styles.sendBtn}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
