const fs = require('fs');
const path = require('path');

// Function to update file paths in HTML and JS files
function updateFilePaths(dir, oldPrefix, newPrefix) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
            updateFilePaths(fullPath, oldPrefix, newPrefix);
        } else if (file.isFile() && (file.name.endsWith('.html') || file.name.endsWith('.js'))) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Update various path patterns
            const patterns = [
                // Relative paths like ../index.html -> ../src/index.html
                { regex: /\.\.\/\.\.\//g, replacement: '../src/' },
                // Single level like ../dashboard/dashboard.html -> ../src/dashboard/dashboard.html  
                { regex: /\.\.\/(?!src)/g, replacement: '../src/' },
                // Update specific navigation paths
                { regex: /\.\.\/home\//g, replacement: '../src/' },
                { regex: /\.\.\/dashboard\//g, replacement: '../src/dashboard/' },
                { regex: /\.\.\/login\//g, replacement: '../src/login/' },
                { regex: /\.\.\/signup\//g, replacement: '../src/signup/' },
                { regex: /\.\.\/profile\//g, replacement: '../src/profile/' },
                { regex: /\.\.\/progress\//g, replacement: '../src/progress/' },
                { regex: /\.\.\/exercise_selector\//g, replacement: '../src/exercise_selector/' },
                { regex: /\.\.\/goal_selector\//g, replacement: '../src/goal_selector/' },
                { regex: /\.\.\/form\//g, replacement: '../src/form/' },
                { regex: /\.\.\/plan\//g, replacement: '../src/plan/' },
                { regex: /\.\.\/coach_chat\//g, replacement: '../src/coach_chat/' },
                { regex: /\.\.\/minigames\//g, replacement: '../src/minigames/' },
                { regex: /\.\.\/shared\//g, replacement: '../src/shared/' },
                { regex: /\.\.\/assets\//g, replacement: '../src/assets/' }
            ];
            
            let changed = false;
            for (const pattern of patterns) {
                if (pattern.regex.test(content)) {
                    content = content.replace(pattern.regex, pattern.replacement);
                    changed = true;
                }
            }
            
            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated paths in: ${fullPath}`);
            }
        }
    }
}

// Update all files in src directory
console.log('Updating file paths for src structure...');
updateFilePaths('./src', '../', '../src/');
console.log('Path updates completed!');
