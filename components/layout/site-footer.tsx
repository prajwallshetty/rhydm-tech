import Link from "next/link";
import { ShieldCheck, Mail, Phone, MapPin, Globe } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { DIVISION_META, COMPANY, type Division } from "@/lib/business";
import { NAV } from "@/lib/navigation";

export function SiteFooter({ division }: { division: Division }) {
  const meta = DIVISION_META[division];
  const other = DIVISION_META[division === "disposal" ? "refurbished" : "disposal"];

  return (
    <footer className="border-t border-slate-200/80 bg-white text-slate-900">
      {/* Top Main Footer Area */}
      <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Column 1: Company Logo & Description */}
        <div className="space-y-5">
          <Logo />
          <p className="text-xs sm:text-sm leading-relaxed text-slate-500 font-medium max-w-xs">
            {COMPANY.description}
          </p>
          <div className="flex items-center gap-3 text-slate-400">
            <ShieldCheck className="h-5 w-5 text-[#2E6F40]" />
            <span className="text-xs font-bold text-slate-700 tracking-tight">ISO 27001 Certified ITAD</span>
          </div>
        </div>

        {/* Column 2: Navigation Links */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 mb-4">
            {meta.name}
          </h3>
          <ul className="space-y-3">
            {NAV[division].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-xs sm:text-sm text-slate-500 hover:text-[#2E6F40] font-medium transition-colors cursor-pointer"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Legal & Resources */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 mb-4">
            Resources & Legal
          </h3>
          <ul className="space-y-3">
            <li>
              <Link
                href="/refurbished/categories"
                className="text-xs sm:text-sm text-slate-500 hover:text-[#2E6F40] font-medium transition-colors cursor-pointer"
              >
                Product Categories
              </Link>
            </li>
            <li>
              <Link
                href="/disposal/certificates"
                className="text-xs sm:text-sm text-slate-500 hover:text-[#2E6F40] font-medium transition-colors cursor-pointer"
              >
                Audits & Certification
              </Link>
            </li>
            <li>
              <Link
                href="/disposal/faqs"
                className="text-xs sm:text-sm text-slate-500 hover:text-[#2E6F40] font-medium transition-colors cursor-pointer"
              >
                Frequently Asked Questions
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-xs sm:text-sm text-slate-500 hover:text-[#2E6F40] font-medium transition-colors cursor-pointer"
              >
                Privacy & Data Security Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact & Office Info */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 mb-4">
            Get In Touch
          </h3>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-500 font-medium">
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-[#2E6F40] shrink-0" />
              <a
                href={`mailto:${COMPANY.email}`}
                className="hover:text-[#2E6F40] transition-colors"
              >
                {COMPANY.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-[#2E6F40] shrink-0" />
              <a
                href={`tel:${COMPANY.phone.replace(/[^+\d]/g, "")}`}
                className="hover:text-[#2E6F40] transition-colors"
              >
                {COMPANY.phone}
              </a>
            </li>
            <li className="flex items-start gap-2.5 pt-1">
              <MapPin className="h-4 w-4 text-[#2E6F40] shrink-0 mt-0.5" />
              <span>
                {COMPANY.address.street}
                <br />
                {COMPANY.address.city}, {COMPANY.address.region} {COMPANY.address.postalCode}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar Area */}
      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-xs sm:text-sm text-slate-500 font-medium sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href={other.href}
              className="inline-flex items-center gap-1 text-[#2E6F40] hover:text-[#255833] font-bold transition-colors cursor-pointer"
            >
              <span>{meta.crossLinkLabel}</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
