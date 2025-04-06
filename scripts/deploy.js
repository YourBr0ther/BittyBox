const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Deploys the static site to GitHub Pages
 * You'll need to have a gh-pages branch set up in your repository
 */
function deployStaticSite() {
  try {
    console.log('🚀 Starting GitHub Pages deployment process...');
    
    // Step 1: Get the repository URL from the main project
    let repoUrl;
    try {
      repoUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
      console.log(`📋 Using repository: ${repoUrl}`);
    } catch (error) {
      console.error('❌ Could not get repository URL. Make sure you have a git repository set up with a remote origin.');
      process.exit(1);
    }
    
    // Step 2: Make sure we have a clean build
    console.log('🧹 Running clean build...');
    execSync('npm run clean && npm run build:static', { stdio: 'inherit' });
    
    // Step 3: Create or update CNAME file if deploying to a custom domain
    const cnamePath = path.join(process.cwd(), 'out', 'CNAME');
    fs.writeFileSync(cnamePath, 'bittybox.hiddencasa.com');
    console.log('📝 Created CNAME file for bittybox.hiddencasa.com');
    
    // Step 4: Initialize git in the out directory if it doesn't exist
    console.log('🔧 Setting up git for deployment...');
    
    // Move to the out directory
    process.chdir(path.join(process.cwd(), 'out'));
    
    // Initialize git if needed
    try {
      execSync('git init', { stdio: 'inherit' });
    } catch (error) {
      console.log('Git repository already initialized.');
    }
    
    // Configure git
    execSync('git config user.name "Deployment Script"', { stdio: 'inherit' });
    execSync('git config user.email "deployment@bittybox.hiddencasa.com"', { stdio: 'inherit' });
    
    // Set the correct remote origin
    try {
      execSync('git remote rm origin', { stdio: 'pipe' });
    } catch (error) {
      // It's okay if this fails - remote might not exist yet
    }
    
    execSync(`git remote add origin ${repoUrl}`, { stdio: 'inherit' });
    console.log(`✓ Remote origin set to: ${repoUrl}`);
    
    // Add all files
    execSync('git add -A', { stdio: 'inherit' });
    
    // Commit changes
    const commitMessage = `Deploy: ${new Date().toISOString()}`;
    execSync(`git commit -m "${commitMessage}" --allow-empty`, { stdio: 'inherit' });
    
    // Push to the gh-pages branch, force pushing to ensure clean deployment
    console.log('🚢 Pushing to gh-pages branch...');
    execSync('git push -f origin HEAD:gh-pages', { stdio: 'inherit' });
    
    // Return to the original directory
    process.chdir('..');
    
    console.log('✅ Deployment completed successfully!');
    console.log('🌐 Your site should be available at: https://bittybox.hiddencasa.com');
    console.log('⏱️ It may take a few minutes for changes to propagate.');
    console.log('📝 Note: Make sure GitHub Pages is configured to use the gh-pages branch in your repository settings.');

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Run the deployment
deployStaticSite(); 