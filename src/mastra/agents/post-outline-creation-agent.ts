import { Agent } from "@mastra/core/agent";
import { memory } from "./memory";

export const postOutlineCreationAgent = new Agent({
  id: "post-outline-creation-agent",
  name: "Post Outline Creation Agent",
  instructions: `

`,
  model: "openai/gpt-5.1",
  memory,
});
