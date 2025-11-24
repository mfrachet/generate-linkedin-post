import { LibSQLStore } from "@mastra/libsql";
import { Memory } from "@mastra/memory";

export const memory = new Memory({
  storage: new LibSQLStore({
    id: "memory-storage",
    url: "file:../mastra.db", // path is relative to the .mastra/output directory
  }),
});
