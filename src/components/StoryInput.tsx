import { useEffect, useState } from 'react';
import { useStoryStore } from '../store/storyStore';
import { generateStoryResponse } from '../services/aiService';
import styles from './StoryInput.module.css';

export function StoryInput() {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const addTurn = useStoryStore((state) => state.addTurn);
  const setIsLoading = useStoryStore((state) => state.setIsLoading);
  const isLoading = useStoryStore((state) => state.isLoading);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setError(null);

    try {
      // Add user's turn
      addTurn({ author: 'user', text: trimmed });
      setText('');

      // Get the updated story from the store after adding the turn
      const updatedStory = useStoryStore.getState().story;

      // Set loading state and generate AI response
      setIsLoading(true);

      const aiResponse = await generateStoryResponse(updatedStory, trimmed);

      // Add AI's turn
      addTurn({
        author: 'ai',
        text: aiResponse.continuation,
        plotChoices: aiResponse.plotChoices,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate story response';
      setError(errorMessage);
      console.error('Error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!error) return;

    const timeoutId = setTimeout(() => {
      setError(null);
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [error]);

  const isDisabled = isLoading || text.trim().length === 0;

  return (
    <div className={styles.storyInput}>
      {error && <div className={styles.storyInputError}>{error}</div>}
      <textarea
        className={styles.storyInputTextarea}
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={4}
        placeholder="Write the next part of the fairy tale..."
        disabled={isLoading}
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isDisabled}
        className={styles.storyInputButton}
      >
        {isLoading ? 'Generating...' : 'Send prompt'}
      </button>
    </div>
  );
}
