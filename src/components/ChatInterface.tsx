'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Send, User, Volume2, VolumeX, Mic } from 'lucide-react';
import AvatarBot, { type AvatarState } from '@/components/AvatarBot';
import styles from './ChatInterface.module.css';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

// Minimal Web Speech API typing (not in the standard DOM lib for webkit).
interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEventLike) => void;
  onend: () => void;
  onerror: (event: { error: string }) => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    SpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

const QUICK_PROMPTS = [
  'Walk me through his CPG, tech & automotive work',
  'What finance, FP&A & EPM platforms has he led?',
  'What CRM, commerce & supply chain systems?',
  'Show his quantified business impact',
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);
  const [voiceNote, setVoiceNote] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef('');
  const noteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashNote = useCallback((message: string) => {
    setVoiceNote(message);
    if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    noteTimerRef.current = setTimeout(() => setVoiceNote(''), 4000);
  }, []);

  // Avatar reacts to real audio when speaking, otherwise to the request lifecycle.
  const avatarState: AvatarState = isSpeaking
    ? 'speaking'
    : isLoading
      ? (isStreaming ? 'speaking' : 'thinking')
      : isListening
        ? 'thinking'
        : 'idle';

  // Feature-detect Web Speech APIs on the client.
  useEffect(() => {
    setTtsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    setSttSupported(
      typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
    );
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const clean = text.replace(/\s+/g, ' ').trim();
    if (!clean) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.02;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  // Stop speech if voice is toggled off.
  useEffect(() => {
    if (!voiceEnabled) stopSpeaking();
  }, [voiceEnabled, stopSpeaking]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    stopSpeaking();

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

      // Speak the finished answer aloud when voice is enabled.
      if (voiceEnabled) speak(assistantContent);
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

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;
    stopSpeaking();
    setVoiceNote('');

    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true; // live feedback so it doesn't feel dead
    recognition.continuous = true; // keep listening until the user stops it

    // Keep anything already typed, then append spoken words.
    finalTranscriptRef.current = inputValue ? `${inputValue.trim()} ` : '';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? '';
        if (result.isFinal) {
          finalTranscriptRef.current += `${transcript} `;
        } else {
          interim += transcript;
        }
      }
      setInputValue((finalTranscriptRef.current + interim).replace(/\s+/g, ' ').trim());
    };
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        flashNote('Microphone blocked — allow mic access in your browser, then try again.');
      } else if (event.error === 'no-speech') {
        flashNote("Didn't catch anything — tap the mic and speak.");
      } else if (event.error !== 'aborted') {
        flashNote('Voice input had a hiccup — please try again.');
      }
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const lastMessage = messages[messages.length - 1];

  return (
    <div className={`glass-panel ${styles.chatContainer}`}>
      <div className={styles.chatHeader}>
        <div className={styles.headerRow}>
          <AvatarBot state={avatarState} size={52} />
          <div>
            <h2 className="text-gradient">AI Recruiter Assistant</h2>
            <p className={styles.subtitle}>Ask by text or voice about Sanat&apos;s profile</p>
          </div>
          {ttsSupported && (
            <button
              type="button"
              onClick={() => setVoiceEnabled((value) => !value)}
              className={`${styles.voiceToggle} ${voiceEnabled ? styles.voiceOn : ''}`}
              title={voiceEnabled ? 'Voice replies on — click to mute' : 'Enable spoken replies'}
              aria-pressed={voiceEnabled}
            >
              {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              <span>{voiceEnabled ? 'Voice on' : 'Voice off'}</span>
            </button>
          )}
        </div>
      </div>

      <div className={styles.messagesContainer}>
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <AvatarBot state={avatarState} size={88} />
            <p>Hi! I&apos;m Sanat&apos;s AI Assistant.</p>
            <p style={{marginTop: '8px', fontSize: '0.9rem'}}>
              {sttSupported ? 'Tap a question, type, or use the mic:' : 'Tap a question or ask your own:'}
            </p>
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
              <AvatarBot state={m.id === lastMessage?.id ? avatarState : 'idle'} size={36} />
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
        {sttSupported && (
          <button
            type="button"
            onClick={toggleListening}
            className={`${styles.micBtn} ${isListening ? styles.micActive : ''}`}
            title={isListening ? 'Listening… click to stop' : 'Ask by voice'}
            aria-pressed={isListening}
          >
            <Mic size={18} />
          </button>
        )}
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isListening ? 'Listening…' : 'Type or speak your question'}
          className={styles.input}
          disabled={isLoading}
        />
        <button type="submit" disabled={!inputValue || isLoading} className={styles.sendBtn}>
          <Send size={18} />
        </button>
      </form>
      {(isListening || voiceNote) && (
        <p className={styles.voiceNote} role="status">
          {isListening ? 'Listening… speak now, then tap the mic to stop.' : voiceNote}
        </p>
      )}
    </div>
  );
}
