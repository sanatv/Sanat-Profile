'use client';

import { useRef, useEffect, useState } from 'react';
import { Send, User, Bot } from 'lucide-react';
import styles from './ChatInterface.module.css';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue || isLoading) return;
    
    // Natively append user message
    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: inputValue };
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
          <p className={styles.subtitle}>Ask about Sanat&apos;s AI enablement profile</p>
        </div>
      </div>
      
      <div className={styles.messagesContainer}>
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <Bot size={48} className={styles.emptyIcon} />
            <p>Hi! I&apos;m Sanat&apos;s AI Assistant.</p>
            <p style={{marginTop: '8px', fontSize: '0.9rem'}}>Try asking: &quot;How has he enabled agentic AI adoption?&quot;</p>
          </div>
        )}
        
        {messages.map((m) => (
          <div key={m.id} className={`${styles.messageWrapper} ${m.role === 'user' ? styles.user : styles.assistant}`}>
            <div className={styles.avatar}>
              {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div className={styles.messageContent}>
              <div className={styles.text}>{m.content}</div>
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
          placeholder="e.g. How does he fit AI enablement leadership?"
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
