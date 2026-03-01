import { useState } from 'react';
import type { TurnAuthor } from '../types/story';
import { useStoryStore } from '../store/storyStore';
import styles from './StoryInput.module.css';

export function StoryInput() {
  const [text, setText] = useState('');
  const [currentAuthor, setCurrentAuthor] = useState<TurnAuthor>('user');

  const addTurn = useStoryStore((state) => state.addTurn);
  const isLoading = useStoryStore((state) => state.isLoading);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    addTurn({ author: currentAuthor, text: trimmed });
    setText('');

    setCurrentAuthor((prev) => (prev === 'user' ? 'ai' : 'user'));
  };

  const isDisabled = isLoading || text.trim().length === 0;

  return (
    <div className={styles.storyInput}>
      <textarea
        className={styles.storyInputTextarea}
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={4}
        placeholder="Write the next part of the fairy tale..."
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isDisabled}
        className={styles.storyInputButton}
      >
        Send prompt
      </button>
    </div>
  );
}

