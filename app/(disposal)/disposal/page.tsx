import { DisposalHero } from "@/components/disposal/disposal-hero";
import { DisposalCertificationsSlider } from "@/components/disposal/disposal-certifications-slider";
import { DisposalServicesBento } from "@/components/disposal/disposal-services-bento";
import { DisposalProcessTimeline } from "@/components/disposal/disposal-process-timeline";
import { DisposalWhyUs } from "@/components/disposal/disposal-why-us";
import { DisposalCTASection } from "@/components/disposal/disposal-cta-section";

export default function DisposalHomePage() {
  return (
    <div className="bg-[#FAFDFB]">
      <DisposalHero />
      <DisposalCertificationsSlider />
      <DisposalServicesBento />
      <DisposalProcessTimeline />
      <DisposalWhyUs />
      <DisposalCTASection />
    </div>
  );
}
