/**
 * Reusable JSON-LD `<script>` renderer.
 *
 * Accepts any structured data object (with or without `@context`). If
 * `@context` is missing, `"https://schema.org"` is prepended automatically.
 *
 * Output is sanitised: any occurrence of `</script>` inside the payload is
 * escaped so user-supplied CMS content can never break out of the tag.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function JsonLd({ data }: { data: Record<string, any> }) {
  const payload = data["@context"] ? data : { "@context": "https://schema.org", ...data };
  const json = JSON.stringify(payload).replace(/<\/script/gi, "<\\/script");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
