import { userCtx } from "./user-ctx";

const scoreReasoningPrompt = (score: number, scoreReasoning: string) => `
## Score

The content score is ${score} and should be as close to 1 as possible.

The score reasoning is:
${scoreReasoning}
`;

export const userPostPrompt = (
  outline: string,
  score: number,
  scoreThreshold: number,
  scoreReasoning: string
) => `
${userCtx}

${score > 0 && score < scoreThreshold ? scoreReasoningPrompt(score, scoreReasoning) : ""}

## 🎯 Your Job
Using the outline I provide:
- Expand it into a polished, engaging LinkedIn post
- Keep the flow natural and human
- Emphasize clarity over complexity
- Showcase expertise through simple, concrete phrasing
- Respect the structure and intention of the outline
- Produce the final post with no commentary or extra sections

---

## 🔽 Input You Will Receive
- **outline:** the full LinkedIn post outline previously generated.

Wait for the outline.

Here is the outline:
${outline}
`;
