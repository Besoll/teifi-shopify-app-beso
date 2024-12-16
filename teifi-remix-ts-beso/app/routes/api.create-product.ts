import type { LoaderFunction } from "@remix-run/node";
import { apiVersion } from "../shopify.server";

export const action: LoaderFunction = async ({ request }) => {
  const { title, status, sku } = await request.json();

  const accessToken = "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";
  const apiUrl = `https://teifi-jobs-68005ff9.myshopify.com/admin/api/${apiVersion}/graphql.json`;

  const createProductQuery = `
    mutation CreateProduct($title: String!, $status: ProductStatus!) {
      productCreate(input: { title: $title, status: $status }) {
        product {
          id
          variants(first: 1) {
            edges {
              node {
                id
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const updateVariantQuery = `
    mutation UpdateVariant($id: ID!, $sku: String!) {
      productVariantUpdate(input: { id: $id, sku: $sku }) {
        productVariant {
          id
          sku
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    // Step 1: Create Product
    const productResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: createProductQuery,
        variables: { title, status },
      }),
    });

    const productData = await productResponse.json();

    if (productData.errors || productData.data.productCreate.userErrors.length) {
      throw new Error(
        productData.data.productCreate.userErrors[0]?.message || "Error creating product"
      );
    }

    const product = productData.data.productCreate.product;
    const variantId = product.variants.edges[0]?.node.id;

    // Step 2: Update SKU (if provided)
    if (sku && variantId) {
      const variantResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          query: updateVariantQuery,
          variables: { id: variantId, sku },
        }),
      });

      const variantData = await variantResponse.json();

      if (variantData.errors || variantData.data.productVariantUpdate.userErrors.length) {
        throw new Error(
          variantData.data.productVariantUpdate.userErrors[0]?.message || "Error updating variant SKU"
        );
      }
    }

    return new Response(JSON.stringify({ message: "Product created successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error(err);
    return new Response(
      JSON.stringify({ message: err.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
