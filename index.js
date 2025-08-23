const http = require("http");
const fs = require("fs");
const path = require("path");
const ui = require('./cerberus');
const inputs = require('./inputs');

let PORT = 8888;

process.argv.forEach((val) => {
  if (val.includes('--port=')) {
    PORT = parseInt(val.split('=')[1]);
  }
});

const routes = {
  "/": ui.main,
  "/index.html": ui.main,
  "/open": ui.open,
  "/logs": ui.logs,
  "/errors": ui.getErrors
};

const contentType = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.txt': 'text/plain',
};

const server = http.createServer(async (req, res) => {
  const [endpoint, query] = req.url.split('?');
  const action = routes[endpoint];
  res.setHeader('Cache-Control', 'no-cache');
  if (action) {
    req.params = await inputs.getPostParams(req);
    req.query = inputs.getParams(query);
    console.debug('[] req:', req.url);
    action(req, res);
  } else {
    const staticFile = path.join(__dirname, 'public', req.url);
    fs.readFile(staticFile, (err, data) => {
      if (err) {
        ui.notFound(req, res);
      } else {
        const ext = path.extname(staticFile);
        res.writeHead(200, { 'Content-Type': contentType[ext] || 'application/octet-stream' });
        res.end(data);
      }
    });
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Gate keeper started running on http://localhost:${PORT}`);
});
