import { getAdminTestimonials } from "@/lib/repositories/admin";
import { TestimonialsManager } from "@/components/admin/testimonials-manager";

export default async function AdminTestimonialsPage() {
  const testimonials = await getAdminTestimonials();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Testimonials
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage customer quotes for each site. Drag to reorder — the order here
          is the order shown on the storefront.
        </p>
      </div>

      <TestimonialsManager
        testimonials={testimonials.map((t) => ({
          id: t.id,
          division: t.division,
          author: t.author,
          role: t.role,
          company: t.company,
          quote: t.quote,
          rating: t.rating,
          avatarUrl: t.avatarUrl,
          featured: t.featured,
          // The manager only distinguishes visible vs hidden; ARCHIVED reads as hidden.
          status: t.status === "PUBLISHED" ? ("PUBLISHED" as const) : ("DRAFT" as const),
          position: t.position,
        }))}
      />
    </div>
  );
}
