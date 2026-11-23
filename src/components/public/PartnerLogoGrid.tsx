import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ExternalLink, Palette, Shield, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PartnerCategory, PartnerItem, sanitizeExternalUrl } from '../../types/cms';
import { InteractiveSpotlightCard, RevealItem } from './MotionPrimitives';

interface PartnerLogoGridProps {
  compact?: boolean;
}

export function PartnerLogoGrid({ compact = false }: PartnerLogoGridProps) {
  const { lang, t, partners } = useApp();
  const reduceMotion = useReducedMotion();
  const [monochromeGold, setMonochromeGold] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | PartnerCategory>('all');
  const [activePartner, setActivePartner] = useState<PartnerItem | null>(null);

  const categories: { key: 'all' | PartnerCategory; labelAr: string; labelEn: string }[] = [
    { key: 'all', labelAr: 'الكل', labelEn: 'All Entities' },
    { key: 'accreditation', labelAr: 'الاعتمادات والتسجيل', labelEn: 'Accreditations' },
    { key: 'trusted_seal', labelAr: 'أختام الثقة', labelEn: 'Trusted Seals' },
    { key: 'consortium', labelAr: 'المانحون والشركاء', labelEn: 'Donors & Partners' },
    { key: 'digital_infra', labelAr: 'البنية التقنية', labelEn: 'Digital & Infra' },
    { key: 'clients_ecosystem', labelAr: 'منظومة الأعمال', labelEn: 'Ecosystem & Clients' },
  ];

  const displayedPartners = useMemo(() => {
    if (categoryFilter === 'all') return partners;
    return partners.filter((p) => p.category === categoryFilter);
  }, [partners, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = categoryFilter === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCategoryFilter(cat.key)}
                className={`relative px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'text-[#040B16]'
                    : 'bg-navy-900 text-slate-300 border border-slate-800 hover:border-gold-400/40'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="partnerCategoryPill"
                    transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#E8CC7D] to-[#D4AF37]"
                  />
                )}
                <span className="relative z-10">
                  {lang === 'ar' ? cat.labelAr : cat.labelEn}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setMonochromeGold((prev) => !prev)}
          className="px-3.5 py-2 rounded-lg bg-navy-900 border border-gold-400/30 text-xs font-bold text-gold-300 hover:bg-navy-800 transition-colors inline-flex items-center gap-2 self-start md:self-auto whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Palette className="w-3.5 h-3.5" />
          <span>
            {monochromeGold
              ? t('النمط: ذهبي موحّد (عرض بالألوان)', 'Style: Gold Monochrome (Show Original)')
              : t('النمط: الألوان الرسمية (عرض ذهبي)', 'Style: Official Color (Switch to Gold)')}
          </span>
        </button>
      </div>

      {/* Grid */}
      <div
        className={`grid gap-4 ${
          compact
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}
      >
        {displayedPartners.map((partner, idx) => {
          const logoSrc = monochromeGold
            ? partner.watermarkLogoUrl || partner.colorLogoUrl
            : partner.colorLogoUrl || partner.watermarkLogoUrl;

          return (
            <RevealItem key={partner.id} index={idx}>
              <InteractiveSpotlightCard className="h-full rounded-2xl surface-card hover:border-gold-400/50 transition-colors duration-150">
                <button
                  type="button"
                  onClick={() => setActivePartner(partner)}
                  className="group w-full h-full text-start p-5 flex flex-col justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="h-20 rounded-xl bg-[#040B16] border border-slate-800/80 p-3 flex items-center justify-center overflow-hidden">
                      {logoSrc ? (
                        <motion.img
                          key={`${partner.id}-${monochromeGold ? 'gold' : 'color'}`}
                          initial={reduceMotion ? false : { opacity: 0.35, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.22 }}
                          src={logoSrc}
                          alt={lang === 'ar' ? partner.nameAr : partner.nameEn}
                          className="max-h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-sm font-extrabold text-gold-300">{partner.abbr}</span>
                      )}
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-gold-300 mb-1">
                        {lang === 'ar' ? partner.relationshipAr : partner.relationshipEn}
                      </div>
                      <h4 className="text-sm font-extrabold text-white leading-snug">
                        {lang === 'ar' ? partner.nameAr : partner.nameEn}
                      </h4>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-gold-300 transition-colors">
                    <span className="font-mono">{partner.abbr}</span>
                    <span>{t('عرض التفاصيل ←', 'Details →')}</span>
                  </div>
                </button>
              </InteractiveSpotlightCard>
            </RevealItem>
          );
        })}
      </div>

      {/* Partner Detail Modal */}
      <AnimatePresence>
        {activePartner && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040B16]/85 backdrop-blur-sm"
          >
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg rounded-2xl bg-[#071426] border border-gold-400/40 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold-400/15 border border-gold-400/30 flex items-center justify-center text-gold-300">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gold-300">
                      {lang === 'ar' ? activePartner.relationshipAr : activePartner.relationshipEn}
                    </span>
                    <h3 className="text-lg font-extrabold text-white">
                      {lang === 'ar' ? activePartner.nameAr : activePartner.nameEn}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePartner(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {(activePartner.colorLogoUrl || activePartner.watermarkLogoUrl) && (
                <div className="p-4 rounded-xl bg-[#040B16] border border-slate-800 flex items-center justify-center">
                  <img
                    src={activePartner.colorLogoUrl || activePartner.watermarkLogoUrl}
                    alt={activePartner.nameEn}
                    className="max-h-20 w-auto object-contain"
                  />
                </div>
              )}

              <p className="text-sm text-slate-200 leading-relaxed">
                {lang === 'ar'
                  ? activePartner.detailsAr || activePartner.relationshipAr
                  : activePartner.detailsEn || activePartner.relationshipEn}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                {sanitizeExternalUrl(activePartner.websiteUrl) ? (
                  <a
                    href={sanitizeExternalUrl(activePartner.websiteUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold px-4 py-2 rounded-lg text-xs inline-flex items-center gap-1.5"
                  >
                    <span>{t('زيارة الموقع الرسمي', 'Visit Official Website')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs font-mono text-slate-400">{activePartner.abbr}</span>
                )}
                <button
                  type="button"
                  onClick={() => setActivePartner(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 border border-slate-700 hover:bg-navy-800 cursor-pointer"
                >
                  {t('إغلاق', 'Close')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
