const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Builds the static site for use with NGINX Proxy Manager
 */
function buildStaticSiteForNginx() {
  try {
    console.log('🚀 Starting static site build process for NGINX Proxy Manager...');
    
    // Step 1: Make sure we have a clean build
    console.log('🧹 Running clean build...');
    execSync('npm run clean && npm run build:static', { stdio: 'inherit' });
    
    // Step 2: Create or update CNAME file
    const cnamePath = path.join(process.cwd(), 'out', 'CNAME');
    fs.writeFileSync(cnamePath, 'bittybox.hiddencasa.com');
    console.log('📝 Created CNAME file for bittybox.hiddencasa.com');
    
    // Step 3: Provide NGINX Proxy Manager setup instructions
    console.log('\n🔧 NGINX Proxy Manager Setup Instructions 🔧');
    console.log('----------------------------------------');
    console.log('To serve your static site with NGINX Proxy Manager:');
    console.log('\n1. In NGINX Proxy Manager, add a new "Proxy Host"');
    console.log('2. Set Domain Names: bittybox.hiddencasa.com');
    console.log('3. For Scheme: select http://');
    console.log(`4. For Forward Hostname/IP: your server IP address`);
    console.log('5. For Forward Port: the port your static file server is running on');
    console.log('6. Under "SSL" tab, enable SSL if desired');
    console.log('\nFor the actual file serving, use one of these options:');
    console.log(`a) Run: npx serve -p 8080 ${path.resolve(process.cwd(), 'out')}`);
    console.log('b) Configure a local nginx server to serve the static files');
    console.log('----------------------------------------');
    
    // Step 4: Show path to static files
    console.log(`\n✅ Static site build completed successfully!`);
    console.log(`📂 Output is available in: ${path.resolve(process.cwd(), 'out')}`);
    
    // Ask if user wants to start a local server
    console.log('\nWould you like to start a local server now?');
    console.log('Run: npm run serve:static');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the build
buildStaticSiteForNginx(); 