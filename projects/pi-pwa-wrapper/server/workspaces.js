// server/workspaces.js — safe workspace discovery under a single root
import { promises as fs } from "node:fs";
import path from "node:path";

/** Expand a root for workspace browsing. Defaults to the server cwd. */
export function workspaceRoot() {
  const root = path.resolve(process.env.PI_PWA_ROOT || process.cwd());
  return root;
}

/** Ensure a candidate path stays inside the root (symlink-safe enough for a dev tool). */
export function resolveInsideRoot(root, candidate) {
  const resolved = path.resolve(root, candidate);
  const rel = path.relative(root, resolved);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    const err = new Error(`Path outside workspace root (${root})`);
    err.code = "OUTSIDE_ROOT";
    throw err;
  }
  return resolved;
}

/** List the root itself plus immediate subdirectories (1 level deep is plenty). */
export async function listWorkspaces(root) {
  const entries = [];
  let rootInfo;
  try {
    rootInfo = await fs.stat(root);
  } catch {
    throw new Error(`Workspace root does not exist: ${root}`);
  }
  if (rootInfo.isDirectory()) {
    entries.push({ name: path.basename(root) || root, path: root, isRoot: true });
  }
  let children = [];
  try {
    children = await fs.readdir(root, { withFileTypes: true });
  } catch {
    /* unreadable root */
  }
  for (const ent of children) {
    if (ent.name.startsWith(".")) continue;
    if (ent.name === "node_modules") continue;
    if (!ent.isDirectory()) continue;
    const full = path.join(root, ent.name);
    try {
      const st = await fs.stat(full);
      if (st.isDirectory()) {
        entries.push({ name: ent.name, path: full, isRoot: false });
      }
    } catch {
      /* skip */
    }
  }
  return entries;
}
