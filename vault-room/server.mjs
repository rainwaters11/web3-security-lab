import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const types = { 'index.html': 'text/html', 'game.css': 'text/css', 'game.mjs': 'text/javascript', 'model.mjs': 'text/javascript' };
export const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  const file = path === '/' ? 'index.html' : path.slice(1);
  if (req.method !== 'GET' || !Object.hasOwn(types, file)) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const content = await readFile(new URL(file, import.meta.url));
    res.writeHead(200, { 'content-type': types[file] + '; charset=utf-8', 'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'", 'x-content-type-options': 'nosniff' });
    res.end(content);
  } catch { res.writeHead(500); res.end('Unable to load room'); }
});
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) server.listen(Number(process.env.PORT || 3001), '127.0.0.1', () => console.log('Vault room: http://127.0.0.1:' + (process.env.PORT || 3001)));
