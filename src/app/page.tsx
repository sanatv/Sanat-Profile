import ChatInterface from '@/components/ChatInterface';
import BentoGrid from '@/components/BentoGrid';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className="text-gradient">Sanat Vats</h1>
        <p>Strategic Data & AI Executive</p>
      </header>
      
      <div className={styles.bentoSection}>
        <BentoGrid />
      </div>

      <div className={styles.chatSection}>
        <ChatInterface />
      </div>
    </main>
  );
}
