import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { generatePostContentWorkflow } from "./generate-post-content-workflow";
import { userBriefPrompt } from "../prompts/user-brief-prompt";
import { userOutlinePrompt } from "../prompts/user-outline-prompt";
import { POST_SCORE_THRESHOLD } from "./constants";

const generatePostIdea = createStep({
  id: "generate-post-idea",
  description: "Generates post idea from agent's knowledge base",
  inputSchema: z.object({
    idea: z.string(),
  }),
  outputSchema: z.object({
    brief: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgentById("post-brief-generator-agent");
    const result = await agent.generate(userBriefPrompt(inputData.idea), {
      modelSettings: {
        temperature: 0,
      },
    });

    return { brief: result.text };
  },
});

const generatePostOutline = createStep({
  id: "generate-post-outline",
  description: "Generates post outline from agent's knowledge base",
  inputSchema: z.object({
    brief: z.string(),
  }),
  outputSchema: z.object({
    outline: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgentById("post-outline-creation-agent");
    const result = await agent.generate(userOutlinePrompt(inputData.brief), {
      modelSettings: {
        temperature: 0,
      },
    });

    return { outline: result.text };
  },
});

const postGeneratorWorkflow = createWorkflow({
  id: "post-generator-workflow",
  inputSchema: z.object({
    idea: z.string(),
  }),
  outputSchema: z.object({
    post: z.string(),
  }),
})
  .then(generatePostIdea)
  .then(generatePostOutline)
  .dountil(generatePostContentWorkflow, async ({ inputData: { score } }) => {
    console.log("score", score);
    return score >= POST_SCORE_THRESHOLD;
  })
  .map(async ({ inputData }) => inputData.post);

postGeneratorWorkflow.commit();

export { postGeneratorWorkflow };
