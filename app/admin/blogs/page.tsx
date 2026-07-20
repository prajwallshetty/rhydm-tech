import Link from "next/link";
import { Plus, FileText, Edit, Trash2, Eye } from "lucide-react";
import { getAdminPosts } from "@/lib/repositories/admin";
import { deletePostAction } from "@/app/admin/actions";

export default async function AdminBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  const postsData = await getAdminPosts({
    search: params.search,
    page,
    limit: 10,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Blog CMS</h1>
          <p className="text-sm text-muted-foreground">Manage articles, news, and SEO content posts.</p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Blog Post</span>
        </Link>
      </div>

      <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/30 font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Author</th>
                <th className="p-3">Status</th>
                <th className="p-3">Published Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {postsData.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground text-sm">
                    No blog posts published yet.
                  </td>
                </tr>
              ) : (
                postsData.items.map((post) => (
                  <tr key={post.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        {post.coverImage?.url ? (
                          <img
                            src={post.coverImage.url}
                            alt={post.title}
                            className="h-10 w-10 rounded-lg object-cover border shrink-0"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-primary/10 text-primary font-bold text-xs shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate max-w-xs">{post.title}</div>
                          {post.excerpt && (
                            <div className="text-[11px] text-muted-foreground truncate max-w-xs">{post.excerpt}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">{post.slug}</td>
                    <td className="p-3">{post.author?.name || "Admin"}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          post.status === "PUBLISHED"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Not published"}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/blogs/${post.id}/edit`}
                          className="rounded p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                        <form action={deletePostAction.bind(null, post.id)} className="inline">
                          <button
                            type="submit"
                            className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
