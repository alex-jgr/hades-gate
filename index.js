const http = require("http");
const fs = require("fs");
const path = require("path");
const ui = require('./cerberus');
const inputs = require('./inputs');
const gate = require('./gate');

/**
 * Control panel port.
 */
let PORT = 8888;

process.argv.forEach((val) => {
  if (val.includes('--port=')) {
    PORT = parseInt(val.split('=')[1]);
  }

  // Alternatively start the proxy right away with settings.json or defaults, without the web panel.
  if (val.includes('--with-saved-settings')) {
    const settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
    gate.prepare(settings).open((proxy) => {
      console.log(`Proxy started. All requests from ${proxy.protocol}:\\${proxy.localHost}:${proxy.localPort} will be redirected to ${proxy.protocol}://${proxy.remoteHost}:${proxy.remotePort}`);
    });
  }
});

const routes = {
  "/": ui.main,
  "/index.html": ui.main,
  "/open": ui.open,
  "/logs": ui.logs,
  "/errors": ui.getErrors,
  "/settings": ui.getSettings
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
  console.log(`\x1b[33mYou reached the gates of hell.\nIn front of them Cerberus stays angry and tired, breathing hardly with somke coming out of all its nostrils.\nYou can see its eyes smoldering like ember as he turns one of his heads towards you, with its hair all dirty of ash, its fangs washed in blood\nbut somehow you feel welcome, convinced that you'll set your destination and move forward embracing your hard labor.\nPlease proceed\n\x1b[34mhttp://localhost:${PORT}`);
  console.log("\x1b[0m");
});
