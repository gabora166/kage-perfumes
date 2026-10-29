import { spawn } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { acquireServerLock } from "./server-lock.mjs";

const command = process.argv[2];
if (command === "dev" || command === "start") {
  try {
    acquireServerLock();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const clientHook = pathToFileURL(path.join(process.cwd(), "lib", "security", "install-trusted-client.mjs")).href;
const child = spawn(
  process.execPath,
  ["--experimental-sqlite", "--import", clientHook, nextBin, ...process.argv.slice(2)],
  { stdio: "inherit", env: process.env },
);

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
