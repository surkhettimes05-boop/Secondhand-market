import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { deploymentProblems } from "./deployment-config.mjs";
if (existsSync(".env.local")) loadEnvFile(".env.local");
const problems = deploymentProblems(process.env);
if (problems.length) {
  console.error("Deployment configuration failed:\n" + problems.map(problem => "- " + problem).join("\n"));
  process.exitCode = 1;
} else console.log("Deployment configuration passed (" + (process.env.MARKET_MODE || "preview") + ").");
