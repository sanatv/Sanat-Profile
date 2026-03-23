'use client';

import { useState, useRef } from 'react';
import { Play, Pause, Headphones } from 'lucide-react';
import styles from './PodcastPlayer.module.css';

export default function PodcastPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  // Optional: Update src to '/overview.wav' if they download typical .wav from NotebookLM
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={styles.playerContainer}>
      {/* 
        This loads the audio file from the /public folder of your site.
        Place your downloaded NotebookLM audio in the public folder and name it podcast.mp3!
      */}
      <audio 
        ref={audioRef} 
        src="/podcast.mp3" 
        onEnded={() => setIsPlaying(false)}
      />
      <div className={styles.header}>
        <div className={styles.iconContainer}>
          <Headphones size={18} className={styles.icon} />
        </div>
        <div className={styles.textContainer}>
          <h4 className={styles.title}>Deep Dive: Sanat's Profile</h4>
          <span className={styles.subtitle}>NotebookLM Audio Overview</span>
        </div>
      </div>
      <div className={styles.controls}>
        <button className={styles.playBtn} onClick={togglePlay}>
          {isPlaying ? <Pause size={18} /> : <Play size={18} className={styles.playIcon} />}
        </button>
        <div className={styles.waveform}>
          {[...Array(24)].map((_, i) => (
            <div 
              key={i} 
              className={`${styles.bar} ${isPlaying ? styles.playing : ''}`} 
              style={{ 
                animationDelay: `${i * 0.05}s`,
                height: `${Math.max(20, Math.random() * 100)}%`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
