import React from 'react';
import '../styles/TitleGroup.css';

interface TitleGroupProps {
  title: React.ReactNode;
  subtitle?: string;
  showTiltCard?: boolean;
  tiltCardImage?: string;
  className?: string;
}

const TitleGroup: React.FC<TitleGroupProps> = ({ 
  title, 
  subtitle, 
  showTiltCard = false,
  tiltCardImage,
  className = 'game-title'
}) => {
  return (
    <div className="title-group">
      <div className="title-circle-bg"></div>
      {showTiltCard && tiltCardImage && (
        <div 
          className="title-image"
          style={{
            backgroundImage: `url(${tiltCardImage})`,
            width: '300px',
            height: '300px'
          }}
        />
      )}
      <h2 className={className}>
        <span>{title}</span>
        {subtitle && <span>{subtitle}</span>}
      </h2>
    </div>
  );
};

export default TitleGroup;
