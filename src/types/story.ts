export type StoryId = string;
export type StoryTurnId = string;
export type PlotChoiceId = string;

export type TurnAuthor = 'user' | 'ai';

export type PlotChoice = {
  id: PlotChoiceId;
  text: string;
};

/**
 * A single paragraph/turn in the story. Plot choices are optional and typically
 * appear on an AI turn (e.g. every N turns).
 */
export type StoryTurn = {
  id: StoryTurnId;
  author: TurnAuthor;
  text: string;

  /**
   * Unix timestamp (ms) when the turn was created.
   */
  createdAt: number;

  /**
   * Optional plot choices suggested by the AI for the user to pick from.
   */
  plotChoices?: PlotChoice[];

  /**
   * If plot choices exist, this records which choice the user selected (if any).
   */
  selectedPlotChoiceId?: PlotChoiceId;
};

/**
 * Persistable story container state (e.g. for Zustand + localStorage).
 * UI-specific state (loading flags, draft input) should typically live elsewhere.
 */
export type StoryState = {
  id: StoryId;
  turns: StoryTurn[];

  /**
   * Unix timestamps (ms) for bookkeeping/persistence.
   */
  createdAt: number;
  updatedAt: number;
};

