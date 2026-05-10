import React, { useState } from 'react';
import { MealItem, Nutrient, NutritionalTotals, CompositionMap, Food, Pathology } from '../types/ciqual';
import FoodCompositionModal from './FoodCompositionModal';

interface MealSummaryProps {
  mealItems: MealItem[];
  allFoods: Food[];
  compositions: CompositionMap;
  nutrients: Nutrient[];
  selectedPathology: Pathology | null;
  onRemoveItem: (id: string) => void;
  onUpdateWeight: (id: string, weight: number) => void;
  onReplaceItem: (oldId: string, newFood: Food) => void;
}

const MAJOR_NUTRIENTS = ['328', '25000', '31000', '32000', '40000', '40302', '34100', '10004'];

const MealSummary: React.FC<MealSummaryProps> = ({
  mealItems,
  allFoods,
  compositions,
  nutrients,
  selectedPathology,
  onRemoveItem,
  onUpdateWeight,
  onReplaceItem,
}) => {
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  const calculateTotals = (): NutritionalTotals => {
    const totals: NutritionalTotals = {};
    
    mealItems.forEach((item) => {
      const foodCompo = compositions[item.id] || {};
      const factor = item.weight_g / 100;
      
      Object.entries(foodCompo).forEach(([nutrientId, value]) => {
        totals[nutrientId] = (totals[nutrientId] || 0) + value * factor;
      });
    });
    
    return totals;
  };

  const totals = calculateTotals();

  const getNutrientInfo = (id: string) => {
    return nutrients.find((n) => n.id === id);
  };

  const handleReplace = (oldId: string, newFood: Food) => {
    onReplaceItem(oldId, newFood);
    setSelectedFood(null);
  };

  // On combine les nutriments majeurs et ceux de la pathologie
  const monitoredNutrientsSet = new Set(selectedPathology?.monitoredNutrients || []);
  const displayNutrients = Array.from(new Set([
    ...MAJOR_NUTRIENTS,
    ...Array.from(monitoredNutrientsSet)
  ]));

  return (
    <div className="meal-summary">
      <h2>Votre Repas</h2>
      {mealItems.length === 0 ? (
        <p>Aucun aliment ajouté pour le moment.</p>
      ) : (
        <>
          <table className="meal-table">
            <thead>
              <tr>
                <th>Aliment</th>
                <th>Poids (g)</th>
                <th>Kcal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mealItems.map((item) => {
                const kcal = (compositions[item.id]?.['328'] || 0) * (item.weight_g / 100);
                return (
                  <tr key={item.id}>
                    <td>
                      <div className="meal-item-name">{item.name}</div>
                      <div className="meal-item-group">{item.group}</div>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.weight_g}
                        onChange={(e) =>
                          onUpdateWeight(item.id, parseFloat(e.target.value) || 0)
                        }
                      />
                    </td>
                    <td>{kcal.toFixed(1)}</td>
                    <td>
                      <div className="button-group">
                        <button 
                          className="btn-info" 
                          onClick={() => setSelectedFood(item)}
                          title="Détails"
                        >
                          🔍 <span className="btn-text">Détails</span>
                        </button>
                        <button 
                          className="btn-danger" 
                          onClick={() => onRemoveItem(item.id)}
                          title="Supprimer"
                        >
                          🗑️ <span className="btn-text">Supprimer</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {selectedFood && (
            <FoodCompositionModal
              food={selectedFood}
              allFoods={allFoods}
              compositions={compositions}
              nutrients={nutrients}
              selectedPathology={selectedPathology}
              onClose={() => setSelectedFood(null)}
              onSelectAlternative={(newFood) => handleReplace(selectedFood.id, newFood)}
            />
          )}
          
          <div className="totals">
            <h3>Bilan nutritionnel détaillé</h3>
            <div className="nutrients-grid">
              {displayNutrients.map((id) => {
                const info = getNutrientInfo(id);
                const value = totals[id] || 0;
                
                const isMonitored = monitoredNutrientsSet.has(id);
                const recommendation = selectedPathology?.recommendations?.[id];
                
                let warningType: 'high' | 'low' | null = null;
                let percentage = 0;
                let targetValue = 0;

                if (recommendation) {
                  if (recommendation.max !== undefined && value > recommendation.max) {
                    warningType = 'high';
                    targetValue = recommendation.max;
                    percentage = ((value - recommendation.max) / recommendation.max) * 100;
                  } else if (recommendation.min !== undefined && value < recommendation.min) {
                    warningType = 'low';
                    targetValue = recommendation.min;
                    percentage = (value / recommendation.min) * 100;
                  }
                }

                if (!info) return null;

                const cardClasses = [
                  'nutrient-card',
                  isMonitored ? 'monitored' : '',
                  warningType ? 'warning' : ''
                ].filter(Boolean).join(' ');

                return (
                  <div key={id} className={cardClasses}>
                    <span className="nutrient-label">
                      {info.name}
                      {isMonitored && ' ✨'}
                    </span>
                    <span className="nutrient-value">
                      {value.toFixed(id === '328' ? 0 : 2)}{' '}
                      <small>{info.unit.replace(/\s*\/100\s*g/g, '')}</small>
                    </span>
                    {warningType && (
                      <div className="warning-icon tooltip">
                        ⚠️ {warningType === 'high' ? '📈' : '📉'}
                        <span className="tooltiptext">
                          {warningType === 'high' 
                            ? `Dépasse la limite de +${percentage.toFixed(0)}% (Cible : max ${targetValue}${info.unit.replace(/\s*\/100\s*g/g, '')})` 
                            : `Seulement ${percentage.toFixed(0)}% de la cible (Cible : min ${targetValue}${info.unit.replace(/\s*\/100\s*g/g, '')})`}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MealSummary;
