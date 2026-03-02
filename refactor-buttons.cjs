const fs = require('fs');
const path = require('path');

const srcPaths = [
    "c:\\Users\\giphy\\zone-out\\src"
];

function walkDir(dir) {
    let files = [];
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            files = files.concat(walkDir(dirPath));
        } else if (dirPath.endsWith('.jsx')) {
            files.push(dirPath);
        }
    });
    return files;
}

let modifiedFiles = [];

srcPaths.forEach(basePath => {
    const allFiles = walkDir(basePath);
    allFiles.forEach(filePath => {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // Replace Tailwind gradients
        content = content.replace(/bg-gradient-to-r\s+from-\[?[^\s\]]+\]?\s+to-\[?[^\s\]]+\]?\s+text-\[?[^\s\]]+\]?/g, 'btn-primary');
        content = content.replace(/bg-gradient-to-tr\s+from-\[?[^\s\]]+\]?\s+to-\[?[^\s\]]+\]?\s+text-\[?[^\s\]]+\]?/g, 'btn-primary');
        content = content.replace(/bg-gradient-to-r\s+from-\S+\s+to-\S+/g, 'btn-primary');
        content = content.replace(/bg-gradient-to-br\s+from-\S+\s+to-\S+/g, 'btn-primary');


        // Sometimes text-[var(--text-primary)] is separate
        content = content.replace(/btn-primary\s+text-\[var\(--text-primary\)\\]/g, 'btn-primary');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            modifiedFiles.push(filePath);
        }
    });
});

console.log("Refactored Tailwind Buttons in:", modifiedFiles.length, "files");
modifiedFiles.forEach(f => console.log(f));
