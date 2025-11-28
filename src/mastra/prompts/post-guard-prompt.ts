import { userCtx } from "./user-ctx";

const scoreReasoningPrompt = (score: number, scoreReasoning: string) => `
## Score

The content score is ${score} and should be as close to 1 as possible.

The score reasoning is:
${scoreReasoning}
`;

export const postGuardPrompt = (
  post: string,
  score: number,
  scoreThreshold: number,
  scoreReasoning: string
) => `
${userCtx}

${score < scoreThreshold ? scoreReasoningPrompt(score, scoreReasoning) : ""}

## Your job:
- Improve the content only where needed
- Keep the meaning identical
- Preserve my voice
- Return ONLY the final improved LinkedIn post content

Here is the content to review:
${post}
`;
