import fs from "node:fs";
import path from "node:path";

const lockFileName = "ateeq.server.lock";

export function decideLock(existingPid, isAlive, currentPid) {
  if (existingPid === null) return "acquire";
  if (existingPid === currentPid) return "keep";
  if (!isAlive) return "replace";
  return "busy";
}

export function isProcessAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code !== "ESRCH";
  }
}

export function acquireServerLock() {
  const directory = path.join(process.cwd(), "data");
  fs.mkdirSync(directory, { recursive: true });
  const filePath = path.join(directory, lockFileName);
  const payload = `${process.pid}\n`;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (createLock(filePath, payload)) {
      registerRelease(filePath);
      return;
    }
    const existing = readLock(filePath);
    const decision = decideLock(existing, existing !== null && isProcessAlive(existing), process.pid);
    if (decision === "keep") {
      registerRelease(filePath);
      return;
    }
    if (decision === "busy") {
      throw new Error(
        `Another ateeqperfumes server is already running (pid ${existing}). Stop it before starting another one. SQLite WAL mode is only safe with a single server process.`,
      );
    }
    try {
      fs.unlinkSync(filePath);
    } catch {
      // Another start replaced the stale lock.
    }
  }
  throw new Error("Could not acquire the SQLite server lock.");
}

function createLock(filePath, payload) {
  let fd;
  try {
    fd = fs.openSync(filePath, "wx");
  } catch (error) {
    if (error?.code === "EEXIST") return false;
    throw error;
  }
  fs.writeFileSync(fd, payload);
  fs.closeSync(fd);
  return true;
}

function readLock(filePath) {
  try {
    const pid = Number(fs.readFileSync(filePath, "utf8").trim());
    if (!Number.isInteger(pid) || pid <= 0) return null;
    return pid;
  } catch {
    return null;
  }
}

let releaseRegistered = false;

function registerRelease(filePath) {
  if (releaseRegistered) return;
  releaseRegistered = true;
  const release = () => {
    try {
      if (readLock(filePath) === process.pid) fs.unlinkSync(filePath);
    } catch {
      // The lock is already gone.
    }
  };
  process.once("exit", release);
}
