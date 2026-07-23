"use client";

import { useEffect, useRef, useState } from "react";
import { Download, RefreshCw, X } from "lucide-react";

const DISMISS_KEY = "renewed.installBanner.dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * PWA plumbing for the admin: registers the service worker (scope /admin),
 * shows a custom install banner while `beforeinstallprompt` is available,
 * and surfaces an "update available" toast when a new worker is waiting.
 *
 * All state is derived from browser events — the banner disappears on
 * `appinstalled` or in standalone display mode, and dismissal persists.
 */
export function PwaProvider() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const waitingWorker = useRef<ServiceWorker | null>(null);

  // ---- service worker registration + update detection ----------------------
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        registration = reg;
        if (reg.waiting) {
          waitingWorker.current = reg.waiting;
          setUpdateReady(true);
        }
        reg.addEventListener("updatefound", () => {
          const incoming = reg.installing;
          if (!incoming) return;
          incoming.addEventListener("statechange", () => {
            // "installed" with an existing controller = an update is waiting.
            if (
              incoming.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              waitingWorker.current = incoming;
              setUpdateReady(true);
            }
          });
        });
      })
      .catch(() => {
        // Registration failing (e.g. private mode) must never break admin.
      });

    // Reload once the new worker takes control after "Update now".
    let reloaded = false;
    const onControllerChange = () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );
    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
      void registration;
    };
  }, []);

  // ---- install prompt capture ----------------------------------------------
  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      (navigator as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      if (localStorage.getItem(DISMISS_KEY) !== "1") setShowBanner(true);
    };
    const onInstalled = () => {
      setInstallEvent(null);
      setShowBanner(false);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!installEvent) return;
    setShowBanner(false);
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome !== "accepted") {
      // Declined the native prompt — keep the event for a later attempt but
      // don't nag with the banner again this session.
      setShowBanner(false);
    } else {
      setInstallEvent(null);
    }
  }

  function dismiss() {
    setShowBanner(false);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  function applyUpdate() {
    waitingWorker.current?.postMessage("SKIP_WAITING");
    setUpdateReady(false);
  }

  return (
    <>
      {/* Install banner — floating glass card, bottom-right. */}
      {showBanner && installEvent && (
        <div className="fixed bottom-5 right-5 z-100 w-[calc(100vw-2.5rem)] max-w-sm animate-reveal rounded-2xl border border-slate-200/70 bg-white/85 p-4 shadow-2xl backdrop-blur-xl dark:border-border dark:bg-card/90">
          <div className="flex items-start gap-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element -- static app icon */}
            <img
              src="/icons/admin-192.png"
              alt=""
              width={44}
              height={44}
              className="rounded-xl border border-slate-100 dark:border-border"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-foreground">
                Install Renewed Admin
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Access your dashboard faster with the installed app.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => void install()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#16A34A] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#15803D]"
                >
                  <Download className="size-3.5" />
                  Install
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="rounded-full border border-border px-4 py-2 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss install banner"
              className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Update toast. */}
      {updateReady && (
        <div className="fixed bottom-5 left-1/2 z-100 flex -translate-x-1/2 animate-reveal items-center gap-3 rounded-full border border-slate-200/70 bg-white/90 py-2 pl-4 pr-2 shadow-xl backdrop-blur-xl dark:border-border dark:bg-card/90">
          <span className="text-xs font-bold text-foreground">
            New version available
          </span>
          <button
            type="button"
            onClick={applyUpdate}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#16A34A] px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#15803D]"
          >
            <RefreshCw className="size-3" />
            Update now
          </button>
        </div>
      )}
    </>
  );
}
