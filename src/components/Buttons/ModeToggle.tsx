import React from 'react';

type ModeToggleProps = {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
};

const ModeToggle: React.FC<ModeToggleProps> = ({ enabled, onToggle }) => {
  return (
    <button
      className={`random-toggle${enabled ? ' random-on' : ''}`}
      onClick={() => onToggle(!enabled)}
    >
      <span className={`random-toggle-text${enabled ? ' random-on' : ''}`}>
        {enabled ? 'ON' : 'OFF'}
      </span>
    </button>
  );
};

export default ModeToggle;
