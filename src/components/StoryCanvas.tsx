import { useStoryStore } from '../store/storyStore';

const getAuthorLabel = (author: 'user' | 'ai'): string =>
  author === 'user' ? 'User' : 'AI';

export function StoryCanvas() {
  const story = useStoryStore((state) => state.story);

  if (story.turns.length === 0) {
    return (
      <>
        <p>No story yet. Sffftart writing to begin the adventure.</p>
      </>
    );
  }

  return (
    <>
      {story.turns.map((turn) => (
        <article key={turn.id}>
          <header>
            <strong>{getAuthorLabel(turn.author)}</strong>
          </header>
          <p>{turn.text}</p>
        </article>
      ))}
    </>
  );
}

