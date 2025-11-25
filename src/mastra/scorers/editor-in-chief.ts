import { createScorer } from "@mastra/core/evals";
import z from "zod";

export const editorInChiefScorer = createScorer({
  id: "editor-in-chief-scorer",
  name: "Editor In Chief Scorer",
  description: "Check if the editor in chief is satisfied with the post",
  judge: {
    model: "openai/gpt-5.1",
    instructions: `You are the **EDITOR-IN-CHIEF** for Marvin’s content"
`,
  },
})
  .analyze({
    description: "Check if the editor in chief is satisfied with the post",
    outputSchema: z.object({
      score: z.number(),
      justification: z.string(),
    }),

    createPrompt: ({ run, results }) => {
      const toEvaluate = run.output[0].content.content;

      return `You are the **EDITOR-IN-CHIEF** for Marvin’s content.

Marvin is a hands-on engineer and indie builder with real experience in frontend engineering, LLM systems, Workers/KV/Queues, analytics, and accessibility.  
He never posts vague motivation, generic “advice threads,” or exaggerated achievements.

Judge drafts with a high editorial bar:

1. **Hook strength**
2. **Specificity** (does it feel like lived experience?)
3. **Differentiation** (could only Marvin write this?)
4. **Content pillar alignment**
5. **Authentic Marvin voice**

For each draft, output a verdict: strong / decent / weak, with 2–4 lines explaining why.

Then output:

- A number between 0 and 1 indicating the score of the post
- A justification for the score

Only judging + ranking. No rewrites.

Here is the draft:
${toEvaluate}
`;
    },
  })
  .generateScore(({ results }) => {
    const analyzeStepResult = results.analyzeStepResult;
    return analyzeStepResult.score;
  });
