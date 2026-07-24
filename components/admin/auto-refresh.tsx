"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Keeps admin data live: calls router.refresh() on an interval, which
 * re-runs the Server Components on the current route and streams fresh
 * database results in — new orders, submissions and stock changes appear
 * without a manual reload.
 *
 * Paused while the tab is hidden so background admin tabs don't hammer the
 * database, and refreshes immediately on return so the data is current the
 * moment the tab regains focus.
 */
export function AutoRefresh({ intervalMs = 15_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    function tick() {
      const activeTag = document.activeElement?.tagName;
      const isEditing = activeTag && ["INPUT", "TEXTAREA", "SELECT"].includes(activeTag);
      if (!isEditing && !document.hidden) {
        router.refresh();
      }
    }

    function start() {
      if (timer) return;
      timer = setInterval(tick, intervalMs);
    }

    function stop() {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    }

    function onVisibilityChange() {
      if (document.hidden) {
        stop();
      } else {
        tick();
        start();
      }
    }

    start();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [router, intervalMs]);

  return null;
}
