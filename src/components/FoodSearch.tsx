import React, { useState } from 'react';
import { Food } from '../types/ciqual';

interface FoodSearchProps {
  foodData: Food[];
  onAddFood: (food: Food) => void;
}

const FoodSearch: React.FC<FoodSearchProps> = ({ foodData, onAddFood }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFood = foodData
    .filter((food) => {
      const searchLower = searchTerm.toLowerCase().trim();
      if (!searchLower) return false;
      
      const searchWords = searchLower.split(/\s+/);
      const foodNameLower = food.name.toLowerCase();
      const foodGroupLower = food.group.toLowerCase();
      
      // Vérifie que chaque mot de la recherche est présent soit dans le nom soit dans le groupe
      return searchWords.every(word => 
        foodNameLower.includes(word) || foodGroupLower.includes(word)
      );
    })
    .slice(0, 100);

  const handleSelect = (food: Food) => {
    onAddFood(food);
    setSearchTerm('');
  };

  return (
    <div className="food-search">
      <h2>Rechercher un aliment</h2>
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder="Chercher un aliment ou un groupe..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button 
            className="reset-button" 
            onClick={() => setSearchTerm('')}
            title="Effacer la recherche"
          >
            &times;
          </button>
        )}
      </div>
      <ul className="search-results">
        {searchTerm && filteredFood.map((food) => (
          <li key={food.id}>
            <div className="food-info">
              <span className="food-name">{food.name}</span>
              <span className="food-group">{food.group} {food.subgroup && `> ${food.subgroup}`}</span>
            </div>
            <button onClick={() => handleSelect(food)}>Ajouter</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FoodSearch;
