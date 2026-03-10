import { useEffect, useState } from 'react';
import { useStoryStore } from '../store/storyStore';
import { generateStoryResponse } from '../services/aiService';
import styles from './StoryCanvas.module.css';

const getAuthorLabel = (author: 'user' | 'ai'): string =>
  author === 'user' ? 'User' : 'AI';

export function StoryCanvas() {
  const [error, setError] = useState<string | null>(null);

  const story = useStoryStore((state) => state.story);
  const addTurn = useStoryStore((state) => state.addTurn);
  const setIsLoading = useStoryStore((state) => state.setIsLoading);
  const isLoading = useStoryStore((state) => state.isLoading);

  useEffect(() => {
    if (!error) return;

    const timeoutId = setTimeout(() => {
      setError(null);
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [error]);

  const loadingOverlay = isLoading ? (
    <div className={styles.loadingOverlay}>
      <div className={styles.moonSpinner} />
      <p className={styles.loadingText}>Weaving the next chapter...</p>
    </div>
  ) : null;

  const handlePlotChoice = async (choiceText: string) => {
    if (isLoading) return;

    setError(null);

    try {
      // Add user's choice as a turn
      addTurn({ author: 'user', text: choiceText });

      // Get the updated story from the store after adding the turn
      const updatedStory = useStoryStore.getState().story;

      // Set loading state and generate AI response
      setIsLoading(true);

      const aiResponse = await generateStoryResponse(updatedStory, choiceText);

      // Add AI's turn with plot choices
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

  if (story.turns.length === 0) {
    return (
      <div className={styles.canvasRoot}>
        {loadingOverlay}
        <p>No story yet. Start writing to begin the adventure.</p>
      </div>
    );
  }

  return (
    <div className={styles.canvasRoot}>
      {error && <div className={styles.storyError}>{error}</div>}
      {story.turns.map((turn, index) => {
        const isLastTurn = index === story.turns.length - 1;
        const shouldShowChoices =
          turn.plotChoices &&
          turn.plotChoices.length > 0 &&
          isLastTurn;

        const isUser = turn.author === 'user';

        return (
          <article
            key={turn.id}
            className={
              isUser ? styles.turnUser : styles.turnAi
            }
          >
            <header className={styles.turnHeader}>
              <strong>{getAuthorLabel(turn.author)}</strong>
            </header>
            <p className={styles.turnBubble}>{turn.text}</p>

            {shouldShowChoices && (
              <div className={styles.plotChoices}>
                <p className={styles.choicesLabel}>What happens next?</p>
                <div className={styles.choicesContainer}>
                  {turn.plotChoices?.map((choice) => (
                    <button
                      key={choice.id}
                      className={styles.choiceButton}
                      onClick={() => handlePlotChoice(choice.text)}
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </article>
        );
      })}
      {loadingOverlay}
    </div>
  );
}

