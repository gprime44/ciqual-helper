export const translateText = async (text: string, from: string, to: string): Promise<string> => {
  if (!text || from === to) return text;
  
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
    );
    
    if (!response.ok) {
      console.warn('Echec MyMemory, retour texte original');
      return text;
    }
    
    const data = await response.json();
    const translated = data.responseData.translatedText || text;
    console.log(`Translation [${from}->${to}]: ${text} -> ${translated}`);
    return translated;
  } catch (error) {
    console.error('Erreur de traduction:', error);
    return text;
  }
};

export const translateArray = async (terms: string[], from: string, to: string): Promise<string[]> => {
  if (terms.length === 0) return [];
  
  const separator = " ||| ";
  const combinedText = terms.join(separator);
  
  const translatedCombined = await translateText(combinedText, from, to);
  return translatedCombined.split(separator).map(t => t.trim());
};
