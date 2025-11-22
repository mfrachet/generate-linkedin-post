import { z } from "zod";

export const fileObjectSchema = z.object({
  fileName: z.string(),
  fullContent: z.string(),
  diff: z.string(),
});

export const commitObjectSchema = z.object({
  commitSha: z.string(),
  commitMessage: z.string(),
  files: z.array(fileObjectSchema),
});

export type FileObject = z.infer<typeof fileObjectSchema>;
export type CommitObject = z.infer<typeof commitObjectSchema>;
