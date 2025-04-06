const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Builds the static site for production
 */
function buildStaticSite() {
  try {
    console.log('🚀 Starting static site build process...');
    
    // Clean any previous builds
    console.log('🧹 Cleaning previous builds...');
    execSync('npm run clean', { stdio: 'inherit' });
    
    // Build the Next.js app
    console.log('🔨 Building Next.js app in static export mode...');
    execSync('next build', { stdio: 'inherit' });
    
    // Create a static-mode.json file that indicates this is a static build
    // Client-side code can fetch this to determine if it's in static mode
    console.log('📄 Creating static mode indicator file...');
    fs.writeFileSync(
      path.join(process.cwd(), 'out', 'static-mode.json'),
      JSON.stringify({
        isStatic: true,
        buildTime: new Date().toISOString(),
        message: "This is a static build of BittyBox. Some features like authentication and dynamic API routes are not available."
      }, null, 2)
    );
    
    // Ensure .well-known directory exists in the output
    const wellKnownDir = path.join(process.cwd(), 'out', '.well-known');
    const sourceWellKnownDir = path.join(process.cwd(), 'public', '.well-known');
    
    if (fs.existsSync(sourceWellKnownDir)) {
      console.log('📁 Copying .well-known directory...');
      
      if (!fs.existsSync(wellKnownDir)) {
        fs.mkdirSync(wellKnownDir, { recursive: true });
      }
      
      // Copy all files from public/.well-known to out/.well-known
      const files = fs.readdirSync(sourceWellKnownDir);
      files.forEach(file => {
        const sourcePath = path.join(sourceWellKnownDir, file);
        const destPath = path.join(wellKnownDir, file);
        fs.copyFileSync(sourcePath, destPath);
        console.log(`   ✅ Copied ${file} to .well-known/`);
      });
    }
    
    // Create a .nojekyll file to prevent GitHub Pages from ignoring files that begin with an underscore
    console.log('📄 Creating .nojekyll file...');
    fs.writeFileSync(path.join(process.cwd(), 'out', '.nojekyll'), '');
    
    // Create loading fallback page
    console.log('📄 Creating loading fallback page...');
    const loadingFallbackPath = path.join(process.cwd(), 'out', 'loading-fallback.html');
    fs.writeFileSync(loadingFallbackPath, `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BittyBox - Loading</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          background-color: #f0f0f0;
          color: #333;
        }
        .loader {
          border: 8px solid #f3f3f3;
          border-top: 8px solid #3498db;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 2s linear infinite;
          margin-bottom: 20px;
        }
        h1 {
          margin-bottom: 20px;
        }
        p {
          margin-bottom: 30px;
          text-align: center;
          max-width: 600px;
          line-height: 1.6;
        }
        a {
          color: #3498db;
          text-decoration: none;
          padding: 10px 20px;
          border: 2px solid #3498db;
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        a:hover {
          background-color: #3498db;
          color: white;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
      <script>
        // Redirect to home page after 5 seconds
        setTimeout(() => {
          window.location.href = '/';
        }, 5000);
      </script>
    </head>
    <body>
      <div class="loader"></div>
      <h1>Loading BittyBox</h1>
      <p>We're preparing your content. You'll be redirected to the home page in a few seconds.</p>
      <a href="/">Go to Home Page</a>
    </body>
    </html>
    `);
    
    // Create a robots.txt file if it doesn't exist
    const robotsPath = path.join(process.cwd(), 'out', 'robots.txt');
    if (!fs.existsSync(robotsPath)) {
      console.log('📄 Creating robots.txt file...');
      fs.writeFileSync(robotsPath, `
User-agent: *
Allow: /

Sitemap: https://bittybox.hiddencasa.com/sitemap.xml
      `);
    }
    
    // Create a basic sitemap if it doesn't exist
    const sitemapPath = path.join(process.cwd(), 'out', 'sitemap.xml');
    if (!fs.existsSync(sitemapPath)) {
      console.log('📄 Creating basic sitemap.xml file...');
      fs.writeFileSync(sitemapPath, `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://bittybox.hiddencasa.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://bittybox.hiddencasa.com/settings</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
      `);
    }
    
    console.log('✅ Static site build completed successfully!');
    console.log('📂 Output is available in the "out" directory');
    console.log('🌍 You can now deploy the "out" directory to your static hosting provider');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run the build process
buildStaticSite(); 