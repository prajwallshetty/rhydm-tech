import { Link } from "@/i18n/navigation";
import { COMPANY, DIVISION_META, type Division } from "@/lib/business";
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
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Logo & Copyright */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <Logo className="h-12 w-auto" />
            </Link>

            <p className="text-xs text-slate-500 font-medium">
              {t("copyright", { company: COMPANY.name, year: new Date().getFullYear() })}
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
                {settings.socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[#16A34A] transition-colors"
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
                  <Link href="#" className="hover:text-[#16A34A] transition-colors">
                    {t("privacyPolicy")}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#16A34A] transition-colors">
                    {t("termsOfService")}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#16A34A] transition-colors">
                    {t("cookiePolicy")}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#16A34A] transition-colors">
                    {t("dataSecurity")}
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
                  <Link href="/signup" className="hover:text-[#16A34A] transition-colors">
                    {t("signUp")}
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[#16A34A] transition-colors">
                    {t("login")}
                  </Link>
                </li>
                <li>
                  <Link href="/forgot-password" className="hover:text-[#16A34A] transition-colors">
                    {t("forgotPassword")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Giant Bottom Brand Watermark — Soft Light Watermark in Plain White Theme */}
        <div className="mt-16 sm:mt-20 border-t border-slate-100 pt-6 pb-2 text-center overflow-hidden select-none">
          <span aria-hidden className="block text-[10vw] sm:text-[11vw] font-bold tracking-tight text-slate-200/70 leading-none whitespace-nowrap">
            Rhydm Tech
          </span>
        </div>
      </div>
    </footer>
  );
}
