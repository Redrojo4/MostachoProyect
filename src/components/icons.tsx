import React from 'react';

const SVGIcon: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    {children}
  </svg>
);

export const TableIcon: React.FC<{ className?: string }> = ({ className = 'h-8 w-8' }) => (
  <SVGIcon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </SVGIcon>
);

export const LogoutIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
  <SVGIcon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </SVGIcon>
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
  <SVGIcon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </SVGIcon>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
  <SVGIcon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </SVGIcon>
);

export const ArrowRightIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
  <SVGIcon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </SVGIcon>
);

export const BanIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
  <SVGIcon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </SVGIcon>
);

export const PencilIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
  <SVGIcon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L15.232 5.232z" />
  </SVGIcon>
);
