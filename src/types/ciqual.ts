export interface Food {
  id: string;
  name: string;
  group: string;
  subgroup: string;
}

export interface Nutrient {
  id: string;
  name: string;
  unit: string;
}

export interface CompositionMap {
  [foodId: string]: {
    [nutrientId: string]: number;
  };
}

export interface MealItem extends Food {
  weight_g: number;
}

export interface NutritionalTotals {
  [nutrientId: string]: number;
}

export interface RecommendationThreshold {
  max?: number; // Alert if value > max
  min?: number; // Alert if value < min
}

export interface Pathology {
  id: string;
  name: string;
  description: string;
  monitoredNutrients: string[];
  goals?: { [nutrientId: string]: 'increase' | 'decrease' };
  recommendations?: { [nutrientId: string]: RecommendationThreshold };
}
