import { Save, Settings, Building, Mail, Phone, MapPin, Share2 } from "lucide-react";
import { getAdminSiteSettings } from "@/lib/repositories/admin";
import { saveSiteSettingsAction } from "@/app/admin/actions";

export default async function AdminSettingsPage() {
  const settings = await getAdminSiteSettings();

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Site Settings</h1>
        <p className="text-sm text-muted-foreground">Manage organization details, contact info, branding, and social channels.</p>
      </div>

      <form action={saveSiteSettingsAction} className="space-y-6">
        {/* Company Info */}
        <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            <span>Company Details</span>
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Company Name</label>
              <input
                type="text"
                name="companyName"
                defaultValue={settings.companyName}
                className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Tagline</label>
              <input
                type="text"
                name="tagline"
                defaultValue={settings.tagline}
                className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
            <Mail className="h-5 w-5 text-emerald-500" />
            <span>Contact Information</span>
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Support Email</label>
              <input
                type="email"
                name="email"
                defaultValue={settings.email}
                className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs font-mono outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
              <input
                type="text"
                name="phone"
                defaultValue={settings.phone}
                className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Headquarters Address</label>
              <input
                type="text"
                name="address"
                defaultValue={settings.address}
                className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-violet-500" />
            <span>Social Links & Branding</span>
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Twitter / X URL</label>
              <input
                type="text"
                name="twitterUrl"
                defaultValue={settings.twitterUrl}
                className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs font-mono outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">LinkedIn URL</label>
              <input
                type="text"
                name="linkedinUrl"
                defaultValue={settings.linkedinUrl}
                className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs font-mono outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">GitHub URL</label>
              <input
                type="text"
                name="githubUrl"
                defaultValue={settings.githubUrl}
                className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs font-mono outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Logo Asset URL</label>
              <input
                type="text"
                name="logoUrl"
                defaultValue={settings.logoUrl}
                className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs font-mono outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Favicon Asset URL</label>
              <input
                type="text"
                name="faviconUrl"
                defaultValue={settings.faviconUrl}
                className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs font-mono outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all cursor-pointer"
        >
          <Save className="h-4 w-4" /> Save Site Settings
        </button>
      </form>
    </div>
  );
}
