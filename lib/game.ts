import { problemMap, problems } from "./problems";
import { Difficulty, SessionQuestion } from "./types";

const SESSION_LENGTH = 10;
const difficultyPlan: Difficulty[] = [
  "hard",
  "hard",
  "hard",
  "hard",
  "hard",
  "hard",
  "hard",
  "hard",
  "hard",
  "hard",
];

function shuffle<T>(items: T[]): T[] {
  const clone = [...items];

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }

  return clone;
}

function pickByDifficulty(difficulty: Difficulty, usedIds: Set<string>) {
  const candidates = shuffle(
    problems.filter((problem) => problem.difficulty === difficulty && !usedIds.has(problem.id)),
  );

  const chosen = candidates[0];
  if (!chosen) {
    throw new Error(`No problem available for difficulty: ${difficulty}`);
  }

  usedIds.add(chosen.id);
  return chosen;
}

function buildOptions(problemId: string, distractorIds: string[]) {
  const distractors = distractorIds.slice(0, 3);
  if (distractors.length < 3) {
    throw new Error(`Problem ${problemId} does not have enough distractors`);
  }

  return shuffle([problemId, ...distractors]);
}

export function createSession(): SessionQuestion[] {
  const usedIds = new Set<string>();

  return difficultyPlan.slice(0, SESSION_LENGTH).map((difficulty) => {
    const problem = pickByDifficulty(difficulty, usedIds);

    return {
      problem,
      optionIds: buildOptions(problem.id, problem.distractor_ids),
    };
  });
}

export function getProblem(problemId: string) {
  const problem = problemMap.get(problemId);
  if (!problem) {
    throw new Error(`Unknown problem: ${problemId}`);
  }

  return problem;
}
