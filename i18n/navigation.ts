import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Locale-aware replacements for next/link and next/navigation. Public
 * components import Link/usePathname/useRouter/redirect from here so hrefs
 * keep the active locale automatically. Admin/auth code keeps next/link —
 * those routes are not localized.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
