import { create } from 'zustand';
import type {
  PlotChoice,
  StoryState,
  StoryTurn,
  StoryTurnId,
  TurnAuthor,
} from '../types/story';

type StoryStore = {
  story: StoryState;
  isLoading: boolean;
  addTurn: (input: { author: TurnAuthor; text: string; plotChoices?: PlotChoice[] }) => void;
  setIsLoading: (value: boolean) => void;
  setPlotChoicesForTurn: (turnId: StoryTurnId, plotChoices: PlotChoice[]) => void;
  resetStory: () => void;
};

const createInitialStory = (): StoryState => {
  const now = Date.now();

  return {
    id: crypto.randomUUID(),
    turns: [],
    createdAt: now,
    updatedAt: now,
  };
};

export const useStoryStore = create<StoryStore>((set) => ({
  story: createInitialStory(),
  isLoading: false,

  addTurn: ({ author, text, plotChoices }) =>
    set((state) => {
      const now = Date.now();

      const newTurn: StoryTurn = {
        id: crypto.randomUUID(),
        author,
        text,
        createdAt: now,
        ...(plotChoices ? { plotChoices } : {}),
      };

      return {
        story: {
          ...state.story,
          turns: [...state.story.turns, newTurn],
          updatedAt: now,
        },
      };
    }),

  setIsLoading: (value) => set({ isLoading: value }),

  setPlotChoicesForTurn: (turnId, plotChoices) =>
    set((state) => {
      const now = Date.now();

      const turns = state.story.turns.map((turn) =>
        turn.id === turnId ? { ...turn, plotChoices } : turn,
      );

      return {
        story: {
          ...state.story,
          turns,
          updatedAt: now,
        },
      };
    }),

  resetStory: () =>
    set({
      story: createInitialStory(),
      isLoading: false,
    }),
}));

