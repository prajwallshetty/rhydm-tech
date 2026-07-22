import Link from "next/link";
import { COMPANY, DIVISION_META, type Division } from "@/lib/business";
import { getSectionContent } from "@/lib/cms/content";
import type { SiteSettingsContent } from "@/lib/cms/registry";

export async function SiteFooter({ division }: { division: Division }) {
  const meta = DIVISION_META[division];
  // Social links are editable in /admin/content ("Footer — social links").
  const settings = await getSectionContent<SiteSettingsContent>("site.settings");

  return (
    <footer className="relative w-full overflow-hidden bg-white text-slate-900 pt-16 lg:pt-20 border-t border-slate-200">
      {/* Main Content Grid aligned with page grid */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Logo & Copyright */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/icon.png"
                alt={COMPANY.name}
                className="size-9 object-contain"
              />
              <span className="text-xl font-bold tracking-tight text-[#16A34A]">
                {COMPANY.name}
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              &copy; copyright {COMPANY.name} {new Date().getFullYear()}. All rights reserved.
            </p>
          </div>

          {/* Right Columns Grid: Pages, Socials, Legal, Register */}
          <div className="lg:col-span-8 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {/* Pages / Services */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Pages
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-600 font-medium">
                <li>
                  <Link href="/disposal/services" className="hover:text-[#16A34A] transition-colors">
                    All Services
                  </Link>
                </li>
                <li>
                  <Link href="/disposal/process" className="hover:text-[#16A34A] transition-colors">
                    Process
                  </Link>
                </li>
                <li>
                  <Link href="/disposal/industries" className="hover:text-[#16A34A] transition-colors">
                    Industries
                  </Link>
                </li>
                <li>
                  <Link href="/disposal/certificates" className="hover:text-[#16A34A] transition-colors">
                    Certificates
                  </Link>
                </li>
                <li>
                  <Link href="/disposal/faqs" className="hover:text-[#16A34A] transition-colors">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link href="/disposal/contact" className="hover:text-[#16A34A] transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Socials */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Socials
              </h4>
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Legal
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-600 font-medium">
                <li>
                  <Link href="#" className="hover:text-[#16A34A] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#16A34A] transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#16A34A] transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#16A34A] transition-colors">
                    Data Security
                  </Link>
                </li>
              </ul>
            </div>

            {/* Register & Shop */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Register
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-600 font-medium">
                <li>
                  <Link href="/refurbished" className="hover:text-[#16A34A] transition-colors">
                    Shop Refurbished
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-[#16A34A] transition-colors">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[#16A34A] transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/forgot-password" className="hover:text-[#16A34A] transition-colors">
                    Forgot Password
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Giant Bottom Brand Watermark — Soft Light Watermark in Plain White Theme */}
        <div className="mt-16 sm:mt-20 border-t border-slate-100 pt-6 pb-2 text-center overflow-hidden select-none">
          <span className="block text-[10vw] sm:text-[11vw] font-bold tracking-tight text-slate-200/70 leading-none whitespace-nowrap">
            Rhydm Tech
          </span>
        </div>
      </div>
    </footer>
  );
}
