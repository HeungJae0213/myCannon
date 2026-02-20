import React from 'react';
import '../assets/WelcomeBall.css';

interface WelcomeBallProps {
  number: number;
  size?: number;
}

const WelcomeBall = ({ number, size = 220 }: WelcomeBallProps) => {
  return (
    <div className="welcome-ball-3d" style={{ width: size, height: size }}>
      <div className="welcome-ball-number">
        <span>{number}</span>
      </div>
    </div>
  );
};

export default WelcomeBall;
