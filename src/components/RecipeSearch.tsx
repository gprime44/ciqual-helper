import React, { useState } from 'react';
import { Food } from '../types/ciqual';
import { searchRecipes, EdamamRecipe, EdamamIngredient } from '../utils/edamamService';
import { translateText, translateArray } from '../utils/translationService';

interface RecipeSearchProps {
  foodData: Food[];
  onAddFood: (food: Food, weight_g: number) => void;
}

const RecipeSearch: React.FC<RecipeSearchProps> = ({ foodData, onAddFood }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recipes, setRecipes] = useState<EdamamRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    try {
      // 1. Traduire la recherche de l'utilisateur (FR -> EN) pour Edamam
      const translatedQuery = await translateText(searchTerm, 'fr', 'en');
      console.log(`Recherche: ${searchTerm} -> ${translatedQuery}`);
      
      const results = await searchRecipes(translatedQuery);
      setRecipes(results);
    } catch (err) {
      setError('Impossible de récupérer les recettes. Vérifiez votre connexion ou vos clés API.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const findBestCiqualMatch = (foodNameFr: string): Food | null => {
    const nameLower = foodNameFr.toLowerCase();
    
    // 1. Recherche exacte
    let match = foodData.find(f => f.name.toLowerCase() === nameLower);
    if (match) return match;

    // 2. Recherche par mot-clé
    const words = nameLower.split(/\s+/).filter(w => w.length > 3);
    if (words.length > 0) {
      match = foodData.find(f => {
        const fName = f.name.toLowerCase();
        return words.every(word => fName.includes(word));
      });
    }

    return match || null;
  };

  const handleAddRecipe = async (recipe: EdamamRecipe) => {
    setLoading(true);
    try {
      // Pour améliorer le matching, on traduit tous les noms d'ingrédients d'un coup (EN -> FR)
      const englishIngredientNames = recipe.ingredients.map(ing => ing.food);
      const translatedNames = await translateArray(englishIngredientNames, 'en', 'fr');
      
      recipe.ingredients.forEach((ing, index) => {
        const translatedName = translatedNames[index] || ing.food;
        const match = findBestCiqualMatch(translatedName);
        
        if (match) {
          onAddFood(match, Math.round(ing.weight));
        } else {
          console.warn(`Aucune correspondance CIQUAL trouvée pour : ${translatedName} (original: ${ing.food})`);
        }
      });
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la recette:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipe-search food-search">
      <h2>Rechercher un plat (API)</h2>
      <form onSubmit={handleSearch} className="search-input-wrapper">
        <input
          type="text"
          placeholder="Ex: Chicken Curry, Lasagna..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? '...' : '🔍'}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      <ul className="search-results">
        {recipes.map((recipe, idx) => (
          <li key={idx} className="recipe-item">
            <div className="food-info">
              <span className="food-name">{recipe.label}</span>
              <span className="food-group">{recipe.ingredients.length} ingrédients</span>
            </div>
            <button className="add-recipe-btn" onClick={() => handleAddRecipe(recipe)}>
              Importer le plat
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecipeSearch;
