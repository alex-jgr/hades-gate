const http = require('http');
const ws = require('ws');

class ProxyServer {
  constructor() {
    this.settings = {
      localHost: 'localhost',
      localPort: 3000,
      remoteHost: null,
      remotePort: 3000,
      webSocketPort: 5173
    };

    this.errors = [];
    this.logs = [];

    this.httpProxy = null;
    this.webSocketProxy = null;

    this.httpProxyRunning = false;
    this.webSocketProxyRunning = false;
  }

  setSetting(key, value) {
    if (this.settings.hasOwnProperty(key)) {
      this.settings[key] = value;
    } else {
      this.errors.push(`Invalid setting: ${key}`);
    }
  }

  clearErrors() {
    this.errors = [];
  }

  clearLogs() {
    this.logs = [];
  }

  prepare(settings) {
    Object.entries(settings).forEach(([key, value]) => {
      this.setSetting(key, value);
    });

    if (!this.settings.remoteHost) {
      this.errors.push('Remote host is not set');
    }

    return this;
  }

  open() {
    if (!this.errors.length) {
      this.startHttpProxy();
      this.startWebSocketProxy();
    } else {
      this.errors.push('Failed to start proxies');
    }
  }

  startHttpProxy() {
    this.httpProxy = http.createServer((req, res) => {
      http.request({
        hostname: this.settings.remoteHost,
        port: this.settings.remotePort,
        path: req.url,
        method: req.method,
        headers: req.headers
      }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      }).end();
    });

    this.httpProxy.listen(this.settings.localPort, () => {
      this.logs.push(`HTTP proxy started on ${this.settings.localHost}:${this.settings.localPort}`);
      this.httpProxyRunning = true;
    });

    this.httpProxy.on('error', (err) => {
      this.errors.push(`HTTP proxy error: ${err.message}`);
    });
  }

  startWebSocketProxy() {
    const { localHost,remoteHost, webSocketPort } = this.settings;

    this.wsProxy = new ws.WebSocketServer({
      port: webSocketPort
    });

    this.wsProxy.on('connection', (ws, req) => {
      const remoteWsServer = new WebSocket(`ws://${remoteHost}:${webSocketPort}`);
      // Forward messages from client to remote server.
      this.wsProxy.on('message', (message) => remoteWsServer.send(message));
      // Forward messages from remote server to client.
      remoteWsServer.on('message', (message) => this.wsProxy.send(message));
      // Remote close signal triggers proxy close.
      remoteWsServer.on('close', () => this.wsProxy.close());
      // Proxy close signal triggers remote close.
      this.wsProxy.on('close', () => remoteWsServer.close());
    });

    this.wsProxy.on('listening', () => {
      this.logs.push(`WebSocket proxy started on ${localHost}:${webSocketPort}`);
      this.webSocketProxyRunning = true;
    });

    this.wsProxy.on('error', (err) => {
      this.errors.push(`WebSocket proxy error: ${err.message}`);
    });

    this.wsProxy.on('close', () => {
      this.logs.push(`WebSocket proxy closed`);
      this.webSocketProxyRunning = false;
    });
  }

  stopHttpProxy() {
    this.httpProxy.close();
    this.httpProxyRunning = false;
  }

  stopWebSocketProxy() {
    this.wsProxy.close();
    this.webSocketProxyRunning = false;
  }

  close() {
    this.stopHttpProxy();
    this.stopWebSocketProxy();
  }
}

module.exports = new ProxyServer();
