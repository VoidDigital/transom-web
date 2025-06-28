import React from 'react';

interface OmegaLogoProps {
  className?: string;
  size?: number;
}

export function OmegaLogo({ className = "", size = 24 }: OmegaLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M12 3C7.03 3 3 7.03 3 12c0 3.5 2 6.5 4.9 8L6.5 22h3.2l1.3-1.5c0.3-0.03 0.7-0.05 1-0.05s0.7 0.02 1 0.05L14.3 22h3.2l-1.4-2c2.9-1.5 4.9-4.5 4.9-8 0-4.97-4.03-9-9-9zm0 3c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6zm0 2c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" 
        fill="currentColor"
      />
    </svg>
  );
}