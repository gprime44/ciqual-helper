import React, { useState } from 'react';
import './App.css';
import FoodSearch from './components/FoodSearch';
import RecipeSearch from './components/RecipeSearch';
import MealSummary from './components/MealSummary';
import DataStats from './components/DataStats';
import PathologySelector from './components/PathologySelector';
import { Food, MealItem, Pathology } from './types/ciqual';

// Import des nouvelles données
import foodsData from './data/foods.json';
import nutrientsData from './data/nutrients.json';
import compositionsData from './data/compositions.json';
import pathologiesData from './data/pathologies.json';

const foods = foodsData as Food[];
const compositions = compositionsData as any;
const nutrientsDataTyped = nutrientsData as any[];
const pathologies = pathologiesData as unknown as Pathology[];

const foodCount = foods.length;
const nutrientCount = nutrientsDataTyped.length;
const compositionCount = Object.keys(compositions).length;

function App() {
  const [mealItems, setMealItems] = useState<MealItem[]>([]);
  const [selectedPathologyId, setSelectedPathologyId] = useState<string | null>(null);

  const selectedPathology = pathologies.find(p => p.id === selectedPathologyId) || null;

  const addFoodToMeal = (food: Food, weight_g: number = 100) => {
    const existingItem = mealItems.find((item) => item.id === food.id);
    if (existingItem) {
      setMealItems(
        mealItems.map((item) =>
          item.id === food.id ? { ...item, weight_g: item.weight_g + weight_g } : item
        )
      );
    } else {
      setMealItems([...mealItems, { ...food, weight_g }]);
    }
  };

  const removeFoodFromMeal = (id: string) => {
    setMealItems(mealItems.filter((item) => item.id !== id));
  };

  const updateFoodWeight = (id: string, weight: number) => {
    setMealItems(
      mealItems.map((item) =>
        item.id === id ? { ...item, weight_g: weight } : item
      )
    );
  };

  const replaceFoodInMeal = (oldId: string, newFood: Food) => {
    setMealItems(
      mealItems.map((item) =>
        item.id === oldId ? { ...newFood, weight_g: item.weight_g } : item
      )
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-titles">
          <div className="title-row">
            <h1>Assistant CIQUAL</h1>
            <span className="pro-badge">Usage Médical</span>
          </div>
          <p>Composition nutritionnelle (Données 2025)</p>
        </div>
        
        <DataStats 
          foodCount={foodCount} 
          nutrientCount={nutrientCount} 
          compositionCount={compositionCount} 
        />

        <div className="header-controls">
          <PathologySelector 
            pathologies={pathologies}
            selectedPathologyId={selectedPathologyId}
            onSelectPathology={setSelectedPathologyId}
          />
        </div>
      </header>
      <main className="App-main">
        <div className="container">
          <div className="sidebar">
            <FoodSearch foodData={foods} onAddFood={addFoodToMeal} />
            <div className="sidebar-divider"></div>
            <RecipeSearch foodData={foods} onAddFood={addFoodToMeal} />
          </div>
          <MealSummary
            mealItems={mealItems}
            allFoods={foods}
            compositions={compositions}
            nutrients={nutrientsDataTyped}
            selectedPathology={selectedPathology}
            onRemoveItem={removeFoodFromMeal}
            onUpdateWeight={updateFoodWeight}
            onReplaceItem={replaceFoodInMeal}
          />
        </div>
      </main>
      <footer className="App-footer">
        <p>Source des données : Table CIQUAL 2025 (ANSES)</p>
      </footer>
    </div>
  );
}

export default App;
