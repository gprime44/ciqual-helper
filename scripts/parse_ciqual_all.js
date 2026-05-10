const fs = require('fs');
const readline = require('readline');
const path = require('path');

const DATA_DIR = 'ciqual_data_2025';
const ALIM_FILE = path.join(DATA_DIR, 'alim_2025_11_03.xml');
const COMPO_FILE = path.join(DATA_DIR, 'compo_2025_11_03.xml');
const CONST_FILE = path.join(DATA_DIR, 'const_2025_11_03.xml');
const GRP_FILE = path.join(DATA_DIR, 'alim_grp_2025_11_03.xml');

const OUTPUT_DIR = 'src/data';

function parseValue(val) {
  if (!val) return 0;
  let cleanVal = val.replace('<', '').replace(',', '.').trim();
  if (cleanVal === '-' || cleanVal.toLowerCase() === 'tr' || cleanVal === '') return 0;
  const num = parseFloat(cleanVal);
  return isNaN(num) ? 0 : num;
}

async function parseNutrients() {
  const content = fs.readFileSync(CONST_FILE, 'utf8');
  const nutrients = {};
  const constRegex = /<CONST>([\s\S]*?)<\/CONST>/g;
  let match;
  while ((match = constRegex.exec(content)) !== null) {
    const block = match[1];
    const codeMatch = /<const_code>\s*(\d+)\s*<\/const_code>/.exec(block);
    const nameMatch = /<const_nom_fr>\s*([\s\S]*?)\s*<\/const_nom_fr>/.exec(block);
    
    if (codeMatch && nameMatch) {
      const id = codeMatch[1].trim();
      const fullName = nameMatch[1].trim();
      
      // Tentative d'extraire l'unité entre parenthèses à la fin
      let name = fullName;
      let unit = '';
      const unitMatch = /\(([^)]+)\)$/.exec(fullName);
      if (unitMatch) {
        unit = unitMatch[1];
        name = fullName.replace(/\s*\([^)]+\)$/, '').trim();
      }
      
      nutrients[id] = { id, name, unit };
    }
  }
  return nutrients;
}

async function parseGroups() {
  const content = fs.readFileSync(GRP_FILE, 'utf8');
  const groups = {};
  const grpRegex = /<ALIM_GRP>([\s\S]*?)<\/ALIM_GRP>/g;
  let match;
  while ((match = grpRegex.exec(content)) !== null) {
    const block = match[1];
    const grpCode = /<alim_grp_code>\s*(\d+)\s*<\/alim_grp_code>/.exec(block)?.[1]?.trim();
    const grpNom = /<alim_grp_nom_fr>\s*([\s\S]*?)\s*<\/alim_grp_nom_fr>/.exec(block)?.[1]?.trim();
    const ssGrpCode = /<alim_ssgrp_code>\s*(\d+)\s*<\/alim_ssgrp_code>/.exec(block)?.[1]?.trim();
    const ssGrpNom = /<alim_ssgrp_nom_fr>\s*([\s\S]*?)\s*<\/alim_ssgrp_nom_fr>/.exec(block)?.[1]?.trim();
    
    if (ssGrpCode) {
      groups[ssGrpCode] = { grpNom, ssGrpNom };
    }
  }
  return groups;
}

async function parseFoods(groups) {
  const content = fs.readFileSync(ALIM_FILE, 'utf8');
  const foods = [];
  const alimRegex = /<ALIM>([\s\S]*?)<\/ALIM>/g;
  let match;
  while ((match = alimRegex.exec(content)) !== null) {
    const block = match[1];
    const id = /<alim_code>\s*(\d+)\s*<\/alim_code>/.exec(block)?.[1]?.trim();
    const name = /<alim_nom_fr>\s*([\s\S]*?)\s*<\/alim_nom_fr>/.exec(block)?.[1]?.trim();
    const ssGrpCode = /<alim_ssgrp_code>\s*(\d+)\s*<\/alim_ssgrp_code>/.exec(block)?.[1]?.trim();
    
    if (id && name) {
      foods.push({
        id,
        name,
        group: groups[ssGrpCode]?.grpNom || '',
        subgroup: groups[ssGrpCode]?.ssGrpNom || ''
      });
    }
  }
  return foods;
}

async function parseCompositions() {
  const fileStream = fs.createReadStream(COMPO_FILE, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const compositions = {};
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
        const alimId = alimMatch[1].trim();
        const constId = constMatch[1].trim();
        const value = parseValue(teneurMatch[1]);

        if (value !== 0) { // On n'enregistre pas les valeurs nulles pour économiser de la place
          if (!compositions[alimId]) compositions[alimId] = {};
          compositions[alimId][constId] = value;
        }
      }
    } else if (inBlock) {
      currentBlock.push(line);
    }
  }
  return compositions;
}

async function main() {
  console.log('Parsing nutrients...');
  const nutrients = await parseNutrients();
  
  console.log('Parsing groups...');
  const groups = await parseGroups();
  
  console.log('Parsing foods...');
  const foods = await parseFoods(groups);
  
  console.log('Parsing all compositions (may take a minute)...');
  const compositions = await parseCompositions();

  console.log('Saving files...');
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'foods.json'), JSON.stringify(foods, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'nutrients.json'), JSON.stringify(Object.values(nutrients), null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'compositions.json'), JSON.stringify(compositions, null, 2));
  
  console.log('Extraction complete!');
  console.log(`Foods: ${foods.length}`);
  console.log(`Nutrients tracked: ${Object.keys(nutrients).length}`);
}

main().catch(console.error);
