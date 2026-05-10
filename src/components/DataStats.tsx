import React from 'react';

interface DataStatsProps {
  foodCount: number;
  nutrientCount: number;
  compositionCount: number;
}

const DataStats: React.FC<DataStatsProps> = ({ foodCount, nutrientCount, compositionCount }) => {
  return (
    <div className="data-stats">
      <div className="stat-item">
        <span className="stat-value">{foodCount.toLocaleString()}</span>
        <span className="stat-label">Aliments</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{compositionCount.toLocaleString()}</span>
        <span className="stat-label">Compositions</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{nutrientCount.toLocaleString()}</span>
        <span className="stat-label">Nutriments</span>
      </div>
    </div>
  );
};

export default DataStats;
