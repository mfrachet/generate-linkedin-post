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

const generatePostContent = createStep({
  id: "generate-post-content",
  description: "Generates post content from agent's knowledge base",
  inputSchema: z.object({
    briefs: z.array(z.string()),
  }),
  outputSchema: z.string(),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgentById("post-generator-agent");

    const promises = inputData.briefs.map((brief) =>
      agent.generate(
        `Generate a LinkedIn post based on the following details:

- **Brief:** ${brief}  
- **Goal of the post:** inspire, educate  
- **Target audience:** engineers, engineers managers, indie makers 
- **Call to action:** none, post is informative
- **Length:** 1000 characters max

Follow the tone and style defined in the system prompt.  
Avoid hashtags unless explicitly requested.
It MUST be in French.
Nested lists are prohibited: use only one level of list.`
      )
    );

    const results = await Promise.all(promises);

    return results
      .map((result) => result.text)
      .join("\n\n\n -------------------\n\n\n");
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
  .then(generatePostContent);

postGeneratorWorkflow.commit();

export { postGeneratorWorkflow };
