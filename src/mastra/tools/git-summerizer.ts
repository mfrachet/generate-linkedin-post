import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import path from "node:path";
import { CommitObject } from "./types";
import simpleGit from "simple-git";
import fs from "node:fs";
import { mastra } from "..";

export const gitRepoSummerizer = createTool({
  id: "Git Repo Summerizer",
  inputSchema: z.object({
    username: z.string(),
    repoOwner: z.string(),
    repoName: z.string(),
    since: z.string().describe("Iso string date"),
  }),
  outputSchema: z.string(),
  description: `Fetches the commits by a given user since a given date`,
  execute: async (args) => {
    console.log(args);
    const { username, repoOwner, repoName, since } = args;
    const logger = mastra.getLogger();
    const git = simpleGit();

    logger.info(`[${repoName}] Cloning shallow repo...`);

    const cloneDir = path.join(".", `repo-${Date.now()}`);

    const USER = username;
    const PASS = process.env.GITHUB_TOKEN;
    const REPO = `github.com/${repoOwner}/${repoName}.git`;

    const repoUrl = `https://${USER}:${PASS}@${REPO}`;
    await git.clone(repoUrl, cloneDir, ["--depth=1000"]);

    const repoGit = simpleGit(cloneDir);
    // const since = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();

    logger.info(`[${repoName}] Getting commits by ${username} since ${since}`);

    const log = await repoGit.log({
      "--since": since,
      "--author": username,
    });

    if (!log.all.length) {
      logger.info(`[${repoName}] No recent commits by author.`);
      return "No recent commits by author.";
    }

    const formattedCommits: Array<CommitObject> = [];

    for (const commit of log.all) {
      const sha = commit.hash;
      logger.info(`[${repoName}] 🔹 Commit: ${sha}`);
      logger.info(`[${repoName}] Message: ${commit.message}`);

      const fileListRaw = await repoGit.show([
        sha,
        "--name-only",
        "--pretty=format:",
      ]);

      const filePaths = fileListRaw
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const commitObject: CommitObject = {
        commitSha: sha,
        commitMessage: commit.message,
        files: [],
      };

      for (const file of filePaths) {
        if (file.endsWith("lock.yaml")) {
          continue;
        }

        let fullContent = "";
        let diff = "";

        try {
          fullContent = await repoGit.show([`${sha}:${file}`]);
        } catch (e) {
          fullContent = "[Could not retrieve file content — maybe deleted?]";
        }

        try {
          diff = await repoGit.diff([`${sha}^`, sha, "--", file]);
        } catch (e) {
          diff = "[Could not generate diff]";
        }

        commitObject.files.push({
          fileName: file,
          fullContent,
          diff,
        });
      }

      formattedCommits.push(commitObject);
    }

    const summaryOfChanges = formattedCommits
      .map((commit) => {
        return `### ${commit.commitMessage} (${commit.commitSha})
#### Files before changes:

${commit.files
  .map(
    (file) => `##### ${file.fileName}
\`\`\`
${file.fullContent}
\`\`\`
          `
  )
  .join("\n\n")}

#### Files diff:

${commit.files
  .map(
    (file) => `##### ${file.fileName} (with diffs)
\`\`\`diff
${file.diff}
\`\`\`
`
  )
  .join("\n\n")}
        `;
      })
      .join("\n\n");

    fs.rmSync(cloneDir, { recursive: true, force: true });

    return `## ${repoName}

${summaryOfChanges}
`;
  },
});
