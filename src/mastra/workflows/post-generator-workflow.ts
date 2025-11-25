import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

const generatePostIdea = createStep({
  id: "generate-post-idea",
  description: "Generates post idea from agent's knowledge base",
  inputSchema: z.object({
    count: z.number().describe("Number of posts to generate"),
  }),
  outputSchema: z.object({
    briefs: z.array(z.string()),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgentById("post-brief-generator-agent");
    const result = await agent.generate(
      `Generate ${inputData.count} LinkedIn post briefs based on your knowledge. Must be in French`,
      {
        structuredOutput: {
          schema: z.object({
            briefs: z.array(z.string()),
          }),
        },
      }
    );

    return result.object as unknown as { briefs: string[] };
  },
});

const generatePostOutline = createStep({
  id: "generate-post-outline",
  description: "Generates post outline from agent's knowledge base",
  inputSchema: z.object({
    briefs: z.array(z.string()),
  }),
  outputSchema: z.object({
    outlines: z.array(z.string()),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgentById("post-outline-creation-agent");

    const promises = inputData.briefs.map((brief) =>
      agent.generate(
        `Generate a LinkedIn post outline based on the following brief: ${brief}`
      )
    );

    const results = await Promise.all(promises);

    const outlines = results.map((result) => result.text);

    return { outlines };
  },
});

const generatePostContent = createStep({
  id: "generate-post-content",
  description: "Generates post content from agent's knowledge base",
  inputSchema: z.object({
    outlines: z.array(z.string()),
  }),
  outputSchema: z.string(),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgentById("post-generator-agent");

    const promises = inputData.outlines.map((outline) =>
      agent.generate(
        `Generate a LinkedIn post based on the following outline: ${outline}`
      )
    );

    const results = await Promise.all(promises);

    return results
      .map((result) => result.text)
      .join("\n\n\n -------------------\n\n\n");
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

// const githubRepoSummerizer = createStep({
//   id: "github-repo-summerizer",
//   description: "Summarizes a GitHub repository",
//   inputSchema: z.object({
//     count: z.number().describe("Number of posts to generate"),
//   }),
//   outputSchema: z.string(),
//   execute: async () => {
//     const result = await gitRepoSummerizer.execute({
//       repoOwner: "mastra-ai",
//       repoName: "mastra",
//       since: "3 weeks ago",
//     });

//     return result as string;
//   },
// });

const postGeneratorWorkflow = createWorkflow({
  id: "post-generator-workflow",
  inputSchema: z.object({
    count: z.number().describe("Number of posts to generate"),
  }),
  outputSchema: z.string(),
})
  .then(generatePostIdea)
  .then(generatePostOutline)
  .then(generatePostContent)
  .then(postGuard);

postGeneratorWorkflow.commit();

export { postGeneratorWorkflow };
