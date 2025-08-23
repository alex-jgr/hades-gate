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

checkErrors();

// setInterval(getLogs, 1000);
