import { notFound } from "next/navigation";
import { getAdminProductById, getAdminCategories, getAdminBrands } from "@/lib/repositories/admin";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    getAdminProductById(id),
    getAdminCategories(),
    getAdminBrands(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Edit Product</h1>
        <p className="text-sm text-muted-foreground">Modify product details, specs, stock, and pricing.</p>
      </div>

      <ProductForm initialData={product} categories={categories} brands={brands} />
    </div>
  );
}
