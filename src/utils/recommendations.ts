import { Food, CompositionMap, Pathology } from '../types/ciqual';

export interface Recommendation {
  food: Food;
  score: number;
}

export const getBetterAlternatives = (
  currentFood: Food,
  pathology: Pathology,
  allFoods: Food[],
  compositions: CompositionMap
): Recommendation[] => {
  if (!pathology.goals) return [];

  const goals = pathology.goals;
  
  // 1. Trouver les aliments du même sous-groupe
  const peers = allFoods.filter(f => 
    f.subgroup === currentFood.subgroup && 
    f.id !== currentFood.id
  );

  const currentCompo = compositions[currentFood.id] || {};

  // 2. Évaluer chaque "pair" par rapport aux objectifs
  const scoredPeers = peers.map(peer => {
    const peerCompo = compositions[peer.id] || {};
    let score = 0;
    let isBetter = false;

    Object.entries(goals).forEach(([nutrientId, direction]) => {
      const currentValue = currentCompo[nutrientId] || 0;
      const peerValue = peerCompo[nutrientId] || 0;

      if (direction === 'decrease') {
        if (peerValue < currentValue) {
          score += (currentValue - peerValue);
          isBetter = true;
        } else if (peerValue > currentValue) {
          score -= (peerValue - currentValue);
        }
      } else if (direction === 'increase') {
        if (peerValue > currentValue) {
          score += (peerValue - currentValue);
          isBetter = true;
        } else if (peerValue < currentValue) {
          score -= (currentValue - peerValue);
        }
      }
    });

    return { food: peer, score, isBetter };
  });

  // 3. Filtrer ceux qui sont réellement meilleurs et trier par score
  return scoredPeers
    .filter(p => p.isBetter && p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(p => ({ food: p.food, score: p.score }));
};
