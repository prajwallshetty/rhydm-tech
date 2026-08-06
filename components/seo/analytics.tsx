/**
 * Analytics script loader.
 *
 * Renders tracking scripts only when the corresponding env var is set.
 * Produces zero output in development or when no IDs are configured.
 *
 * Supported:
 *  - Google Analytics 4  (NEXT_PUBLIC_GA_ID)
 *  - Google Tag Manager  (NEXT_PUBLIC_GTM_ID)
 *  - Meta Pixel           (NEXT_PUBLIC_META_PIXEL_ID)
 *  - LinkedIn Insight Tag (NEXT_PUBLIC_LINKEDIN_PARTNER_ID)
 *  - Microsoft Clarity    (NEXT_PUBLIC_CLARITY_ID)
 */

import Script from "next/script";
import { ANALYTICS } from "@/lib/seo/constants";

export function Analytics() {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) return null;

  return (
    <>
      {/* Google Tag Manager */}
      {ANALYTICS.gtmId && (
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${ANALYTICS.gtmId}');`,
          }}
        />
      )}

      {/* Google Analytics 4 (only if GTM is not used — GTM should load GA) */}
      {ANALYTICS.gaId && !ANALYTICS.gtmId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS.gaId}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga4"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${ANALYTICS.gaId}');`,
            }}
          />
        </>
      )}

      {/* Meta Pixel */}
      {ANALYTICS.metaPixelId && (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${ANALYTICS.metaPixelId}');
fbq('track','PageView');`,
          }}
        />
      )}

      {/* LinkedIn Insight Tag */}
      {ANALYTICS.linkedInPartnerId && (
        <Script
          id="linkedin-insight"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `_linkedin_partner_id="${ANALYTICS.linkedInPartnerId}";
window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];
var b=document.createElement("script");b.type="text/javascript";b.async=true;
b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b,s)})(window.lintrk);`,
          }}
        />
      )}

      {/* Microsoft Clarity */}
      {ANALYTICS.clarityId && (
        <Script
          id="clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window,document,"clarity","script","${ANALYTICS.clarityId}");`,
          }}
        />
      )}
    </>
  );
}
