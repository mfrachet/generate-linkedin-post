import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { Observability } from "@mastra/observability";
import { postGeneratorWorkflow } from "./workflows/post-generator-workflow";
import { postGeneratorAgent } from "./agents/post-generator-agent";

import { postBriefGeneratorAgent } from "./agents/post-brief-generator-agent";
import { postOutlineCreationAgent } from "./agents/post-outline-creation-agent";
import { postGuardAgent } from "./agents/post-guard-agent";
import { editorInChiefScorer } from "./scorers/editor-in-chief";
import { generatePostContentWorkflow } from "./workflows/generate-post-content-workflow";
import { listIdeasAgent } from "./agents/list-ideas-agent";

export const mastra = new Mastra({
  workflows: { postGeneratorWorkflow, generatePostContentWorkflow },
  agents: {
    postBriefGeneratorAgent,
    postGeneratorAgent,
    postOutlineCreationAgent,
    postGuardAgent,
    listIdeasAgent,
  },
  scorers: { editorInChiefScorer },
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
