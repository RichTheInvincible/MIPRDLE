import React from 'react';

type SubmitButtonProps = {
  onClick: () => void;
  disabled: boolean;
  text?: string;
};

const SubmitButton: React.FC<SubmitButtonProps> = ({ onClick, disabled, text = 'GO!' }) => (
  <button className="submit-button" onClick={onClick} disabled={disabled}>
    {text}
  </button>
);

export default SubmitButton;
