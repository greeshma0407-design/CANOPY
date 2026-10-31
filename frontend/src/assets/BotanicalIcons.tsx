import React from 'react';

export const CanopyLogo: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Canopy logo"
  >
    {/* Stylized layered botanical canopy leaves */}
    <path
      d="M18 3C11 9 6 17 8 26C10 32 17 33 18 33C19 33 26 32 28 26C30 17 25 9 18 3Z"
      fill="#A5B58B"
      fillOpacity="0.25"
      stroke="#A5B58B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 7C14 12 11 18 12 24C13.5 28.5 17 29.5 18 29.5C19 29.5 22.5 28.5 24 24C25 18 22 12 18 7Z"
      fill="#A5B58B"
      fillOpacity="0.5"
    />
    <path
      d="M18 12V32"
      stroke="#101410"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M18 17L13 21"
      stroke="#101410"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M18 22L23 26"
      stroke="#101410"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const CampusTreeIllustration: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 240 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ width: '100%', height: 'auto', opacity: 0.6 }}
  >
    {/* Subtle botanical line art illustration for sidebar footer */}
    <path d="M10 95H230" stroke="#303A30" strokeWidth="1.5" strokeDasharray="3 3" />
    {/* Left Tree */}
    <path d="M40 95V55" stroke="#6B705C" strokeWidth="2" strokeLinecap="round" />
    <circle cx="40" cy="45" r="18" fill="#A5B58B" fillOpacity="0.15" stroke="#6B705C" strokeWidth="1.2" />
    <circle cx="34" cy="40" r="12" fill="#A5B58B" fillOpacity="0.2" />
    {/* Center High Canopy */}
    <path d="M120 95V40" stroke="#A5B58B" strokeWidth="2.5" strokeLinecap="round" />
    <path
      d="M120 20C95 20 85 45 95 62C105 68 135 68 145 62C155 45 145 20 120 20Z"
      fill="#A5B58B"
      fillOpacity="0.18"
      stroke="#A5B58B"
      strokeWidth="1.5"
    />
    <path d="M110 52C115 48 125 48 130 52" stroke="#6B705C" strokeWidth="1.5" strokeLinecap="round" />
    {/* Right Tree */}
    <path d="M190 95V60" stroke="#6B705C" strokeWidth="2" strokeLinecap="round" />
    <polygon points="190,35 172,62 208,62" fill="#D4A373" fillOpacity="0.15" stroke="#D4A373" strokeWidth="1.2" />
    <polygon points="190,50 176,72 204,72" fill="#D4A373" fillOpacity="0.2" stroke="#D4A373" strokeWidth="1.2" />
    {/* Birds / subtle organic accents */}
    <path d="M70 25C73 23 76 25 79 23" stroke="#A7ADA1" strokeWidth="1" strokeLinecap="round" />
    <path d="M165 28C168 26 171 28 174 26" stroke="#A7ADA1" strokeWidth="1" strokeLinecap="round" />
  </svg>
);
