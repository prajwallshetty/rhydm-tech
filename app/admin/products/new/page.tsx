import { getAdminCategories, getAdminBrands } from "@/lib/repositories/admin";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    getAdminCategories(),
    getAdminBrands(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Add New Product</h1>
        <p className="text-sm text-muted-foreground">Create a refurbished store product listing.</p>
      </div>

      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
