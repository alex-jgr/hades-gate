const path = require('path');
const fs = require('fs');

const SETTINGS_FILE = path.join(__dirname, 'settings.json');
const settings = {};

exports.settings = settings;

exports.updateSettings = (newSettings) => {
  if (!newSettings) return;

  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(newSettings));

  Object.entries(newSettings).forEach(([key, value]) => {
    if (!value) return;
    settings[key] = value;
  })
};

exports.loadSettings = () => {
  const exists = fs.existsSync(SETTINGS_FILE)

  if (!exists) return;

  const _settings = JSON.parse(fs.readFileSync(SETTINGS_FILE));

  Object.entries(_settings).forEach(([key, value]) => {
    if (!value) return;
    settings[key] = value;
  })

  return settings;
}
