import { userCtx } from "./user-ctx";

export const userBriefPrompt = (idea: string) => `
${userCtx}

## 🧩 What You Will Receive
You will receive:

- **idea:** a vague concept, rough thought, or seed of a post.

You will transform it into a **structured LinkedIn Post Brief** following the system prompt.

---

## 🎯 Your Job
- Adapt everything to my tone.
- Leverage my expertise naturally.
- Highlight what makes my perspective unique.
- Avoid clichés. Avoid generic advice.
- Produce a brief that makes writing the final post effortless.

---

Here is the idea:
${idea}
`;
