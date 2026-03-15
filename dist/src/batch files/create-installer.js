const installer = require('electron-installer-windows');

const options = {
  src: 'dist/Fitlify-win32-x64',
  dest: 'dist/installer',
  authors: ['Fitlify'],
  exe: 'Fitlify.exe',
  description: 'Fitlify - Your Personal Fitness Companion',
  version: '1.0.0',
  title: 'Fitlify',
  name: 'Fitlify',
  productName: 'Fitlify',
  noMsi: true,
  setupExe: 'Fitlify-Setup-1.0.0.exe'
};

console.log('Creating Windows installer...');

installer(options)
  .then(() => {
    console.log('\n✅ Installer created successfully!');
    console.log('📁 Location: dist/installer/Fitlify-Setup-1.0.0.exe');
  })
  .catch((err) => {
    console.error('\n❌ Failed to create installer:', err);
    process.exit(1);
  });
