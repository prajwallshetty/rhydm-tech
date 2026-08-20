import { db } from "../lib/db";

async function main() {
  console.log("Searching for HSN specifications in the database...");
  const specs = await db.productSpec.findMany({
    where: {
      name: {
        contains: "hsn",
        mode: "insensitive"
      }
    },
    include: {
      product: {
        select: {
          name: true,
          sku: true
        }
      }
    }
  });

  console.log(`Found ${specs.length} specifications with 'hsn' in the name:`);
  for (const spec of specs) {
    console.log(`- Product: ${spec.product?.name} (SKU: ${spec.product?.sku}) -> Spec name: "${spec.name}", Value: "${spec.value}"`);
  }
}

main()
  .catch(console.error);
