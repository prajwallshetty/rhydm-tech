"use client";

import { useState } from "react";
import {
  Save,
  Plus,
  Trash2,
  Recycle,
  Award,
  Building2,
  HelpCircle,
  MessageSquare,
  Mail,
  CheckCircle,
  FileText,
  Clock,
} from "lucide-react";
import {
  saveDisposalHeroAction,
  saveDisposalServiceAction,
  deleteDisposalServiceAction,
  saveProcessStepAction,
  deleteProcessStepAction,
  saveIndustryAction,
  deleteIndustryAction,
  saveCertificationAction,
  deleteCertificationAction,
  saveTestimonialAction,
  deleteTestimonialAction,
  saveFaqAction,
  deleteFaqAction,
  updateSubmissionStatusAction,
} from "@/app/admin/actions";
import { SubmissionStatus } from "@/lib/generated/prisma/enums";

export function DisposalCmsManager({ cmsData }: { cmsData: any }) {
  const [activeTab, setActiveTab] = useState<
    "hero" | "services" | "process" | "industries" | "certs" | "testimonials" | "faqs" | "submissions"
  >("hero");

  const tabs = [
    { id: "hero", label: "Hero Copy", icon: FileText },
    { id: "services", label: `Services (${cmsData.services.length})`, icon: Recycle },
    { id: "process", label: `Process (${cmsData.steps.length})`, icon: Clock },
    { id: "industries", label: `Industries (${cmsData.industries.length})`, icon: Building2 },
    { id: "certs", label: `Certifications (${cmsData.certifications.length})`, icon: Award },
    { id: "testimonials", label: `Testimonials (${cmsData.testimonials.length})`, icon: MessageSquare },
    { id: "faqs", label: `FAQs (${cmsData.faqs.length})`, icon: HelpCircle },
    { id: "submissions", label: `Inquiries (${cmsData.submissions.length})`, icon: Mail },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="flex overflow-x-auto gap-1 border-b border-border/60 pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Hero Copy */}
      {activeTab === "hero" && (
        <form action={saveDisposalHeroAction} className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4 max-w-2xl">
          <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3">Disposal Landing Hero Section</h2>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Eyebrow Badge Text</label>
            <input
              type="text"
              name="eyebrow"
              defaultValue={cmsData.hero.eyebrow}
              className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Main Heading</label>
            <input
              type="text"
              name="heading"
              defaultValue={cmsData.hero.heading}
              className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-sm font-semibold outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Subheading Description</label>
            <textarea
              name="subheading"
              rows={3}
              defaultValue={cmsData.hero.subheading}
              className="w-full rounded-lg border border-input bg-background/50 p-3 text-xs outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" /> Save Hero Section
          </button>
        </form>
      )}

      {/* Tab 2: Services */}
      {activeTab === "services" && (
        <div className="space-y-6">
          <form action={saveDisposalServiceAction} className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-foreground">Add New Service</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                type="text"
                name="title"
                required
                placeholder="Service Title (e.g. Data Sanitisation)"
                className="rounded-lg border border-input bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary"
              />
              <input
                type="text"
                name="icon"
                defaultValue="shield"
                placeholder="Icon (e.g. shield, eraser, hardDrive)"
                className="rounded-lg border border-input bg-background/50 px-3 py-2 text-xs font-mono outline-none focus:border-primary"
              />
            </div>
            <textarea
              name="summary"
              required
              rows={2}
              placeholder="Short service summary..."
              className="w-full rounded-lg border border-input bg-background/50 p-3 text-xs outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Service
            </button>
          </form>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {cmsData.services.map((item: any) => (
              <div key={item.id} className="flex items-start justify-between rounded-xl border border-border/80 bg-card p-4 shadow-sm">
                <div>
                  <div className="font-semibold text-foreground text-sm">{item.title}</div>
                  <div className="text-[11px] font-mono text-muted-foreground mt-0.5">Icon: {item.icon}</div>
                  <p className="text-xs text-muted-foreground mt-2">{item.summary}</p>
                </div>
                <form action={deleteDisposalServiceAction.bind(null, item.id)}>
                  <button type="submit" className="text-muted-foreground hover:text-destructive p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Process Steps */}
      {activeTab === "process" && (
        <div className="space-y-6">
          <form action={saveProcessStepAction} className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-foreground">Add Process Step</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <input
                type="number"
                name="step"
                required
                placeholder="Step #"
                className="rounded-lg border border-input bg-background/50 px-3 py-2 text-xs font-bold outline-none focus:border-primary"
              />
              <input
                type="text"
                name="title"
                required
                placeholder="Title (e.g. Secure Chain of Custody)"
                className="sm:col-span-2 rounded-lg border border-input bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary"
              />
            </div>
            <textarea
              name="description"
              required
              rows={2}
              placeholder="Description..."
              className="w-full rounded-lg border border-input bg-background/50 p-3 text-xs outline-none focus:border-primary"
            />
            <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground cursor-pointer">
              <Plus className="h-4 w-4" /> Save Step
            </button>
          </form>

          <div className="space-y-3 max-w-2xl">
            {cmsData.steps.map((step: any) => (
              <div key={step.id} className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                    {step.step}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-xs">{step.title}</div>
                    <div className="text-[11px] text-muted-foreground">{step.description}</div>
                  </div>
                </div>
                <form action={deleteProcessStepAction.bind(null, step.id)}>
                  <button type="submit" className="text-muted-foreground hover:text-destructive p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Industries */}
      {activeTab === "industries" && (
        <div className="space-y-6">
          <form action={saveIndustryAction} className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-foreground">Add Target Industry</h3>
            <input
              type="text"
              name="name"
              required
              placeholder="Industry Name (e.g. Healthcare & Pharma)"
              className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary"
            />
            <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground cursor-pointer">
              <Plus className="h-4 w-4" /> Add Industry
            </button>
          </form>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cmsData.industries.map((ind: any) => (
              <div key={ind.id} className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-3 shadow-sm">
                <span className="font-medium text-xs text-foreground">{ind.name}</span>
                <form action={deleteIndustryAction.bind(null, ind.id)}>
                  <button type="submit" className="text-muted-foreground hover:text-destructive p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Certifications */}
      {activeTab === "certs" && (
        <div className="space-y-6">
          <form action={saveCertificationAction} className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-foreground">Add Certification</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="name"
                required
                placeholder="Name (e.g. ISO 27001)"
                className="rounded-lg border border-input bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary"
              />
              <input
                type="text"
                name="issuer"
                placeholder="Issuer (e.g. ISO)"
                className="rounded-lg border border-input bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary"
              />
            </div>
            <textarea
              name="description"
              rows={2}
              placeholder="Description..."
              className="w-full rounded-lg border border-input bg-background/50 p-3 text-xs outline-none focus:border-primary"
            />
            <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground cursor-pointer">
              <Plus className="h-4 w-4" /> Add Certification
            </button>
          </form>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {cmsData.certifications.map((cert: any) => (
              <div key={cert.id} className="flex items-start justify-between rounded-xl border border-border/80 bg-card p-4 shadow-sm">
                <div>
                  <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-emerald-500" /> {cert.name}
                  </div>
                  {cert.issuer && <div className="text-[11px] font-semibold text-primary mt-0.5">Issuer: {cert.issuer}</div>}
                  {cert.description && <p className="text-xs text-muted-foreground mt-1">{cert.description}</p>}
                </div>
                <form action={deleteCertificationAction.bind(null, cert.id)}>
                  <button type="submit" className="text-muted-foreground hover:text-destructive p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Testimonials */}
      {activeTab === "testimonials" && (
        <div className="space-y-6">
          <form action={saveTestimonialAction} className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-foreground">Add Client Testimonial</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                type="text"
                name="author"
                required
                placeholder="Author Name"
                className="rounded-lg border border-input bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary"
              />
              <input
                type="text"
                name="role"
                placeholder="Role (e.g. Head of IT)"
                className="rounded-lg border border-input bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary"
              />
              <input
                type="text"
                name="company"
                placeholder="Company"
                className="rounded-lg border border-input bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary"
              />
            </div>
            <textarea
              name="quote"
              required
              rows={3}
              placeholder="Testimonial quote..."
              className="w-full rounded-lg border border-input bg-background/50 p-3 text-xs outline-none focus:border-primary"
            />
            <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground cursor-pointer">
              <Plus className="h-4 w-4" /> Add Testimonial
            </button>
          </form>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {cmsData.testimonials.map((t: any) => (
              <div key={t.id} className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 shadow-sm">
                <p className="text-xs italic text-muted-foreground">"{t.quote}"</p>
                <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2">
                  <div>
                    <div className="font-semibold text-xs text-foreground">{t.author}</div>
                    <div className="text-[10px] text-muted-foreground">{t.role} · {t.company}</div>
                  </div>
                  <form action={deleteTestimonialAction.bind(null, t.id)}>
                    <button type="submit" className="text-muted-foreground hover:text-destructive p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: FAQs */}
      {activeTab === "faqs" && (
        <div className="space-y-6">
          <form action={saveFaqAction} className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-foreground">Add FAQ Question</h3>
            <input
              type="text"
              name="question"
              required
              placeholder="Question (e.g. How quickly can assets be collected?)"
              className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs font-semibold outline-none focus:border-primary"
            />
            <textarea
              name="answer"
              required
              rows={3}
              placeholder="Answer text..."
              className="w-full rounded-lg border border-input bg-background/50 p-3 text-xs outline-none focus:border-primary"
            />
            <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground cursor-pointer">
              <Plus className="h-4 w-4" /> Add FAQ
            </button>
          </form>

          <div className="space-y-3 max-w-2xl">
            {cmsData.faqs.map((faq: any) => (
              <div key={faq.id} className="rounded-xl border border-border/80 bg-card p-4 shadow-sm space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-foreground">{faq.question}</div>
                  <form action={deleteFaqAction.bind(null, faq.id)}>
                    <button type="submit" className="text-muted-foreground hover:text-destructive p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
                <p className="text-xs text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 8: Contact Inquiries */}
      {activeTab === "submissions" && (
        <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-muted/30 font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email & Phone</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">Topic</th>
                  <th className="p-3">Message</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {cmsData.submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground text-sm">
                      No disposal inquiries received yet.
                    </td>
                  </tr>
                ) : (
                  cmsData.submissions.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 font-semibold text-foreground">{sub.name}</td>
                      <td className="p-3">
                        <div className="font-mono">{sub.email}</div>
                        <div className="text-[11px] text-muted-foreground">{sub.phone || "—"}</div>
                      </td>
                      <td className="p-3">{sub.company || "—"}</td>
                      <td className="p-3 font-medium text-primary">{sub.topic || "General"}</td>
                      <td className="p-3 text-muted-foreground max-w-xs truncate">{sub.message}</td>
                      <td className="p-3">
                        <form
                          action={async (formData: FormData) => {
                            const newStatus = formData.get("status") as SubmissionStatus;
                            if (newStatus) {
                              await updateSubmissionStatusAction(sub.id, newStatus);
                            }
                          }}
                        >
                          <select
                            name="status"
                            defaultValue={sub.status}
                            onChange={(e) => e.target.form?.requestSubmit()}
                            className="rounded border border-input bg-background px-2 py-1 text-[10px] font-bold outline-none"
                          >
                            <option value="NEW">NEW</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
