import React from 'react';

interface CannonBodyProps {
  width?: number;
  height?: number;
}

const CannonBody = ({ width = 220, height = 120 }: CannonBodyProps) => (
  <img
    src="/cannon.png"
    alt="Cannon"
    width={width}
    height={height}
    style={{ display: 'block', margin: '0 auto', objectFit: 'contain' }}
  />
);

export default CannonBody;
