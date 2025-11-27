import { userCtx } from "./user-ctx";

export const userPostPrompt = (outline: string) => `
${userCtx}

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
