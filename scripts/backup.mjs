import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const databasePath = path.resolve(process.cwd(), process.env.DATABASE_PATH ?? path.join("data", "ateeq.sqlite"));
const uploadsPath = path.join(process.cwd(), "public", "uploads");
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const destination = path.join(process.cwd(), "data", "backups", stamp);

fs.mkdirSync(destination, { recursive: true });
const database = new DatabaseSync(databasePath);
database.exec("PRAGMA busy_timeout = 5000");
const snapshot = path.join(destination, "ateeq.sqlite").replaceAll("\\", "/");
database.exec(`VACUUM INTO '${snapshot.replaceAll("'", "''")}'`);
database.close();
if (fs.existsSync(uploadsPath)) {
  fs.cpSync(uploadsPath, path.join(destination, "uploads"), { recursive: true });
}
console.log(destination);
