import problemBank from "../data/problems.json";
import { Problem } from "./types";

export const problems = problemBank as Problem[];

export const problemMap = new Map(problems.map((problem) => [problem.id, problem]));
