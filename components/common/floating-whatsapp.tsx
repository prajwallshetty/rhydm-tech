"use client";

import { WHATSAPP } from "@/lib/business";
import { MessageCircle } from "lucide-react";

export function FloatingWhatsApp() {
  const whatsappUrl = WHATSAPP.getUrl("Hello Rhydm Technologies, I have an enquiry.");

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Rhydm Technologies on WhatsApp"
      className="group fixed bottom-22 right-6 z-40 flex items-center gap-2.5 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-xl ring-4 ring-emerald-500/20 transition-all hover:scale-105 hover:bg-[#20bd5a] hover:shadow-emerald-500/30 focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
    >
      <MessageCircle className="size-6 shrink-0 fill-current" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold transition-all duration-300 group-hover:max-w-xs sm:max-w-xs">
        Chat on WhatsApp
      </span>
    </a>
  );
}
