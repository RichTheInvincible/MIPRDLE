import React from 'react';
import '../styles/HowToPlayModal.css';
import { HowToPlayContent, SPLASH_CONTENT } from '../data/howToPlayContent';

interface HowToPlayModalProps {
  onClose: () => void;
  content?: HowToPlayContent;
}

const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose, content = SPLASH_CONTENT }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{content.title}</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {content.sections.map((section, index) => (
            <section key={index}>
              <h3>{section.heading}</h3>
              {section.content}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowToPlayModal;
