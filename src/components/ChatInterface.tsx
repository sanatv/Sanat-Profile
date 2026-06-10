'use client';

import { useRef, useEffect, useState } from 'react';
import { Send, User } from 'lucide-react';
import AvatarBot, { type AvatarState } from '@/components/AvatarBot';
import styles from './ChatInterface.module.css';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const QUICK_PROMPTS = [
  'How has he enabled agentic AI adoption?',
  'What is his AI-native toolchain — MCP, Claude Code, Cursor?',
  'Show quantified business impact',
  'How does he fit an AI enablement leadership role?',
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const avatarState: AvatarState = isLoading ? (isStreaming ? 'speaking' : 'thinking') : 'idle';

  // Auto scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Natively append user message
    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: text };
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

        setIsStreaming(true);
        assistantContent += decoder.decode(value, { stream: true });
        // Update the assistant message natively with the new streaming chunk
        setMessages([...newMessages, { id: assistantId, role: 'assistant', content: assistantContent }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(inputValue);
  };

  const lastMessage = messages[messages.length - 1];

  return (
    <div className={`glass-panel ${styles.chatContainer}`}>
      <div className={styles.chatHeader}>
        <div className={styles.headerRow}>
          <AvatarBot state={avatarState} size={52} />
          <div>
            <h2 className="text-gradient">AI Recruiter Assistant</h2>
            <p className={styles.subtitle}>Ask about Sanat&apos;s AI enablement profile</p>
          </div>
        </div>
      </div>

      <div className={styles.messagesContainer}>
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <AvatarBot state="idle" size={88} />
            <p>Hi! I&apos;m Sanat&apos;s AI Assistant.</p>
            <p style={{marginTop: '8px', fontSize: '0.9rem'}}>Tap a question or ask your own:</p>
            <div className={styles.quickPrompts}>
              {QUICK_PROMPTS.map((prompt) => (
                <button key={prompt} type="button" onClick={() => sendMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`${styles.messageWrapper} ${m.role === 'user' ? styles.user : styles.assistant}`}>
            {m.role === 'user' ? (
              <div className={styles.avatar}>
                <User size={18} />
              </div>
            ) : (
              <AvatarBot state={isLoading && m.id === lastMessage?.id ? avatarState : 'idle'} size={36} />
            )}
            <div className={styles.messageContent}>
              <div className={styles.text}>{m.content}</div>
            </div>
          </div>
        ))}
        {isLoading && !isStreaming && (
          <div className={`${styles.messageWrapper} ${styles.assistant}`}>
            <AvatarBot state="thinking" size={36} />
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
