#!/usr/bin/env node

/**
 * Automated Theme Refactoring Script
 * Replaces hardcoded colors with semantic theme tokens across the codebase
 */

const fs = require('fs');
const path = require('path');

// Color mapping rules
const colorReplacements = [
    // Backgrounds
    { pattern: /bg-slate-900\/(\d+)/g, replacement: 'bg-card/$1' },
    { pattern: /bg-slate-900/g, replacement: 'bg-card' },
    { pattern: /bg-slate-800/g, replacement: 'bg-secondary' },
    { pattern: /bg-white\/5/g, replacement: 'bg-card/20' },
    { pattern: /bg-white\/10/g, replacement: 'bg-card/30' },

    // Text colors
    { pattern: /text-white(?![/-])/g, replacement: 'text-foreground' },
    { pattern: /text-slate-400/g, replacement: 'text-muted-foreground' },
    { pattern: /text-slate-300/g, replacement: 'text-foreground/80' },
    { pattern: /text-slate-200/g, replacement: 'text-foreground' },
    { pattern: /text-slate-500/g, replacement: 'text-muted-foreground' },

    // Borders
    { pattern: /border-white\/10/g, replacement: 'border-border' },
    { pattern: /border-white\/20/g, replacement: 'border-border' },
    { pattern: /border-white\/5/g, replacement: 'border-border/50' },

    // Specific component patterns
    { pattern: /#1e1e1e/g, replacement: 'hsl(var(--card))' },
];

// Files to skip (already refactored or special cases)
const skipFiles = [
    'GlassCard.tsx',
    'GlassInput.tsx',
    'GlassButton.tsx',
    'StockSearch.tsx',
    'globals.css',
    'tailwind.config.ts',
];

// Patterns to preserve (semantic colors that should NOT be changed)
const preservePatterns = [
    /text-green-/,
    /text-red-/,
    /text-emerald-/,
    /text-rose-/,
    /bg-green-/,
    /bg-red-/,
    /bg-emerald-/,
    /bg-rose-/,
    /text-sky-/,  // Primary color
    /bg-sky-/,    // Primary color
    /text-purple-/,
    /text-cyan-/,
    /text-amber-/,
    /text-orange-/,
];

function shouldPreserveLine(line) {
    return preservePatterns.some(pattern => pattern.test(line));
}

function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = content;
    let changeCount = 0;

    const lines = content.split('\n');
    const processedLines = lines.map(line => {
        // Skip lines with semantic colors
        if (shouldPreserveLine(line)) {
            return line;
        }

        let processedLine = line;
        colorReplacements.forEach(({ pattern, replacement }) => {
            const before = processedLine;
            processedLine = processedLine.replace(pattern, replacement);
            if (before !== processedLine) {
                changeCount++;
            }
        });

        return processedLine;
    });

    modified = processedLines.join('\n');

    if (modified !== content) {
        fs.writeFileSync(filePath, modified, 'utf8');
        console.log(`✓ ${filePath}: ${changeCount} replacements`);
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
                if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    walk(fullPath);
                }
            } else if (entry.isFile() && filePattern.test(entry.name)) {
                if (!skipFiles.includes(entry.name)) {
                    files.push(fullPath);
                }
            }
        }
    }

    walk(dir);
    return files;
}

// Main execution
const srcDir = path.join(__dirname, 'src');
console.log('🎨 Starting automated theme refactoring...\n');

const files = walkDirectory(srcDir);
let totalChanges = 0;

files.forEach(file => {
    const changes = processFile(file);
    totalChanges += changes;
});

console.log(`\n✅ Complete! ${totalChanges} total replacements across ${files.length} files`);
