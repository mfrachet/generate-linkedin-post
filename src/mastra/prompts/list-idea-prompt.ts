import { userCtx } from "./user-ctx";

export const listIdeaPrompt = (count: number) => `
${userCtx}

## What You Receive
You will receive:
- **count** → the number of ideas I want
- *(optional)* **tone** → the tone to reflect  
- *(optional)* **expertise** → additional context or domain depth

## What You Must Do
- Generate exactly **N** high‑quality, LinkedIn‑ready post ideas.
- Align the ideas with:
  - the topic from the user's context,
  - my personal tone and style already known in the system,
  - my domain expertise already known in the system.
- Keep the ideas diverse, actionable, and high‑signal.
- Do **not** write full posts.
- Do **not** add commentary.

## Output Format
Return the ideas as:

\`\`\`
### LinkedIn Post Ideas

1. ...
2. ...
3. ...
\`\`\`


Here is the number of ideas I want:
${count}
`;
