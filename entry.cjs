// async function loadApp() {
//   await import('./index.js')
// }

// loadApp()
async function loadApp() {
  try {
    await import('./index.js');
  } catch (error) {
    console.error('Failed to load app:', error);
    process.exit(1);
  }
}
loadApp();