import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { userPostPrompt } from "../prompts/user-post-prompt";

const generatePostContent = createStep({
  id: "generate-post-content",
  description: "Generates post content from agent's knowledge base",
  inputSchema: z.object({
    outline: z.string(),
  }),
  outputSchema: z.string(),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgentById("post-generator-agent");

    const result = await agent.generate(userPostPrompt(inputData.outline));

    return result.text;
  },
});

const postGuard = createStep({
  id: "post-guard",
  description: "Guards post content from agent's knowledge base",
  inputSchema: z.string(),
  outputSchema: z.string(),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgentById("post-guard-agent");

    const result = await agent.generate(
      `Review and ensure safety and clarity of the following post: ${inputData}`
    );

    return result.text;
  },
});

const generatePostContentWorkflow = createWorkflow({
  id: "generate-post-content-workflow",
  inputSchema: z.object({
    outline: z.string(),
  }),
  outputSchema: z.string(),
})
  .then(generatePostContent)
  .then(postGuard);

generatePostContentWorkflow.commit();

export { generatePostContentWorkflow };
