import React from 'react';

type HowToPlayButtonProps = {
  onClick: () => void;
};

const HowToPlayButton: React.FC<HowToPlayButtonProps> = ({ onClick }) => (
  <button className="splash-howtoplay-btn" onClick={onClick}>
    ?
  </button>
);

export default HowToPlayButton;