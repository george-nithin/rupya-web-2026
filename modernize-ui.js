#!/usr/bin/env node

/**
 * UI Modernization Script
 * Automatically upgrades UI patterns across the codebase
 */

const fs = require('fs');
const path = require('path');

// UI pattern upgrades
const uiUpgrades = [
    // Border radius modernization
    { pattern: /rounded-lg(?!\s*border-radius)/g, replacement: 'rounded-xl' },
    { pattern: /rounded-md(?!\s*border-radius)/g, replacement: 'rounded-lg' },

    // Transition improvements
    { pattern: /transition(?!-)/g, replacement: 'transition-all duration-200' },
    { pattern: /transition-colors/g, replacement: 'transition-all duration-150' },

    // Shadow upgrades
    { pattern: /shadow-sm/g, replacement: 'shadow-soft' },
    { pattern: /shadow(?!-)/g, replacement: 'shadow-medium' },
    { pattern: /shadow-lg/g, replacement: 'shadow-strong' },

    // Icon size consistency (ensure h-5 w-5 for standard icons)
    { pattern: /<(\w+)\s+className="h-4\s+w-4/g, replacement: '<$1 className="h-5 w-5' },

    // Add hover animations to interactive elements
    { pattern: /className="([^"]*hover:bg-[^"]*)"(?!\s*active:scale)/g, replacement: 'className="$1 active:scale-95"' },
];

// Files to skip
const skipFiles = [
    'node_modules',
    '.next',
    '.git',
    'design-tokens.ts',
    'Skeleton.tsx',
    'EmptyState.tsx',
];

function shouldSkipFile(filePath) {
    return skipFiles.some(skip => filePath.includes(skip));
}

function processFile(filePath) {
    if (shouldSkipFile(filePath)) return 0;

    const content = fs.readFileSync(filePath, 'utf8');
    let modified = content;
    let changeCount = 0;

    uiUpgrades.forEach(({ pattern, replacement }) => {
        const matches = modified.match(pattern);
        if (matches) {
            modified = modified.replace(pattern, replacement);
            changeCount += matches.length;
        }
    });

    if (modified !== content) {
        fs.writeFileSync(filePath, modified, 'utf8');
        console.log(`✓ ${path.relative(process.cwd(), filePath)}: ${changeCount} upgrades`);
        return changeCount;
    }

    return 0;
}

function walkDirectory(dir, filePattern = /\.(tsx|ts|jsx|js)$/) {
    const files = [];

    function walk(currentPath) {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);

            if (entry.isDirectory()) {
                if (!shouldSkipFile(fullPath)) {
                    walk(fullPath);
                }
            } else if (entry.isFile() && filePattern.test(entry.name)) {
                files.push(fullPath);
            }
        }
    }

    walk(dir);
    return files;
}

// Main execution
const srcDir = path.join(__dirname, 'src');
console.log('🎨 Starting UI modernization...\n');

const files = walkDirectory(srcDir);
let totalChanges = 0;

files.forEach(file => {
    const changes = processFile(file);
    totalChanges += changes;
});

console.log(`\n✅ Complete! ${totalChanges} UI upgrades across ${files.length} files`);
