import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { getAdminPostById } from "@/lib/repositories/admin";
import { savePostAction } from "@/app/(backend)/(admin)/admin/actions";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getAdminPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <Link
          href="/admin/blogs"
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Blogs</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Blog Post</h1>
        <p className="text-sm text-muted-foreground">Modify article details.</p>
      </div>

      <form action={savePostAction} className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
        <input type="hidden" name="id" value={post.id} />

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Article Title *</label>
          <input
            type="text"
            name="title"
            required
            defaultValue={post.title}
            className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Slug</label>
          <input
            type="text"
            name="slug"
            defaultValue={post.slug}
            className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs font-mono outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Cover Image URL</label>
          <input
            type="text"
            name="coverImageUrl"
            defaultValue={post.coverImage?.url || ""}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs font-mono outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Short Excerpt</label>
          <input
            type="text"
            name="excerpt"
            defaultValue={post.excerpt || ""}
            className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Content *</label>
          <textarea
            name="content"
            required
            rows={10}
            defaultValue={post.content}
            className="w-full rounded-lg border border-input bg-background/50 p-3 text-xs outline-none focus:border-primary font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Status</label>
          <select
            name="status"
            defaultValue={post.status}
            className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-xs font-semibold outline-none focus:border-primary"
          >
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
        >
          <Save className="h-4 w-4" />
          <span>Update Post</span>
        </button>
      </form>
    </div>
  );
}
