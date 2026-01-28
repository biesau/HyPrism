import React from 'react';

interface CoffeeIconProps {
  size?: number;
  className?: string;
}

export const CoffeeIcon: React.FC<CoffeeIconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Coffee cup body */}
      <path
        d="M3 8H17V18C17 19.1046 16.1046 20 15 20H5C3.89543 20 3 19.1046 3 18V8Z"
        fill="#FFD700"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Cup handle */}
      <path
        d="M17 10H19C20.1046 10 21 10.8954 21 12C21 13.1046 20.1046 14 19 14H17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Steam lines */}
      <path
        d="M7 4C7 4 7.5 5 7 6C6.5 7 7 8 7 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M10 3C10 3 10.5 4 10 5C9.5 6 10 7 10 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M13 4C13 4 13.5 5 13 6C12.5 7 13 8 13 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Coffee liquid */}
      <ellipse
        cx="10"
        cy="11"
        rx="5"
        ry="2"
        fill="#8B4513"
        opacity="0.7"
      />
    </svg>
  );
};

export default CoffeeIcon;
