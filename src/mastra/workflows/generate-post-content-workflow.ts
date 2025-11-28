import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { userPostPrompt } from "../prompts/user-post-prompt";
import { postGuardPrompt } from "../prompts/post-guard-prompt";

const generatePostContent = createStep({
  id: "generate-post-content",
  description: "Generates post content from agent's knowledge base",
  inputSchema: z.object({
    outline: z.string(),
    score: z.number().optional().default(0),
  }),
  outputSchema: z.object({
    post: z.string(),
    score: z.number(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgentById("post-generator-agent");

    const result = await agent.generate(userPostPrompt(inputData.outline));

    return { post: result.text, score: inputData.score ?? 0 };
  },
});

const postGuard = createStep({
  id: "post-guard",
  description: "Guards post content from agent's knowledge base",
  inputSchema: z.object({
    post: z.string(),
    score: z.number(),
  }),
  outputSchema: z.object({
    post: z.string(),
    score: z.number(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgentById("post-guard-agent");

    const result = await agent.generate(postGuardPrompt(inputData.post));

    return { post: result.text, score: inputData.score };
  },
});

const generatePostContentWorkflow = createWorkflow({
  id: "generate-post-content-workflow",
  inputSchema: z.object({
    outline: z.string(),
    score: z.number().optional().default(0),
  }),
  outputSchema: z.object({
    post: z.string(),
    score: z.number(),
  }),
})
  .then(generatePostContent)
  .then(postGuard);

generatePostContentWorkflow.commit();

export { generatePostContentWorkflow };
