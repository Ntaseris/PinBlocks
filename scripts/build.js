const fs=require('fs');
const parts=['random_generator.js','components.js','validation.js','compiler.js','simulator.js','app.js'];
const output=parts.map(file=>`/* ===== ${file} ===== */\n${fs.readFileSync(file,'utf8').trim()}\n`).join('\n');
fs.writeFileSync('pinblocks_bundle.js',output);
fs.rmSync('dist',{recursive:true,force:true});
fs.mkdirSync('dist/assets',{recursive:true});
for(const file of ['index.html','styles.css','browser_adapter.js','pinblocks_bundle.js','vendor-js-yaml.min.js'])fs.copyFileSync(file,`dist/${file}`);
fs.copyFileSync('assets/houseball-logo.png','dist/assets/houseball-logo.png');
console.log(`Built PinBlocks web beta in dist/ from ${parts.length} source files.`);
