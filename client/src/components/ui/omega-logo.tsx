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
      fill="none" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M3 20h4l2-6.5c0-3.5 2-6.5 5-6.5s5 3 5 6.5L21 20h4M8 20l3-9M16 20l-3-9" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}