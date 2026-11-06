import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const port = Number(process.env.PORT || 3000);
const publicDirectory = new URL('../public/', import.meta.url);
const routes = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/css/styles.css', ['css/styles.css', 'text/css; charset=utf-8']],
  ['/js/main.js', ['js/main.js', 'text/javascript; charset=utf-8']],
]);

const server = createServer(async (request, response) => {
  const pathname = (request.url || '/').split('?')[0];
  const route = routes.get(pathname);

  if (!route || !['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  try {
    const [file, contentType] = route;
    const content = await readFile(new URL(file, publicDirectory));
    response.writeHead(200, { 'Content-Type': contentType });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch (error) {
    console.error(error);
    response.writeHead(500);
    response.end('Internal server error');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Whiteboard: http://localhost:${port}`);
});
