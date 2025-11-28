import { userCtx } from "./user-ctx";

export const postGuardPrompt = (post: string) => `
${userCtx}



## Your job:
- Improve the content only where needed
- Keep the meaning identical
- Preserve my voice
- Return ONLY the final improved LinkedIn post content

Here is the content to review:
${post}
`;
