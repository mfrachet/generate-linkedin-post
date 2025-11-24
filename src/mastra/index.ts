import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { Observability } from "@mastra/observability";
import { postGeneratorWorkflow } from "./workflows/post-generator-workflow";
import { postGeneratorAgent } from "./agents/post-generator-agent";
import { postGeneratorFaithfulnessScorer } from "./scorers/post-generator-scorer";
import { postBriefGeneratorAgent } from "./agents/post-brief-generator-agent";
import { postOutlineCreationAgent } from "./agents/post-outline-creation-agent";

export const mastra = new Mastra({
  workflows: { postGeneratorWorkflow },
  agents: {
    postBriefGeneratorAgent,
    postGeneratorAgent,
    postOutlineCreationAgent,
  },
  scorers: { postGeneratorFaithfulnessScorer },
  storage: new LibSQLStore({
    id: "mastra-storage",
    // stores observability, scores, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
  observability: new Observability({
    // Enables DefaultExporter and CloudExporter for tracing
    default: { enabled: true },
  }),
});
