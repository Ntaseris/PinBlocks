const fs=require('fs');
const parts=['random_generator.js','components.js','validation.js','compiler.js','simulator.js','app.js'];
const output=parts.map(file=>`/* ===== ${file} ===== */\n${fs.readFileSync(file,'utf8').trim()}\n`).join('\n');
fs.writeFileSync('pinblocks_bundle.js',output);
console.log(`Built pinblocks_bundle.js from ${parts.length} source files.`);
