import React from 'react';
import { sanitizeExternalUrl } from '../../types/cms';

interface LeaderCrestProps {
  nameAr: string;
  nameEn: string;
  photoUrl?: string;
  isPrimary?: boolean;
}

export function LeaderCrest({ nameAr, nameEn, photoUrl, isPrimary }: LeaderCrestProps) {
  const safePhoto = sanitizeExternalUrl(photoUrl);

  const initials = nameEn
    .split(/\s+/)
    .filter((w) => w.length > 1 && !w.endsWith('.'))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || 'HC';

  if (safePhoto) {
    return (
      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gold-400/40 bg-navy-900 shrink-0">
        <img src={safePhoto} alt={nameAr} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold tracking-wider text-lg shrink-0 border ${
        isPrimary
          ? 'bg-gradient-to-br from-gold-300/20 to-navy-800 border-gold-400/60 text-gold-300'
          : 'bg-navy-900 border-slate-700 text-gold-300'
      }`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
