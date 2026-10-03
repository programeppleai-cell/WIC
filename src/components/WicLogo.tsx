import React from 'react';

interface WicLogoProps {
  className?: string;
  size?: number;
}

export const WicLogo: React.FC<WicLogoProps> = ({ className = '', size = 44 }) => {
  return (
    <div 
      className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      title="Worth It Circle (WIC)"
    >
      <svg
        viewBox="0 0 400 400"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          <radialGradient id="wicSphereGrad" cx="35%" cy="30%" r="65%" fx="30%" fy="25%">
            <stop offset="0%" stopColor="#25754a" />
            <stop offset="35%" stopColor="#124e30" />
            <stop offset="70%" stopColor="#0a351f" />
            <stop offset="100%" stopColor="#04180d" />
          </radialGradient>

          <radialGradient id="wicSpecular" cx="38%" cy="28%" r="45%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="wicInnerDisc" cx="45%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#222222" />
            <stop offset="85%" stopColor="#111111" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>

          <linearGradient id="wicRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* 3D Dark Emerald Sphere */}
        <circle cx="200" cy="200" r="185" fill="url(#wicSphereGrad)" />
        <circle cx="200" cy="200" r="184" fill="none" stroke="url(#wicRim)" strokeWidth="2" />

        {/* Specular gloss highlight */}
        <ellipse cx="180" cy="140" rx="140" ry="90" fill="url(#wicSpecular)" />

        {/* Center dark disc */}
        <circle cx="200" cy="200" r="115" fill="url(#wicInnerDisc)" stroke="#092014" strokeWidth="2" />

        {/* Cursive wic text & arrow line */}
        <g id="wic-lettering">
          <path
            d="M 85 258 C 115 250, 135 240, 148 220 C 153 212, 156 195, 142 196 C 130 197, 133 234, 152 230 C 163 228, 172 208, 177 195 C 182 185, 187 186, 181 202 C 173 222, 178 228, 192 225 C 205 222, 218 190, 222 178 C 224 172, 228 174, 227 185 C 224 207, 228 224, 240 220 C 253 216, 260 196, 252 175 C 242 150, 220 180, 220 198 C 220 222, 248 214, 265 198 C 290 174, 320 148, 342 128"
            fill="none"
            stroke="#ffffff"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Dot for 'i' */}
          <circle cx="218" cy="158" r="7.5" fill="#ffffff" />
          {/* Arrow Head */}
          <polygon points="356,118 335,123 346,138" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
};
