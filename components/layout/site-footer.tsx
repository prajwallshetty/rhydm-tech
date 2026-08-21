import NextLink from "next/link";

import { Link } from "@/i18n/navigation";
import { DIVISION_META, WHATSAPP, type Division } from "@/lib/business";
import { getLocale, getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/logo";

import { getSectionContent } from "@/lib/cms/content";
import type { SiteSettingsContent } from "@/lib/cms/registry";

export async function SiteFooter({ division }: { division: Division }) {
  const meta = DIVISION_META[division];
  // Social links are editable in /admin/content ("Footer — social links").
  const locale = await getLocale();
  const settings = await getSectionContent<SiteSettingsContent>("site.settings", locale);
  const t = await getTranslations("footer");

  return (
    <footer className="relative w-full overflow-hidden bg-white text-slate-900 pt-16 lg:pt-20 border-t border-slate-200">
      {/* Main Content Grid aligned with page grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Logo & Copyright */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <Logo className="h-12 w-auto" />
            </Link>

            <p className="text-xs leading-relaxed text-slate-500 font-medium max-w-sm">
              {t("brandDescription")}
            </p>

            {/*
              Site-wide link to the brand entity page with the brand itself as
              the anchor. Every page therefore carries one descriptive internal
              link to /rhydm-tech, which is what makes it the strongest
              candidate for the "Rhydm Tech" query.
            */}
            <p className="text-xs leading-relaxed text-slate-500 font-medium max-w-sm">
              <Link
                href="/rhydm-tech"
                className="font-semibold text-slate-700 hover:text-[#16A34A] transition-colors"
              >
                {t("aboutBrand")}
              </Link>
              <span className="mx-1.5 text-slate-300">·</span>
              <span>{t("brandLine")}</span>
            </p>

            <p className="text-xs text-slate-400 font-medium pt-1">
              {t("copyright", { company: "Rhydm Technologies", year: new Date().getFullYear() })}
            </p>
          </div>

          {/* Right Columns Grid: Pages, Socials, Legal, Register */}
          <div className="lg:col-span-8 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {/* Pages / Services */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {t("pages")}
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-600 font-medium">
                <li>
                  <Link href="/disposal/services" className="hover:text-[#16A34A] transition-colors">
                    {t("allServices")}
                  </Link>
                </li>
                <li>
                  <Link href="/disposal/process" className="hover:text-[#16A34A] transition-colors">
                    {t("process")}
                  </Link>
                </li>
                <li>
                  <Link href="/disposal/industries" className="hover:text-[#16A34A] transition-colors">
                    {t("industries")}
                  </Link>
                </li>
                <li>
                  <Link href="/disposal/certificates" className="hover:text-[#16A34A] transition-colors">
                    {t("certificates")}
                  </Link>
                </li>
                <li>
                  <Link href="/disposal/faqs" className="hover:text-[#16A34A] transition-colors">
                    {t("faqs")}
                  </Link>
                </li>
                <li>
                  <Link href="/disposal/contact" className="hover:text-[#16A34A] transition-colors">
                    {t("contact")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Socials */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {t("socials")}
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-600 font-medium">
                <li>
                  <a
                    href={WHATSAPP.getUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#16A34A] transition-colors font-semibold text-[#16A34A]"
                  >
                    WhatsApp ({WHATSAPP.number})
                  </a>
                </li>
                {settings.socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#16A34A] transition-colors"
                      aria-label={
                        social.label.toLowerCase().includes("linkedin")
                          ? "Rhydm Technologies on LinkedIn"
                          : social.label.toLowerCase().includes("twitter") || social.label.toLowerCase() === "x"
                          ? "Rhydm Technologies on X"
                          : social.label.toLowerCase().includes("instagram")
                          ? "Rhydm Technologies on Instagram"
                          : `Rhydm Technologies on ${social.label}`
                      }
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {t("legal")}
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-600 font-medium">
                <li>
                  <Link href="/privacy-policy" className="hover:text-[#16A34A] transition-colors">
                    {t("privacyPolicy")}
                  </Link>
                </li>
                <li>
                  <Link href="/terms-and-conditions" className="hover:text-[#16A34A] transition-colors">
                    {t("termsOfService")}
                  </Link>
                </li>
                <li>
                  <Link href="/cookie-policy" className="hover:text-[#16A34A] transition-colors">
                    {t("cookiePolicy")}
                  </Link>
                </li>
                <li>
                  <Link href="/imprint" className="hover:text-[#16A34A] transition-colors">
                    Imprint (Impressum)
                  </Link>
                </li>
                <li>
                  <Link href="/return-policy" className="hover:text-[#16A34A] transition-colors">
                    Return Policy
                  </Link>
                </li>
                <li>
                  <Link href="/withdrawal-policy" className="hover:text-[#16A34A] transition-colors">
                    Right of Withdrawal
                  </Link>
                </li>
                <li>
                  <Link href="/sustainability" className="hover:text-[#16A34A] transition-colors">
                    Sustainability
                  </Link>
                </li>
                <li>
                  <Link href="/compliance" className="hover:text-[#16A34A] transition-colors">
                    Compliance & Standards
                  </Link>
                </li>
              </ul>
            </div>

            {/* Register & Shop */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {t("register")}
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-600 font-medium">
                <li>
                  <Link href="/refurbished" className="hover:text-[#16A34A] transition-colors">
                    {t("shopRefurbished")}
                  </Link>
                </li>
                <li>
                  <NextLink href="/signup" className="hover:text-[#16A34A] transition-colors">
                    {t("signUp")}
                  </NextLink>
                </li>
                <li>
                  <NextLink href="/login" className="hover:text-[#16A34A] transition-colors">
                    {t("login")}
                  </NextLink>
                </li>
                <li>
                  <NextLink href="/forgot-password" className="hover:text-[#16A34A] transition-colors">
                    {t("forgotPassword")}
                  </NextLink>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Giant Bottom Brand Watermark — Soft Light Watermark in Plain White Theme */}
        <div className="mt-16 sm:mt-20 border-t border-slate-100 pt-6 pb-2 text-center overflow-hidden select-none">
          <span aria-hidden className="block text-[10vw] sm:text-[11vw] font-bold tracking-tight text-slate-200/70 leading-none whitespace-nowrap">
            Rhydm Technologies
          </span>
        </div>
      </div>
    </footer>
  );
}
