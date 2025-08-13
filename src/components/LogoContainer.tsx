import React from 'react';

interface LogoContainerProps {
  src: string;     // Logo image URL
  zoom?: number;   // Scale factor for logo only
  height?: number; // Fixed height (matches toggle button)
  width?: number;  // Controllable width
}

const LogoContainer: React.FC<LogoContainerProps> = ({ 
  src, 
  zoom = 1, 
  height = 48,
  width = 80  // default width, adjustable
}) => {
  return (
    <div
      className="rounded-3xl overflow-hidden flex items-center justify-center bg-white shadow-lg border"
      style={{
        height: `${height}px`,
        width: `${width}px`,     // now controllable
        padding: '0 12px',
      }}
    >
      <img
        src={src}
        alt="Logo"
        style={{
          height: `${height * zoom}px`,  // slightly smaller than container for padding
          width: 'auto',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};

export default LogoContainer;