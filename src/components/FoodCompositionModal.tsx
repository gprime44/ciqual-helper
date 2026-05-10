import React from 'react';
import { Food, Nutrient, CompositionMap, Pathology } from '../types/ciqual';
import { getBetterAlternatives } from '../utils/recommendations';

interface FoodCompositionModalProps {
  food: Food;
  allFoods: Food[];
  compositions: CompositionMap;
  nutrients: Nutrient[];
  selectedPathology: Pathology | null;
  onClose: () => void;
  onSelectAlternative?: (food: Food) => void;
}

const CATEGORIES: { [key: string]: string[] } = {
  'Energie': ['327', '328', '332', '333'],
  'Macronutriments': ['400', '25000', '25003', '31000', '40000', '34100', '60000', '65000', '10000'],
  'Glucides & Sucres': ['31000', '32000', '32210', '32220', '32250', '32410', '32430', '32480', '33110', '34000'],
  'Lipides & Acides Gras': ['40000', '40302', '40303', '40304', '75100'],
  'Minéraux & Oligo-éléments': ['10004', '10110', '10120', '10150', '10170', '10190', '10200', '10251', '10260', '10290', '10300', '10340', '10530'],
  'Vitamines': ['51104', '51200', '51330', '52100', '52200', '52300', '53100', '54101', '54104', '55100', '56100', '56200', '56310', '56400', '56500', '56600', '56700', '71010']
};

const FoodCompositionModal: React.FC<FoodCompositionModalProps> = ({
  food,
  allFoods,
  compositions,
  nutrients,
  selectedPathology,
  onClose,
  onSelectAlternative,
}) => {
  const foodCompo = compositions[food.id] || {};
  const monitoredNutrientsSet = new Set(selectedPathology?.monitoredNutrients || []);
  
  const alternatives = selectedPathology 
    ? getBetterAlternatives(food, selectedPathology, allFoods, compositions)
    : [];

  const getNutrientInfo = (id: string) => nutrients.find(n => n.id === id);

  const categorizedIds = new Set(Object.values(CATEGORIES).flat());
  const otherNutrientIds = Object.keys(foodCompo).filter(id => !categorizedIds.has(id));

  const renderNutrientCard = (id: string) => {
    const info = getNutrientInfo(id);
    const value = foodCompo[id];
    if (!info || value === undefined) return null;

    const isMonitored = monitoredNutrientsSet.has(id);
    const recommendation = selectedPathology?.recommendations?.[id];
    
    let warningType: 'high' | 'low' | null = null;
    let percentage = 0;
    let targetValue = 0;

    if (recommendation) {
      if (recommendation.max !== undefined && value > recommendation.max) {
        warningType = 'high';
        targetValue = recommendation.max;
        percentage = (value / recommendation.max) * 100;
      } else if (recommendation.min !== undefined && value < recommendation.min) {
        warningType = 'low';
        targetValue = recommendation.min;
        percentage = (value / recommendation.min) * 100;
      }
    }

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
          {value.toLocaleString()}{' '}
          <small>{info.unit.replace(/\s*\/100\s*g/g, '')}</small>
        </span>
        {warningType && (
          <div className="warning-icon tooltip">
            ⚠️ {warningType === 'high' ? '📈' : '📉'}
            <span className="tooltiptext">
              {warningType === 'high' 
                ? `Cet aliment représente à lui seul ${percentage.toFixed(0)}% de la limite du repas (Cible : max ${targetValue}${info.unit.replace(/\s*\/100\s*g/g, '')})` 
                : `Cet aliment ne couvre que ${percentage.toFixed(0)}% du besoin du repas (Cible : min ${targetValue}${info.unit.replace(/\s*\/100\s*g/g, '')})`}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-titles">
            <h2>{food.name}</h2>
            <p>Composition nutritionnelle pour 100g</p>
          </div>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {alternatives.length > 0 && (
            <div className="recommendations-section">
              <h3>💡 Alternatives recommandées (même groupe)</h3>
              <p className="recommendations-intro">D'après le profil patient sélectionné, ces aliments pourraient être plus adaptés :</p>
              <div className="alternatives-list">
                {alternatives.map(alt => (
                  <div key={alt.food.id} className="alternative-item">
                    <div className="alternative-info">
                      <span className="alt-name">{alt.food.name}</span>
                      <span className="alt-score tooltip">
                        Indice d'amélioration : {alt.score.toFixed(1)}
                        <span className="tooltiptext">
                          Ce score représente le gain nutritionnel cumulé basé sur vos objectifs (ex: moins de sucres, plus de fibres). Plus l'indice est élevé, plus l'alternative est bénéfique pour votre pathologie.
                        </span>
                      </span>
                    </div>
                    {onSelectAlternative && (
                      <button 
                        className="btn-replace"
                        onClick={() => onSelectAlternative(alt.food)}
                      >
                        Remplacer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.entries(CATEGORIES).map(([catName, ids]) => {
            const cards = ids.map(id => renderNutrientCard(id)).filter(Boolean);
            if (cards.length === 0) return null;

            return (
              <div key={catName} className="nutrient-category">
                <h3>{catName}</h3>
                <div className="nutrients-grid">
                  {cards}
                </div>
              </div>
            );
          })}

          {otherNutrientIds.length > 0 && (
            <div className="nutrient-category">
              <h3>Autres</h3>
              <div className="nutrients-grid">
                {otherNutrientIds.map(id => renderNutrientCard(id))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCompositionModal;
