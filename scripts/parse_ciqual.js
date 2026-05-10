const fs = require('fs');
const readline = require('readline');
const path = require('path');

// Mise à jour pour la version 2025
const DATA_DIR = 'ciqual_data_2025';
const ALIM_FILE = path.join(DATA_DIR, 'alim_2025_11_03.xml');
const COMPO_FILE = path.join(DATA_DIR, 'compo_2025_11_03.xml');
const OUTPUT_FILE = 'src/data/ciqual_full.json';

const CODES = {
  energy: '328',
  protein: '25000',
  carbs: '31000',
  fat: '40000',
  fiber: '34100'
};

async function parseAliments() {
  // Utilisation de utf8 pour la version 2025
  const content = fs.readFileSync(ALIM_FILE, 'utf8');
  const aliments = {};
  const alimRegex = /<ALIM>([\s\S]*?)<\/ALIM>/g;
  let match;
  while ((match = alimRegex.exec(content)) !== null) {
    const block = match[1];
    const codeMatch = /<alim_code>\s*(\d+)\s*<\/alim_code>/.exec(block);
    const nameMatch = /<alim_nom_fr>\s*([\s\S]*?)\s*<\/alim_nom_fr>/.exec(block);
    
    if (codeMatch && nameMatch) {
      aliments[codeMatch[1].trim()] = {
        id: codeMatch[1].trim(),
        name: nameMatch[1].trim(),
        energy_kcal: 0,
        protein_g: 0,
        carbohydrates_g: 0,
        fat_g: 0,
        fiber_g: 0
      };
    }
  }
  return aliments;
}

function parseValue(val) {
  if (!val) return 0;
  let cleanVal = val.replace('<', '').replace(',', '.').trim();
  if (cleanVal === '-' || cleanVal.toLowerCase() === 'tr' || cleanVal === '') return 0;
  const num = parseFloat(cleanVal);
  return isNaN(num) ? 0 : num;
}

async function parseComposition(aliments) {
  const fileStream = fs.createReadStream(COMPO_FILE, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let currentBlock = [];
  let inBlock = false;

  for await (const line of rl) {
    if (line.includes('<COMPO>')) {
      inBlock = true;
      currentBlock = [];
    } else if (line.includes('</COMPO>')) {
      inBlock = false;
      const blockStr = currentBlock.join('\n');
      const alimMatch = /<alim_code>\s*(\d+)\s*<\/alim_code>/.exec(blockStr);
      const constMatch = /<const_code>\s*(\d+)\s*<\/const_code>/.exec(blockStr);
      const teneurMatch = /<teneur>\s*([\s\S]*?)\s*<\/teneur>/.exec(blockStr);

      if (alimMatch && constMatch && teneurMatch) {
        const alimCode = alimMatch[1].trim();
        const constCode = constMatch[1].trim();
        const value = parseValue(teneurMatch[1]);

        if (aliments[alimCode]) {
          switch (constCode) {
            case CODES.energy: aliments[alimCode].energy_kcal = value; break;
            case CODES.protein: aliments[alimCode].protein_g = value; break;
            case CODES.carbs: aliments[alimCode].carbohydrates_g = value; break;
            case CODES.fat: aliments[alimCode].fat_g = value; break;
            case CODES.fiber: aliments[alimCode].fiber_g = value; break;
          }
        }
      }
    } else if (inBlock) {
      currentBlock.push(line);
    }
  }
}

async function main() {
  console.log('Parsing aliments 2025...');
  const aliments = await parseAliments();
  console.log(`Found ${Object.keys(aliments).length} aliments.`);

  console.log('Parsing compositions 2025 (69MB, please wait)...');
  await parseComposition(aliments);

  console.log('Saving to JSON...');
  const result = Object.values(aliments);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
  console.log('Done!');
}

main().catch(console.error);
