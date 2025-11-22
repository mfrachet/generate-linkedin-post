import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

const generatePostTitles = createStep({
  id: "generate-post-titles",
  description: "Generates post titles from agent's knowledge base",
  inputSchema: z.object({
    count: z.number().describe("Number of posts to generate"),
  }),
  outputSchema: z.object({
    titles: z.array(z.string()),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgentById("post-generator-agent");
    const result = await agent.generate(
      `Based on Marvin's knowledge, generate ${inputData.count} LinkedIn post summaries so that the next LLM can generate the post content. Must be in French`,
      {
        structuredOutput: {
          schema: z.object({
            titles: z.array(z.string()),
          }),
        },
      }
    );

    console.log(result.object);

    return result.object as unknown as { titles: string[] };
  },
});

const generatePostContent = createStep({
  id: "generate-post-content",
  description: "Generates post content from agent's knowledge base",
  inputSchema: z.object({
    titles: z.array(z.string()),
  }),
  outputSchema: z.object({
    content: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgentById("post-generator-agent");

    const promises = inputData.titles.map((title) =>
      agent.generate(
        `Generate a LinkedIn post based on the following details:

- **Topic:** ${title}  
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

    const formatted = results
      .map((result) => result.text)
      .join("\n\n\n -------------------\n\n\n");

    return { content: formatted };
  },
});

const postTitleGeneratorWorkflow = createWorkflow({
  id: "post-title-generator-workflow",
  inputSchema: z.object({
    count: z.number().describe("Number of posts to generate"),
  }),
  outputSchema: z.string(),
})
  .then(generatePostTitles)
  .then(generatePostContent);

postTitleGeneratorWorkflow.commit();

export { postTitleGeneratorWorkflow };
