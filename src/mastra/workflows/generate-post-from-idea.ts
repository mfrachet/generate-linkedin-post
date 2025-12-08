import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { postGeneratorWorkflow } from "./post-generator-workflow";

const postGeneratorWorkflowStep = createStep(postGeneratorWorkflow);
const formatStep = createStep({
  id: "format-steps",
  description: "Formats the steps into a string",
  inputSchema: z.object({
    post: z.string(),
  }),
  outputSchema: z.string(),
  execute: async ({ inputData }) => {
    return inputData.post;
  },
});

const generatePostFromIdea = createWorkflow({
  id: "generate-post-from-idea-workflow",
  inputSchema: z.object({
    idea: z.string(),
  }),
  outputSchema: z.string(),
})
  .then(postGeneratorWorkflowStep)
  .then(formatStep);

generatePostFromIdea.commit();

export { generatePostFromIdea };
