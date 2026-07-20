"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { saveProductAction } from "@/app/admin/actions";
import { ProductCondition, PublishStatus } from "@/lib/generated/prisma/enums";

export function ProductForm({
  initialData,
  categories,
  brands,
}: {
  initialData?: any;
  categories: any[];
  brands: any[];
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [price, setPrice] = useState(initialData?.priceCents ? (initialData.priceCents / 100).toString() : "");
  const [compareAtPrice, setCompareAtPrice] = useState(
    initialData?.compareAtCents ? (initialData.compareAtCents / 100).toString() : ""
  );

  const [categoryId, setCategoryId] = useState(initialData?.categoryId || (categories[0]?.id || ""));
  const [brandId, setBrandId] = useState(initialData?.brandId || "");
  const [condition, setCondition] = useState<ProductCondition>(initialData?.condition || ProductCondition.GRADE_A);
  const [warrantyMonths, setWarrantyMonths] = useState(initialData?.warrantyMonths || 12);
  const [stock, setStock] = useState(initialData?.stock || 0);
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [bestSeller, setBestSeller] = useState(initialData?.bestSeller || false);
  const [status, setStatus] = useState<PublishStatus>(initialData?.status || PublishStatus.PUBLISHED);

  const [imageUrlInput, setImageUrlInput] = useState(
    initialData?.images ? initialData.images.map((i: any) => i.url).join(", ") : ""
  );

  const [specs, setSpecs] = useState<Array<{ group: string; name: string; value: string }>>(
    initialData?.specs && initialData.specs.length > 0
      ? initialData.specs.map((s: any) => ({ group: s.group || "", name: s.name, value: s.value }))
      : [
          { group: "Processor", name: "CPU", value: "Intel Core i7" },
          { group: "Memory", name: "RAM", value: "16GB LPDDR5" },
        ]
  );

  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialData) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const addSpec = () => {
    setSpecs([...specs, { group: "", name: "", value: "" }]);
  };

  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const updateSpec = (index: number, field: "group" | "name" | "value", val: string) => {
    const next = [...specs];
    next[index][field] = val;
    setSpecs(next);
  };

  return (
    <form action={saveProductAction} className="space-y-8 max-w-4xl">
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
      <input type="hidden" name="specs" value={JSON.stringify(specs)} />
      <input type="hidden" name="featured" value={featured ? "true" : "false"} />
      <input type="hidden" name="bestSeller" value={bestSeller ? "true" : "false"} />

      {/* Top action header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <Link
          href="/admin/products"
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Products</span>
        </Link>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
        >
          <Save className="h-4 w-4" />
          <span>{initialData ? "Update Product" : "Save Product"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left column (2 cols): Core Product Details */}
        <div className="space-y-6 md:col-span-2">
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3">Basic Information</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Product Name *</label>
              <input
                type="text"
                name="name"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Dell Latitude 7440 Ultrabook"
                className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Slug *</label>
                <input
                  type="text"
                  name="slug"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs font-mono outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">SKU *</label>
                <input
                  type="text"
                  name="sku"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. LAT7440-I7-16"
                  className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs font-mono outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Short Description</label>
              <input
                type="text"
                name="shortDescription"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief summary shown on product cards"
                className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Full Description</label>
              <textarea
                name="description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed condition notes, specifications, testing details..."
                className="w-full rounded-lg border border-input bg-background/50 p-3 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3">Pricing & Inventory</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="749.00"
                  className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-sm font-semibold outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Compare At Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="compareAtPrice"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  placeholder="1299.00"
                  className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Stock Quantity *</label>
                <input
                  type="number"
                  name="stock"
                  required
                  value={stock}
                  onChange={(e) => setStock(parseInt(e.target.value || "0", 10))}
                  className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-sm font-semibold outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3">Images</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Image URLs (comma separated)</label>
              <input
                type="text"
                name="images"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs font-mono outline-none focus:border-primary"
              />
              <p className="text-[11px] text-muted-foreground">
                Leave empty to use deterministic category placeholders.
              </p>
            </div>
          </div>

          {/* Dynamic Specifications */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-base font-semibold text-foreground">Specifications</h2>
              <button
                type="button"
                onClick={addSpec}
                className="flex items-center gap-1 rounded bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/80"
              >
                <Plus className="h-3 w-3" /> Add Spec
              </button>
            </div>

            <div className="space-y-3">
              {specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Group (e.g. Memory)"
                    value={spec.group}
                    onChange={(e) => updateSpec(i, "group", e.target.value)}
                    className="w-1/3 rounded-md border border-input bg-background/50 px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="Name (e.g. RAM)"
                    value={spec.name}
                    onChange={(e) => updateSpec(i, "name", e.target.value)}
                    className="w-1/3 rounded-md border border-input bg-background/50 px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 16GB)"
                    value={spec.value}
                    onChange={(e) => updateSpec(i, "value", e.target.value)}
                    className="w-1/3 rounded-md border border-input bg-background/50 px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(i)}
                    className="rounded p-1.5 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column (1 col): Classification & Settings */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3">Organization</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Category *</label>
              <select
                name="categoryId"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Brand</label>
              <select
                name="brandId"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary"
              >
                <option value="">None</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Condition *</label>
              <select
                name="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value as ProductCondition)}
                className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary"
              >
                <option value="GRADE_A">Grade A (Near Flawless)</option>
                <option value="GRADE_B">Grade B (Light Wear)</option>
                <option value="GRADE_C">Grade C (Visible Wear)</option>
                <option value="OPEN_BOX">Open Box</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Warranty (Months)</label>
              <input
                type="number"
                name="warrantyMonths"
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(parseInt(e.target.value || "12", 10))}
                className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3">Status & Visibility</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Publish Status</label>
              <select
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as PublishStatus)}
                className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-xs font-semibold outline-none focus:border-primary"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <span>Featured Product</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={bestSeller}
                  onChange={(e) => setBestSeller(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <span>Best Seller Badge</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
