import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("shimmer-bg rounded-md bg-muted/60", className)}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col justify-between overflow-hidden rounded-[32px] border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="space-y-5">
        {/* Image block */}
        <Skeleton className="aspect-[4/3] w-full rounded-[20px]" />
        
        {/* Texts */}
        <div className="space-y-2.5">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>

      {/* Price & CTA */}
      <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between gap-3">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3.5 w-10" />
        </div>
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function ProductDetailsSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left side gallery */}
      <div className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="size-20 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Right side info */}
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-32" />
        </div>

        <hr className="border-border/60" />

        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        <div className="space-y-3 pt-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        <div className="border border-border/60 rounded-xl p-4 space-y-3.5">
          <Skeleton className="h-4 w-1/3" />
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-5/6" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-6 space-y-3 bg-card">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        ))}
      </div>

      {/* Charts & Tables */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border p-6 space-y-4 bg-card">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="rounded-xl border border-border p-6 space-y-4 bg-card">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center py-1">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BlogSkeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="grid gap-6 md:grid-cols-3 items-center">
          <Skeleton className="md:col-span-1 aspect-[16/10] rounded-2xl" />
          <div className="md:col-span-2 space-y-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex gap-3 items-center pt-2">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CustomerSkeleton() {
  return (
    <div className="rounded-xl border border-border p-6 bg-card space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-3.5 w-24" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 pt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
