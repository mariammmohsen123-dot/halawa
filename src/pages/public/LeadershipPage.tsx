import React from 'react';
import { Award, ExternalLink, Linkedin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useDocumentSeo } from '../../hooks/useDocumentSeo';
import { LeaderCrest } from '../../components/public/LeaderCrest';
import { InteractiveSpotlightCard, RevealItem } from '../../components/public/MotionPrimitives';
import { sanitizeExternalUrl } from '../../types/cms';

export function LeadershipPage() {
  const { lang, t, settings, teamMembers } = useApp();

  useDocumentSeo({
    title: t('القيادة التنفيذية والحوكمة', 'Executive Leadership & Governance'),
    description: t(
      'مجلس الشركاء والقيادات الفنية في شركة محمد حسن حلاوة وشركاؤه.',
      'Executive partners and technical leads at Halawa Consultancy Co.'
    ),
    lang,
    settings,
  });

  return (
    <div className="py-16 bg-[#040B16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-extrabold uppercase text-gold-300">
            {t('القيادة والحوكمة المؤسسية', 'LEADERSHIP & GOVERNANCE')}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            {t('فريق قيادي يجمع الخبرة الإدارية بالهندسة والتكنولوجيا', 'Executive Partners Blending Strategy, Engineering & Technology')}
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            {t(
              'تقود شركة HCC كوادر تنفيذية وهندسية متخصصة في أنظمة الجودة ISO 9001، إدارة الحاضنات والمشاريع، هندسة التعهيد، ونماذج القرار متعدد المعايير.',
              'HCC is led by seasoned partners and technical leads specializing in ISO 9001 quality governance, venture incubation, remote operations, and MCDM industrial modeling.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, idx) => {
            const expertise = lang === 'ar' ? member.expertiseAr || [] : member.expertiseEn || [];
            const safeLinkedin = sanitizeExternalUrl(member.linkedinUrl);

            return (
              <RevealItem key={member.id} index={idx}>
                <InteractiveSpotlightCard
                  isVip={member.isPrimaryLeader}
                  className={`h-full rounded-2xl p-6 sm:p-7 gap-5 card-gold-glow ${
                    member.isPrimaryLeader ? 'surface-card-elevated' : 'surface-card'
                  }`}
                >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <LeaderCrest
                      nameAr={member.nameAr}
                      nameEn={member.nameEn}
                      photoUrl={member.photoUrl}
                      isPrimary={member.isPrimaryLeader}
                    />
                    <div className="space-y-1">
                      {member.badgeCode && (
                        <span className="text-[11px] font-mono font-bold text-gold-300 block">
                          {member.badgeCode}
                        </span>
                      )}
                      <h2 className="text-lg font-extrabold text-white leading-snug">
                        {lang === 'ar' ? member.nameAr : member.nameEn}
                      </h2>
                      <p className="text-xs font-bold text-gold-200">
                        {lang === 'ar' ? member.roleAr : member.roleEn}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {lang === 'ar' ? member.bioAr : member.bioEn}
                  </p>

                  {expertise.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {expertise.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md bg-[#040B16] border border-slate-800 text-xs text-slate-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {safeLinkedin && (
                  <div className="pt-4 border-t border-slate-800">
                    <a
                      href={safeLinkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-300 hover:underline"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                </InteractiveSpotlightCard>
              </RevealItem>
            );
          })}
        </div>

        {/* Legal & Zero-VAT Block */}
        <RevealItem index={0}>
          <div className="rounded-2xl vip-track-surface p-7 sm:p-9 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold text-gold-300">
              <Award className="w-4 h-4" />
              <span>{t('الامتثال التعاقدي والمالي', 'CONTRACTUAL & TAX GOVERNANCE')}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              {t('شركة تضامنية مسجلة مع ميزة الإعفاء الضريبي Zero-VAT', 'Registered General Partnership with Zero-VAT Eligibility')}
            </h2>
            <p className="text-sm text-slate-200 leading-relaxed">
              {t(
                'تعمل شركة محمد حسن حلاوة وشركاؤه ككيان قانوني معتمد في فلسطين (مرخصة رقم 563499664 وسجل تجاري 43211)، وباعتماد دولي على UNGM (1290555) مع التزام مؤسسي صارم بمعايير المساءلة AAP وحماية المستفيدين PSEA.',
                'Mohammed Hasan Halawa & Partners Co. is a registered legal entity in Palestine (Reg: 563499664, Commercial: 43211) and UNGM Vendor (1290555), strictly adhering to AAP accountability and PSEA safeguarding frameworks.'
              )}
            </p>
          </div>
          <div className="lg:col-span-4 grid grid-cols-2 gap-3 text-xs font-mono tabular-nums">
            <div className="p-3 rounded-xl bg-[#040B16]/80 border border-slate-800">
              <div className="text-slate-400">UNGM ID</div>
              <div className="text-gold-300 font-bold text-sm">{settings.ungmNumber}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#040B16]/80 border border-slate-800">
              <div className="text-slate-400">GCCI</div>
              <div className="text-gold-300 font-bold text-sm">#{settings.gcciNumber}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#040B16]/80 border border-slate-800">
              <div className="text-slate-400">Reg No.</div>
              <div className="text-white font-bold text-sm">{settings.regNumber}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#040B16]/80 border border-slate-800">
              <div className="text-slate-400">Comm No.</div>
              <div className="text-white font-bold text-sm">{settings.commercialNumber}</div>
            </div>
          </div>
        </div>
        </RevealItem>
      </div>
    </div>
  );
}
