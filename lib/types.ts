export type Difficulty = "easy" | "medium" | "hard";

export type Problem = {
  id: string;
  category: string;
  difficulty: Difficulty;
  formula_latex: string;
  formula_python: string;
  explanation: string;
  x_range: [number, number];
  y_range: [number, number];
  sample_ranges: [number, number][];
  distractor_ids: string[];
};

export type SessionQuestion = {
  problem: Problem;
  optionIds: string[];
};
