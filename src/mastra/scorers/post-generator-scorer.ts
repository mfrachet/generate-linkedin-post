import { createFaithfulnessScorer } from "@mastra/evals/scorers/prebuilt";

export const postGeneratorFaithfulnessScorer = createFaithfulnessScorer({
  model: {
    id: "openai/gpt-5.1",
  },
});
