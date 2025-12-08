import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { listIdeaPrompt } from "../prompts/list-idea-prompt";
import { postGeneratorWorkflow } from "./post-generator-workflow";

const generateNIdeas = createStep({
  id: "generate-n-ideas",
  description: "Generates n ideas from agent's knowledge base",
  inputSchema: z.object({
    count: z.number().default(5),
    language: z.string().default("french"),
  }),
  outputSchema: z.object({
    ideas: z.array(z.string()),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgentById("list-ideas-agent");
    const result = await agent.generate(
      listIdeaPrompt(inputData.count, inputData.language),
      {
        modelSettings: {
          temperature: 0,
        },
        structuredOutput: {
          schema: z.object({
            ideas: z.array(z.string()),
          }),
        },
      }
    );

    return { ideas: result.object.ideas };
  },
});

const postGeneratorWorkflowStep = createStep(postGeneratorWorkflow);
const formatSteps = createStep({
  id: "format-steps",
  description: "Formats the steps into a string",
  inputSchema: z.array(
    z.object({
      post: z.string(),
    })
  ),
  outputSchema: z.string(),
  execute: async ({ inputData }) => {
    return inputData
      .map(
        ({ post }, index) => `Idea ${index + 1}:

${post}\n\n--------------------------------`
      )
      .join("\n\n");
  },
});

const generateNIdeasWorkflow = createWorkflow({
  id: "generate-n-ideas-workflow",
  inputSchema: z.object({
    count: z.number().default(5),
    language: z.string().default("french"),
  }),
  outputSchema: z.string(),
})
  .then(generateNIdeas)
  .map(async ({ inputData }) => inputData.ideas.map((idea) => ({ idea })))
  .foreach(postGeneratorWorkflowStep)
  .then(formatSteps);

generateNIdeasWorkflow.commit();

export { generateNIdeasWorkflow };
