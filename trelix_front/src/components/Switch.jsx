import React, { useState } from 'react';
import SignupStudent from './Instructor/Signup';
import SignupInstructor from './Student/Signup';
import process from 'process';

const basePath = process.env.PUBLIC_URL;

function Switch() {
  const [isInstructor, setIsInstructor] = useState(true);

  const toggleSignup = () => {
    setIsInstructor(!isInstructor);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Votre fichier CSS pour le switch */}
      <link rel="stylesheet" href={`${basePath}/assets/css/Switch.css`} />

      {/* --- 1) Le switch seul, centré en haut en position absolue --- */}
      <div
        style={{
          position: 'absolute',
          top: '20px',              // Espace depuis le haut
          left: '50%',             // Centre horizontalement
          transform: 'translateX(-50%)',
          zIndex: 9999             // Au-dessus du contenu
        }}
      >
        <label className="switch">
          <input
            type="checkbox"
            checked={!isInstructor}
            onChange={toggleSignup}
          />
          <span className="slider"></span>
        </label>
      </div>

    
      {/* --- 3) Le reste du contenu (formulaires, images, etc.) --- */}
      <div style={{ paddingTop: '20px' }}>
        {isInstructor ? <SignupInstructor /> : <SignupStudent />}
      </div>
    </div>
  );
}

export default Switch;
