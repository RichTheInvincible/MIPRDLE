import { useEffect } from 'react';
import meleeCursor from '../images/assets/melee_cursor.png';

export const useCustomCursor = (containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
      position: fixed;
      width: 150px;
      height: 150px;
      background-image: url(${meleeCursor});
      background-size: contain;
      background-repeat: no-repeat;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      display: none;
    `;
    document.body.appendChild(cursor);

    const handleMouseMove = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      cursor.style.display = 'block';
    };

    const handleMouseLeave = () => {
      cursor.style.display = 'none';
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      cursor.remove();
    };
  }, [containerRef]);
};
