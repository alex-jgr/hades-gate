const fs = require("fs");
const path = require("path");
const gate = require("./gate");

exports.getErrors = (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(gate.errors));
};

exports.logs = (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(gate.logs));
};

exports.favicon = (req, res) => {
  const filePath = path.join(__dirname, "favicon.ico");
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } else {
      res.writeHead(200, { "Content-Type": "image/x-icon" });
      res.end(data);
    }
  });
};

exports.notFound = (req, res) => {
  const filePath = path.join(__dirname, "404.html");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } else {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end(data);
    }
  });
};

function active(req, res) {
  const filePath = path.join(__dirname, "active.html");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    }
  });
};

exports.main = (req, res) => {
  const activePage = gate.httpProxyRunning ? 'active.html' : 'index.html';
  const filePath = path.join(__dirname, activePage);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    }
  });
};

exports.open = (req, res) => {
  const filePath = path.join(__dirname, "index.html");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    }
  });
};
