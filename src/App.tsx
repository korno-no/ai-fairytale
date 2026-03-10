
import { useEffect, useRef } from 'react'
import styles from './App.module.css'
import { StoryCanvas } from './components/StoryCanvas'
import { StoryInput } from './components/StoryInput'
import { useStoryStore } from './store/storyStore'

export default function App() {
  const storyTurnCount = useStoryStore((state) => state.story.turns.length)
  const scrollRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return
    el.scrollTo({
      top: el.scrollHeight,
      behavior: 'smooth',
    })
  }, [storyTurnCount])

  return (
    <main className={styles.appRoot}>
      <div className={styles.appContainer}>
        <h1 className={styles.appTitle}>AI Fairy Tale</h1>
        <section ref={scrollRef} className={styles.storyArea}>
          <StoryCanvas />
        </section>
        <footer className={styles.inputArea}>
          <StoryInput />
        </footer>
      </div>
    </main>
  )
}

