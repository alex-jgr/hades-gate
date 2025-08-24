async function checkErrors() {
  try {
    const errors = await fetch('/errors');
    document.querySelector('#errors').innerHTML = await errors.json();
  } catch (error) {
    console.error('Error fetching errors:', error);
  }
}

async function getLogs() {
  try {
    const logs = await fetch('/logs');
    document.getElementById('log-entries').innerHTML = await logs.json();
  } catch (error) {
    console.error('Error fetching logs:', error);
  }
}

async function getSettings() {
  try {
    const settingsResponse = await fetch('/settings');
    const settings = await settingsResponse.json();
    console.debug('[] settings', settings);
    if (!settings) return;
    Object.entries(settings).forEach(([id, value]) => {
      const input = document.getElementById(id);
      input.setAttribute("value", value);
    });
  } catch (error) {
    console.error('Error fetching settings');
  }
}

checkErrors();

getSettings();