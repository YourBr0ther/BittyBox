const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Sets up the static site for local access via custom hostname
 */
function setupLocalStaticSite() {
  try {
    console.log('🚀 Starting local static site setup process...');
    
    // Step 1: Make sure we have a clean build
    console.log('🧹 Running clean build...');
    execSync('npm run clean && npm run build:static', { stdio: 'inherit' });
    
    // Step 2: Create or update CNAME file
    const cnamePath = path.join(process.cwd(), 'out', 'CNAME');
    fs.writeFileSync(cnamePath, 'bittybox.hiddencasa.com');
    console.log('📝 Created CNAME file for bittybox.hiddencasa.com');
    
    // Step 3: Create a hosts file entry message
    console.log('\n🔧 Local Host Setup Instructions 🔧');
    console.log('----------------------------------------');
    console.log('To access your site locally with the custom domain, add this entry to your hosts file:');
    console.log('\n127.0.0.1  bittybox.hiddencasa.com\n');
    console.log('Location of hosts file:');
    console.log('- macOS/Linux: /etc/hosts (requires sudo to edit)');
    console.log('- Windows: C:\\Windows\\System32\\drivers\\etc\\hosts');
    console.log('----------------------------------------\n');
    
    // Step 4: Serve the static site
    console.log('📡 Starting local server...');
    console.log('✅ Your site will be available at: http://bittybox.hiddencasa.com:3000');
    console.log('Press Ctrl+C to stop the server when done.\n');
    
    // Serve on port 3000 by default
    execSync('npx serve -p 3000 out', { stdio: 'inherit' });

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the local setup
setupLocalStaticSite(); 