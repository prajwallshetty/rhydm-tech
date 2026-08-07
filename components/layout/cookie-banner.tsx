"use client";

import React, { useState, useEffect } from "react";
import { Cookie, Shield, Settings, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  performance: boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
  performance: false
};

export function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [mounted, setMounted] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("rhydm-cookie-consent");
    if (!saved) {
      // Show banner if no consent is stored yet
      setIsOpen(true);
    } else {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {
        setPreferences(DEFAULT_PREFERENCES);
      }
    }
  }, []);

  const saveConsent = (updatedPrefs: CookiePreferences) => {
    localStorage.setItem("rhydm-cookie-consent", JSON.stringify(updatedPrefs));
    setPreferences(updatedPrefs);
    setIsOpen(false);
    setShowCustomize(false);
  };

  const handleAcceptAll = () => {
    const allPrefs = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
      performance: true
    };
    saveConsent(allPrefs);
  };

  const handleRejectAll = () => {
    saveConsent(DEFAULT_PREFERENCES);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "necessary") return; // cannot toggle necessary
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating Gear Button to reopen settings anytime (GDPR requirement) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 grid size-11 place-items-center rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 shadow-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all cursor-pointer group"
          aria-label="Cookie Settings"
          title="Cookie Settings"
        >
          <Cookie className="size-5 text-[#16A34A] group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Main Cookie Banner Modal/Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:justify-start p-4 sm:p-6 pointer-events-none">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-6 shadow-2xl pointer-events-auto animate-reveal transition-all space-y-6">
            
            {/* Header info */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-[#16A34A]">
                  <Cookie className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Cookie Consent & Privacy
                  </h3>
                  <p className="text-[11px] font-bold text-[#16A34A] tracking-wider uppercase mt-0.5">
                    GDPR Compliant Setting
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Banner Description */}
            {!showCustomize ? (
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                We use cookies to secure payments, optimize website speed, personalize content, and analyze traffic. You can choose to accept all cookies or configure your preferences. Read our{" "}
                <a href="/cookie-policy" className="text-[#16A34A] font-bold hover:underline">Cookie Policy</a> and{" "}
                <a href="/privacy-policy" className="text-[#16A34A] font-bold hover:underline">Privacy Policy</a>.
              </p>
            ) : (
              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                
                {/* Necessary */}
                <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 p-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      Necessary Cookies
                      <Shield className="size-3.5 text-[#16A34A]" />
                    </span>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Required for secure PayPal checkouts, shopping carts, and fundamental page routing. Always active.
                    </p>
                  </div>
                  <div className="relative inline-flex items-center cursor-not-allowed">
                    <div className="w-8 h-4 bg-emerald-500 rounded-full opacity-60" />
                    <div className="absolute right-0.5 w-3 h-3 bg-white rounded-full transition-transform" />
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 p-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Analytics Cookies
                    </span>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Allows us to gather aggregate site traffic insights using Google Analytics and Microsoft Clarity.
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference("analytics")}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none",
                      preferences.analytics ? "bg-[#16A34A]" : "bg-slate-200 dark:bg-zinc-800"
                    )}
                  >
                    <span className={cn(
                      "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                      preferences.analytics ? "translate-x-4" : "translate-x-0"
                    )} />
                  </button>
                </div>

                {/* Marketing */}
                <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 p-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Marketing Cookies
                    </span>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Allows conversion tracking and personalized remarketing ads via Meta Pixel.
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference("marketing")}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none",
                      preferences.marketing ? "bg-[#16A34A]" : "bg-slate-200 dark:bg-zinc-800"
                    )}
                  >
                    <span className={cn(
                      "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                      preferences.marketing ? "translate-x-4" : "translate-x-0"
                    )} />
                  </button>
                </div>

                {/* Functional */}
                <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 p-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Functional Cookies
                    </span>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Saves your site interface choices, dark/light theme choices, and language switcher selections.
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference("functional")}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none",
                      preferences.functional ? "bg-[#16A34A]" : "bg-slate-200 dark:bg-zinc-800"
                    )}
                  >
                    <span className={cn(
                      "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                      preferences.functional ? "translate-x-4" : "translate-x-0"
                    )} />
                  </button>
                </div>

                {/* Performance */}
                <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 p-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Performance Cookies
                    </span>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Monitors page load diagnostics, error logging, and page performance testing.
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference("performance")}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none",
                      preferences.performance ? "bg-[#16A34A]" : "bg-slate-200 dark:bg-zinc-800"
                    )}
                  >
                    <span className={cn(
                      "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                      preferences.performance ? "translate-x-4" : "translate-x-0"
                    )} />
                  </button>
                </div>

              </div>
            )}

            {/* Actions panel */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              {!showCustomize ? (
                <>
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white py-2.5 text-xs font-bold transition-all shadow-md shadow-[#16A34A]/25 cursor-pointer"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="flex-1 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 py-2.5 text-xs font-bold transition-all hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Reject Non-Essential
                  </button>
                  <button
                    onClick={() => setShowCustomize(true)}
                    className="flex items-center justify-center rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-500 hover:text-slate-800 p-2.5 cursor-pointer"
                    aria-label="Customize"
                    title="Customize"
                  >
                    <Settings className="size-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSavePreferences}
                    className="flex-1 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white py-2.5 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="size-3.5" />
                    Save Preferences
                  </button>
                  <button
                    onClick={() => setShowCustomize(false)}
                    className="flex-1 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 py-2.5 text-xs font-bold transition-all hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Back
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
