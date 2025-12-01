import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { userPostPrompt } from "../prompts/user-post-prompt";
import { postGuardPrompt } from "../prompts/post-guard-prompt";
import { POST_SCORE_THRESHOLD } from "./constants";

const generatePostContent = createStep({
  id: "generate-post-content",
  description: "Generates post content from agent's knowledge base",
  inputSchema: z.object({
    outline: z.string(),
    score: z.number().optional().default(0),
    scoreReasoning: z.string().optional().default(""),
  }),
  outputSchema: z.object({
    outline: z.string(),
    post: z.string(),
    score: z.number(),
    scoreReasoning: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgentById("post-generator-agent");

    const prompt = userPostPrompt(
      inputData.outline,
      inputData.score,
      POST_SCORE_THRESHOLD,
      inputData.scoreReasoning
    );

    const result = await agent.generate(prompt, {
      modelSettings: {
        temperature: 0,
      },
    });

    return {
      post: result.text,
      score: inputData.score ?? 0,
      scoreReasoning: inputData.scoreReasoning ?? "",
      outline: inputData.outline,
    };
  },
});

const postGuard = createStep({
  id: "post-guard",
  description: "Guards post content from agent's knowledge base",
  inputSchema: z.object({
    outline: z.string(),
    post: z.string(),
    score: z.number(),
    scoreReasoning: z.string(),
  }),
  outputSchema: z.object({
    outline: z.string(),
    post: z.string(),
    score: z.number(),
    scoreReasoning: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgentById("post-guard-agent");
    const scorer = mastra.getScorerById("editor-in-chief-scorer");

    const result = await agent.generate(postGuardPrompt(inputData.post), {
      modelSettings: {
        temperature: 0,
      },
    });

    const newScore = await scorer.run({
      input: [{ role: "user", content: inputData.post }],
      output: { text: result },
    });

    const justification =
      (newScore.analyzeStepResult as unknown as { justification: string })
        ?.justification ?? "";

    console.log("justification", justification);

    return {
      post: result.text,
      score: newScore.score as number,
      scoreReasoning: justification,
      outline: inputData.outline,
    };
  },
});

const generatePostContentWorkflow = createWorkflow({
  id: "generate-post-content-workflow",
  inputSchema: z.object({
    outline: z.string(),
    score: z.number().optional().default(0),
    scoreReasoning: z.string().optional().default(""),
  }),
  outputSchema: z.object({
    outline: z.string(),
    post: z.string(),
    score: z.number(),
  }),
})
  .then(generatePostContent)
  .then(postGuard);

generatePostContentWorkflow.commit();

export { generatePostContentWorkflow };
