const fs = require("fs");
const path = require("path");
const gate = require("./gate");
const config = require("./config");
const Const = require('./constants');

exports.getErrors = (req, res) => {
  res.writeHead(200, Const.APPLICATION_JSON);
  res.end(JSON.stringify(gate.errors));
};

exports.logs = (req, res) => {
  res.writeHead(200, Const.APPLICATION_JSON);
  res.end(JSON.stringify(gate.logs));
};

exports.favicon = (req, res) => {
  const filePath = path.join(__dirname, "favicon.ico");
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, Const.TEXT_PLAIN);
      res.end("Internal Server Error");
    } else {
      res.writeHead(200, Const.IMAGE_ICON);
      res.end(data);
    }
  });
};

exports.notFound = (req, res) => {
  const filePath = path.join(__dirname, Const.PAGE_404);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.writeHead(500, Const.TEXT_PLAIN);
      res.end("Internal Server Error");
    } else {
      res.writeHead(404, Const.TEXT_HTML);
      res.end(data);
    }
  });
};

function active(req, res) {
  const filePath = path.join(__dirname, Const.PAGE_ACTIVE);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.writeHead(500, Const.TEXT_PLAIN);
      res.end("Internal Server Error");
    } else {
      res.writeHead(200, Const.TEXT_HTML);
      res.end(data);
    }
  });
};

exports.main = (req, res) => {
  const activePage = gate.httpProxyRunning ? Const.PAGE_ACTIVE : Const.PAGE_INDEX;
  const filePath = path.join(__dirname, activePage);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.writeHead(500, Const.TEXT_PLAIN);
      res.end("Internal Server Error");
    } else {
      res.writeHead(200, Const.TEXT_HTML);
      res.end(data);
    }
  });
};

exports.open = (req, res) => {
  config.updateSettings(req.params);

  gate.prepare(req.params).open();

  const filePath = path.join(__dirname, Const.PAGE_INDEX);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.writeHead(500, Const.TEXT_PLAIN);
      res.end("Internal Server Error");
    } else {
      res.writeHead(200, Const.TEXT_HTML);
      res.end(data);
    }
  });
};

exports.getSettings = (req, res) => {
  const settings = config.loadSettings();

  res.writeHead(200, Const.APPLICATION_JSON);
  res.end(JSON.stringify(settings));
};
