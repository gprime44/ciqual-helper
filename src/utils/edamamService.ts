export interface EdamamIngredient {
  text: string;
  quantity: number;
  measure: string;
  food: string;
  weight: number;
  foodId: string;
}

export interface EdamamRecipe {
  label: string;
  image: string;
  url: string;
  ingredients: EdamamIngredient[];
}

const APP_ID = '7d4d943f';
const APP_KEY = '98832902080f9f1e2fd2be8ea20108f7';

export const searchRecipes = async (query: string): Promise<EdamamRecipe[]> => {
  if (!query) return [];
  
  // Endpoint V1 standard
  const url = `https://api.edamam.com/search?q=${encodeURIComponent(query)}&app_id=${APP_ID}&app_key=${APP_KEY}&from=0&to=10`;

  console.log('--- DIAGNOSTIC EDAMAM ---');
  console.log('URL appelée:', url);

  try {
    const response = await fetch(url);
    console.log('Statut réponse:', response.status);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("L'endpoint API n'existe pas (404). Vérifiez si vous avez activé 'Recipe Search API' sur Edamam.");
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Erreur API (${response.status}): ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.hits ? data.hits.map((hit: any) => hit.recipe) : [];
  } catch (error) {
    console.error('Erreur Service Edamam:', error);
    throw error;
  }
};
