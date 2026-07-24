"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, ChevronDown, CheckCircle2, AlertCircle, Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

const FAQS = [
  {
    q: "How does the warranty work?",
    a: "All refurbished products sold by Rhydm Technologies are covered by a standard 12-month warranty from the date of delivery. This covers hardware defects and malfunctions. If a component fails under normal use, we will repair or replace the unit.",
  },
  {
    q: "What is your shipping policy?",
    a: "We offer free standard DHL shipping within Germany for all orders over 150 €. Standard shipping takes 2-4 business days. Express shipping options are available at checkout for next-day delivery.",
  },
  {
    q: "Can I return a product if I change my mind?",
    a: "Yes. We offer a 14-day return window for all orders. The item must be returned in the same condition it was received, along with its original packaging and accessories. Return shipping costs are the customer's responsibility unless the item is defective.",
  },
  {
    q: "What do your condition grades mean?",
    a: "We grade our refurbished units on a strict cosmetic scale: Grade A (Excellent condition with minimal/no visible wear), Grade B (Very Good condition with minor light scratches), and Grade C (Good/Fair condition with moderate wear/scratches, fully functional).",
  },
];

export function SupportClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const pushToast = useToast((s) => s.push);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setLoading(false);
    setSuccess(true);
    pushToast("Inquiry submitted successfully. We will get back to you within 24 hours.");
  };

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
      {/* Left side: FAQs & Info */}
      <div className="lg:col-span-7 space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Quick help with common topics
          </p>
        </div>

        <div className="divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-4 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between text-left focus:outline-none"
                >
                  <span className="text-sm font-extrabold text-slate-900 hover:text-[#2E6F40] transition-colors">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`size-4 text-slate-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-[#2E6F40]" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 text-xs leading-relaxed text-slate-500 font-medium">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Contact Info Channels */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-xs">
            <Mail className="size-6 text-[#2E6F40] mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">Email Us</h4>
            <p className="mt-1 text-[11px] text-[#2E6F40] font-extrabold break-all">
              support@rhydm.tech
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-xs">
            <Phone className="size-6 text-[#2E6F40] mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">Call Us</h4>
            <p className="mt-1 text-[11px] text-slate-600 font-bold">
              +49 15560 765557
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-xs">
            <MapPin className="size-6 text-[#2E6F40] mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">Our Office</h4>
            <p className="mt-1 text-[10px] text-slate-500 leading-tight font-medium">
              Gartenfelder Str. 29,<br />13599 Berlin, DE
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Contact Form */}
      <div className="lg:col-span-5">
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-xl backdrop-blur-md">
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mb-2">
            Send an Inquiry
          </h3>
          <p className="text-xs font-semibold text-slate-500 mb-6">
            We typically respond within 24 hours.
          </p>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-4"
              >
                <CheckCircle2 className="size-16 text-[#2E6F40] mx-auto animate-bounce" />
                <h4 className="text-sm font-extrabold text-slate-900">
                  Message Sent!
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Thank you for reaching out. A confirmation email has been sent to you.
                </p>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-medium outline-none focus:border-[#2E6F40] focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-medium outline-none focus:border-[#2E6F40] focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700">
                    Order Number <span className="text-slate-400 font-medium">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. #ORD-12345"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-medium outline-none focus:border-[#2E6F40] focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="How can we help?"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-medium outline-none focus:border-[#2E6F40] focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your issue or question in detail..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-medium outline-none focus:border-[#2E6F40] focus:bg-white transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2E6F40] hover:bg-[#255833] py-3 text-xs font-extrabold text-white shadow-lg shadow-[#2E6F40]/25 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Sending inquiry...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Inquiry</span>
                      <Send className="size-3.5" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
