import React from 'react';

type HardModeToggleProps = {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
};

const HardModeToggle: React.FC<HardModeToggleProps> = ({ enabled, onToggle }) => {
  return (
    <button
      className={`hardmode-toggle${enabled ? ' hardmode-on' : ''}`}
      onClick={() => onToggle(!enabled)}
    >
      <span className={`hardmode-toggle-text${enabled ? ' hardmode-on' : ''}`}>{enabled ? 'OFF' : 'ON'}</span>
    </button>
  );
};

export default HardModeToggle;