import React from 'react';
import { Pathology } from '../types/ciqual';

interface PathologySelectorProps {
  pathologies: Pathology[];
  selectedPathologyId: string | null;
  onSelectPathology: (id: string | null) => void;
}

const PathologySelector: React.FC<PathologySelectorProps> = ({
  pathologies,
  selectedPathologyId,
  onSelectPathology,
}) => {
  return (
    <div className="pathology-selector">
      <label htmlFor="pathology-select">Profil Patient (Pathologie) :</label>
      <select
        id="pathology-select"
        value={selectedPathologyId || ''}
        onChange={(e) => onSelectPathology(e.target.value || null)}
      >
        <option value="">-- Aucune pathologie spécifique --</option>
        {pathologies.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      {selectedPathologyId && (
        <p className="pathology-description">
          {pathologies.find(p => p.id === selectedPathologyId)?.description}
        </p>
      )}
    </div>
  );
};

export default PathologySelector;
