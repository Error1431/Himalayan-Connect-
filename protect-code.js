const fs = require('fs');
const path = require('path');

// 1. Aapka proprietary copyright text
const copyrightHeader = `/**
 * © 2026 Himalayan-Connect. All rights reserved.
 * Written by Ankit Rana, 2026
 * Proprietary and confidential. Unauthorized copying is strictly prohibited.
 */\n\n`;

const licenseText = `Copyright (c) 2026 Himalayan-Connect. All rights reserved.

This software and its documentation are the proprietary property of the author. 
Unauthorized copying, modification, distribution, or execution of this file, 
via any medium, is strictly prohibited.`;

// 2. Automated function files ko scan aur update karne ke liye
function addHeaderToFiles(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Agar folder hai toh andar jao (jaise components, routes, config)
            if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
                addHeaderToFiles(filePath);
            }
        } else if (stat.isFile()) {
            // Sirf JS, JSX, TS, TSX files target karo
            if (/\.(js|jsx|ts|tsx)$/.test(file)) {
                let content = fs.readFileSync(filePath, 'utf8');
                
                // Agar pehle se header nahi laga hai toh hi lagao
                if (!content.includes('Himalayan-Connect. All rights reserved.')) {
                    content = copyrightHeader + content;
                    fs.writeFileSync(filePath, content, 'utf8');
                    console.log(`✅ Protected: ${file}`);
                } else {
                    console.log(`⏩ Already Protected: ${file}`);
                }
            }
        }
    });
}

// Execution block
try {
    // License file banana
    fs.writeFileSync(path.join(__dirname, 'LICENSE'), licenseText, 'utf8');
    console.log('📝 LICENSE file created successfully!');

    // Apne source folders ka path yahan check karlo (agar pure project mein chalana hai toh '.')
    // Best practice ke liye hum active code folders par chalate hain
    const targets = ['./src', './routes', './config', './models', './controllers'];
    
    targets.forEach(target => {
        const fullPath = path.resolve(target);
        if (fs.existsSync(fullPath)) {
            console.log(`\nScanning directory: ${target}...`);
            addHeaderToFiles(fullPath);
        }
    });

    console.log('\n🎉 Poora project ek hi baar mein secure ho gaya, bhai!');
} catch (error) {
    console.error('Error protecting files:', error);
}