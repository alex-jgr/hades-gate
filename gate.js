const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');
const ws = require('ws');

class ProxyServer {
  constructor() {
    this.settings = {
      protocol: 'https',
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
      if (value) this.setSetting(key, value);
    });

    if (!this.settings.remoteHost) {
      this.errors.push('Remote host is not set');
    }

    return this;
  }

  open(callback) {
    if (!this.errors.length) {
      this.startHttpProxy();
      this.startWebSocketProxy();
      if (callback) callback(this.settings);
    } else {
      this.errors.push('Failed to start proxies');
    }
  }

  getHttpProxyOptions(protocol) {
    const options = {};

    if (protocol === 'https') {
      // Generated with:
      // openssl req -x509 -newkey rsa:4096 -sha256 -days 365 -nodes -keyout certs/privkey.pem -out certs/fullchain.pem -subj "//CN=localhost"

      options.key = fs.readFileSync(path.join(__dirname, 'certs/privkey.pem'));
      options.cert = fs.readFileSync(path.join(__dirname, 'certs/fullchain.pem'));
      options.minVersion = 'TLSv1.2';
      options.ciphers = [
        'ECDHE-ECDSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-ECDSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES256-GCM-SHA384'
      ].join(':');
      options.honorCipherOrder = true;
    }

    return options;
  }

  startHttpProxy() {
    const { protocol } = this.settings;
    const remote = protocol === 'https' ? https : http;
    const local = protocol === 'https' ? https : http;
    const httpProxyOptions = this.getHttpProxyOptions(protocol);

    this.httpProxy = local.createServer(httpProxyOptions, (req, res) => {

      const requestData = {
        host: this.settings.remoteHost,
        port: this.settings.remotePort,
        path: req.url,
        method: req.method,
        headers: req.headers,
        protocol: this.settings.protocol + ':',
        rejectUnauthorized: false,
        requestCert: false,
        agent: new https.Agent()
      };

      remote.request(requestData, (proxyRes) => {
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

    console.debug('[] Trying to start ws server on port: ', webSocketPort);

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
