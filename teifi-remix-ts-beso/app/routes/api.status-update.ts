import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { apiVersion } from "../shopify.server";

export const action: ActionFunction = async ({ request }) => {
  try {
    const body = await request.json();
    const { productId, newStatus } = body;

    if (!productId || !newStatus) {
      return json({ error: "Product ID and new status are required." }, { status: 400 });
    }

    const accessToken = "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";
    const shopifyApiUrl = `https://teifi-jobs-68005ff9.myshopify.com/admin/api/${apiVersion}/graphql.json`;

    const mutation = `
      mutation UpdateProductStatus($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            status
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        id: productId,
        status: newStatus,
      },
    };

    const response = await fetch(shopifyApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const result = await response.json();

    if (!response.ok || result.errors) {
      const errorMessage = result.errors?.[0]?.message || "Failed to update product status.";
      return json({ error: errorMessage }, { status: 500 });
    }

    const { userErrors } = result.data.productUpdate;

    if (userErrors && userErrors.length > 0) {
      const errorMessage = userErrors.map((err: any) => err.message).join(", ");
      return json({ error: errorMessage }, { status: 400 });
    }

    return json({ success: true, product: result.data.productUpdate.product });
  } catch (err: any) {
    console.error(err);
    return json({ error: "An unexpected error occurred." }, { status: 500 });
  }
};

export default action;
