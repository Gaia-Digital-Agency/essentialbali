import React from 'react';

const Advertisement: React.FC = () => {
  return (
    <div style={{
      border: '2px dashed #007bff',
      padding: '10px',
      backgroundColor: '#f0f8ff',
      textAlign: 'center',
      margin: '1em 0',
      userSelect: 'none' // Prevent user from selecting text inside
    }}>
      <p style={{ margin: 0, fontWeight: 'bold', color: '#007bff' }}>
        🖼️ Advertisement Placeholder
      </p>
    </div>
  );
};

export default Advertisement;