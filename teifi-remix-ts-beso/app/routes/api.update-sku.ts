import { LoaderFunction } from "@remix-run/node";
import { apiVersion } from "../shopify.server";

export const action: LoaderFunction = async ({ request }) => {
  try {
    const body = await request.json();

    // Validate and ensure productId and newSku are provided
    const productId: string = body.productId;
    const newSku: string = body.newSku;

    if (!productId || !newSku) {
      throw new Error("Both productId and newSku are required.");
    }

    // Validate productId to ensure it is a valid Shopify Global ID
    if (!/^gid:\/\/shopify\/Product\/\d+$/.test(productId)) {
      throw new Error("Invalid productId format. It must be a Shopify Global ID.");
    }

    const accessToken = "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";
    const apiUrl = `https://teifi-jobs-68005ff9.myshopify.com/admin/api/${apiVersion}/graphql.json`;

    const fetchProductQuery = `
      query FetchProduct($id: ID!) {
        product(id: $id) {
          id
          title
          variants(first: 1) {
            edges {
              node {
                id
                sku
              }
            }
          }
        }
      }
    `;

    const updateVariantQuery = `
      mutation UpdateVariant($input: ProductVariantInput!) {
        productVariantUpdate(input: $input) {
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

    // Step 1: Fetch Product Details
    const fetchResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: fetchProductQuery,
        variables: { id: productId },
      }),
    });

    const fetchRawResponse = await fetchResponse.text();
    const fetchResult = JSON.parse(fetchRawResponse);

    if (fetchResult.errors) {
      throw new Error(fetchResult.errors[0]?.message || "Unknown Shopify error during product fetch");
    }

    const product = fetchResult.data?.product;
    if (!product) {
      throw new Error("Product not found with the provided ID");
    }

    const variantId = product.variants?.edges[0]?.node?.id;
    if (!variantId) {
      throw new Error("Default variant not found for the product");
    }

    // Step 2: Update SKU
    const updateResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: updateVariantQuery,
        variables: {
          input: {
            id: variantId,
            sku: newSku,
          },
        },
      }),
    });

    const updateRawResponse = await updateResponse.text();
    const updateResult = JSON.parse(updateRawResponse);

    if (updateResult.errors) {
      throw new Error(updateResult.errors[0]?.message || "Unknown Shopify error during variant update");
    }

    if (updateResult.data.productVariantUpdate.userErrors.length > 0) {
      throw new Error(updateResult.data.productVariantUpdate.userErrors[0].message);
    }

    return new Response(
      JSON.stringify({
        message: "SKU updated successfully!",
        productVariant: updateResult.data.productVariantUpdate.productVariant,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error updating SKU:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
