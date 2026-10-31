const fs=require('fs'),vm=require('vm');
const files=['random_generator.js','components.js','validation.js','compiler.js','simulator.js','app.js','browser_adapter.js','pinblocks_bundle.js'];
for(const file of files)new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});
const html=fs.readFileSync('index.html','utf8');
for(const asset of ['styles.css','vendor-js-yaml.min.js','browser_adapter.js','pinblocks_bundle.js'])if(!html.includes(asset))throw new Error(`index.html is missing ${asset}`);
const app=fs.readFileSync('app.js','utf8'),compiler=fs.readFileSync('compiler.js','utf8'),sim=fs.readFileSync('simulator.js','utf8');
const requirements=[
  [app,'startFirstModeTutorial','guided tutorial'],[app,'downloadPinBlocksProject','portable project export'],[app,'importPinBlocksProject','portable project import'],
  [compiler,'function compile()','MPF YAML compiler'],[compiler,'variable_player:','MPF scoring YAML'],[sim,'function fireRule','simulation input'],[sim,'function tickTimers','timer simulation']
];
for(const [text,needle,label] of requirements)if(!text.includes(needle))throw new Error(`Missing ${label}: ${needle}`);
const adapter=fs.readFileSync('browser_adapter.js','utf8');
for(const needle of ['/api/pick-folder','loadDemo','jsyaml.load'])if(!adapter.includes(needle))throw new Error(`Browser adapter missing ${needle}`);
console.log('PinBlocks browser/desktop static checks passed.');
