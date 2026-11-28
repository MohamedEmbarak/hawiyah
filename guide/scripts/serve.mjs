#!/usr/bin/env node
// Static server that behaves like GitHub Pages for a project site under a base path.
//
//   node scripts/serve.mjs [--dir dist/browser] [--base /hawiyah/] [--port 4300]
//
// GET only. Under the base it serves <dir>/<path>, then <dir>/<path>/index.html,
// answers a directory path without a trailing slash with 301 to the slash form,
// and otherwise answers 404 with the body of <dir>/404.html. Outside the base it
// answers 404 in plain text. Every response carries Access-Control-Allow-Origin: *.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".md": "text/markdown; charset=utf-8",
};

export function parseArgs(argv) {
  const options = { dir: "dist/browser", base: "/hawiyah/", port: 4300 };
  for (let i = 0; i < argv.length; i += 1) {
    const [flag, inline] = argv[i].split("=", 2);
    const value = inline ?? argv[++i];
    if (value === undefined) throw new Error(`${flag} needs a value`);
    if (flag === "--dir") options.dir = value;
    else if (flag === "--base") options.base = value;
    else if (flag === "--port") options.port = Number(value);
    else throw new Error(`unknown option ${flag}`);
  }
  if (!/^\/(?:[A-Za-z0-9._-]+\/)*$/.test(options.base)) throw new Error(`--base must start and end with / (got ${options.base})`);
  if (!Number.isInteger(options.port) || options.port <= 0 || options.port > 65535) throw new Error(`--port must be a port number`);
  return options;
}

const kind = async (path) => {
  try {
    const info = await stat(path);
    return info.isFile() ? "file" : info.isDirectory() ? "dir" : null;
  } catch {
    return null;
  }
};

/** Creates the server (not listening). */
export function createPagesServer({ dir, base }) {
  const root = resolve(dir);
  return createServer(async (request, response) => {
    const headers = { "access-control-allow-origin": "*" };
    const plain = (status, text, extra = {}) => {
      response.writeHead(status, { ...headers, "content-type": "text/plain; charset=utf-8", ...extra });
      response.end(text);
    };
    try {
      if (request.method !== "GET") return plain(405, "Method not allowed\n", { allow: "GET" });
      const url = new URL(request.url ?? "/", "http://localhost");
      let pathname;
      try {
        pathname = decodeURIComponent(url.pathname);
      } catch {
        return plain(400, "Bad request\n");
      }
      if (`${pathname}/` === base) return plain(301, "", { location: `${base}${url.search}` });
      if (!pathname.startsWith(base)) return plain(404, "Not found\n");
      const relative = pathname.slice(base.length);
      const target = resolve(root, relative);
      if (target !== root && !target.startsWith(root + sep)) return plain(404, "Not found\n");
      const send = async (file, status = 200) => {
        const body = await readFile(file);
        response.writeHead(status, { ...headers, "content-type": CONTENT_TYPES[extname(file)] ?? "application/octet-stream" });
        response.end(body);
      };
      const found = await kind(target);
      if (found === "file" && !pathname.endsWith("/")) return await send(target);
      if (found === "dir") {
        if (!pathname.endsWith("/")) return plain(301, "", { location: `${pathname}/${url.search}` });
        const index = join(target, "index.html");
        if ((await kind(index)) === "file") return await send(index);
      }
      const notFound = join(root, "404.html");
      if ((await kind(notFound)) === "file") return await send(notFound, 404);
      return plain(404, "Not found\n");
    } catch (error) {
      return plain(500, `Server error: ${error instanceof Error ? error.message : String(error)}\n`);
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const options = parseArgs(process.argv.slice(2));
  const server = createPagesServer(options);
  server.listen(options.port, "127.0.0.1", () => {
    console.log(`serve: http://127.0.0.1:${options.port}${options.base} -> ${options.dir}`);
  });
  const stop = () => server.close(() => process.exit(0));
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}
