import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') && !file.includes('ThemeToggle')) results.push(file);
        }
    });
    return results;
}

const files = walk('src');

const replacements = [
    { from: /\btext-slate-50\b(?! dark:)/g, to: 'text-slate-900 dark:text-slate-50' },
    { from: /\btext-slate-400\b(?! dark:)/g, to: 'text-slate-600 dark:text-slate-400' },
    { from: /\btext-slate-300\b(?! dark:)/g, to: 'text-slate-700 dark:text-slate-300' },
    { from: /\btext-slate-200\b(?! dark:)/g, to: 'text-slate-800 dark:text-slate-200' },
    { from: /(?<!dark:)text-white/g, to: 'text-black dark:text-white' },
    { from: /(?<!dark:)bg-white\/5/g, to: 'bg-black/5 dark:bg-white/5' },
    { from: /(?<!dark:)bg-white\/10/g, to: 'bg-black/10 dark:bg-white/10' },
    { from: /(?<!dark:)border-white\/5/g, to: 'border-black/10 dark:border-white/5' },
    { from: /(?<!dark:)border-white\/10/g, to: 'border-black/20 dark:border-white/10' },
    { from: /(?<!dark:)border-white\/20/g, to: 'border-black/30 dark:border-white/20' },
    { from: /(?<!dark:)hover:bg-white\/5/g, to: 'hover:bg-black/5 dark:hover:bg-white/5' },
    { from: /(?<!dark:)hover:bg-white\/10/g, to: 'hover:bg-black/10 dark:hover:bg-white/10' },
    { from: /(?<!dark:)hover:text-white/g, to: 'hover:text-black dark:hover:text-white' },
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Quick skip for App.tsx which we already modded mostly manually, except maybe we want its internal parts modded too
    if (file.includes('App.tsx')) {
        // Just do nothing if we already added dark: to App.tsx root
    }

    replacements.forEach(({from, to}) => {
        // To be safe against double replacement (e.g. text-black dark:text-white becoming text-black dark:text-black dark:text-white)
        // Wait, the regexes check for missing dark: or use lookaround
        content = content.replace(from, to);
    });

    // Fix double processing if any bug
    content = content.replace(/dark:dark:/g, 'dark:');
    content = content.replace(/text-black dark:text-black dark:text-white/g, 'text-black dark:text-white');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + file);
    }
});
