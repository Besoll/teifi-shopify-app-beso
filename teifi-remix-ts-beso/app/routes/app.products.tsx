import { useState } from "react";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { Button, Card, Layout, List, Modal, Page, Pagination, Select } from "@shopify/polaris";
import { apiVersion } from "../shopify.server";
import AddNewProduct from "app/components/AddNewProduct";
import UpdateSKU from "app/components/UpdateSKU";


type ProductEdge = {
  node: {
    id: string;
    title: string;
    status: string;
    variants: {
      edges: { node: { sku: string } }[];
    };
  };
};

type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
};

type ProductsResponse = {
  edges: ProductEdge[];
  pageInfo: PageInfo;
};


// Define GraphQL query with dynamic cursor-based pagination
const query = ({
  first,
  last,
  after,
  before,
}: {
  first?: number;
  last?: number;
  after?: string;
  before?: string;
}): string => `{
  products(${first ? `first: ${first}` : ""}${last ? `last: ${last}` : ""}${
  after ? `, after: \"${after}\"` : ""
}${before ? `, before: \"${before}\"` : ""}) {
    edges {
      node {
        id
        title
        status
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
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}`;

// export const meta: MetaFunction = () => {
//   return {
//     title: "Products",
//   };
// };

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const after = url.searchParams.get("after") || undefined;
  const before = url.searchParams.get("before") || undefined;
  const first = !before ? 5 : undefined; // Fetch first 5 products if before is not set
  const last = before ? 5 : undefined; // Fetch last 5 products if before is set

  const accessToken = "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";

  try {
    const response = await fetch(
      `https://teifi-jobs-68005ff9.myshopify.com/admin/api/${apiVersion}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/graphql",
          "X-Shopify-Access-Token": accessToken,
        },
        body: query({ first, last, after, before }),
      }
    );

    if (response.ok) {
      const { data } = (await response.json()) as { data: { products: ProductsResponse } };
      return data.products;
    }

    throw new Error("Failed to fetch products");
  } catch (err) {
    console.error(err);
    throw new Response("Error loading products", { status: 500 });
  }
};

const Products = () => {
  const { edges, pageInfo } = useLoaderData<ProductsResponse>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateModalActive, setIsCreateModalActive] = useState(false);
  const [isUpdateSKUModalActive, setIsUpdateSKUModalActive] = useState(false);
  const [activeProductForStatus, setActiveProductForStatus] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>("ACTIVE");
  const [isStatusModalActive, setIsStatusModalActive] = useState(false);

  const toggleCreateModal = () => setIsCreateModalActive(!isCreateModalActive);
  const toggleUpdateSKUModal = () => setIsUpdateSKUModalActive(!isUpdateSKUModalActive);
  const toggleStatusModal = () => setIsStatusModalActive(!isStatusModalActive);

  const handlePagination = (cursor: string | undefined, direction: "next" | "previous") => {
    const newParams = new URLSearchParams(searchParams);

    if (direction === "next") {
      if (cursor) newParams.set("after", cursor);
      newParams.delete("before");
    } else if (direction === "previous") {
      if (cursor) newParams.set("before", cursor);
      newParams.delete("after");
    }

    setSearchParams(newParams);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        alert("Copied to clipboard!");
      },
      (err) => {
        console.error("Failed to copy: ", err);
      }
    );
  };

  const handleStatusUpdate = async () => {
    if (!activeProductForStatus) return;

    try {
      const response = await fetch("/api/status-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: activeProductForStatus, newStatus }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to update status.");
      }

      alert("Status updated successfully!");
      setActiveProductForStatus(null);
      setIsStatusModalActive(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An unknown error occurred.");
    }
  };

  return (
    <Page
      title="Products"
      primaryAction={{
        content: "Add New Product",
        onAction: toggleCreateModal,
      }}
      secondaryActions={[
        {
          content: "Update SKU",
          onAction: toggleUpdateSKUModal,
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <List type="bullet">
              {edges.map(({ node }) => (
                <List.Item key={node.id}>
                  <h2>{node.title}</h2>
                  <p>Status: {node.status}</p>
                  <p>SKU: {node.variants.edges[0]?.node.sku || "N/A"}</p>
                  <p>
                    ID: {node.id}
                  </p>
                  <Button
                    onClick={() => {
                      setActiveProductForStatus(node.id);
                      toggleStatusModal();
                    }}
                    size="slim"
                  >
                    Update Status
                  </Button>
                </List.Item>
              ))}
            </List>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Pagination
            hasPrevious={pageInfo.hasPreviousPage}
            onPrevious={() => handlePagination(pageInfo.startCursor, "previous")}
            hasNext={pageInfo.hasNextPage}
            onNext={() => handlePagination(pageInfo.endCursor, "next")}
          />
        </Layout.Section>
      </Layout>

      {/* Add New Product Modal */}
      <Modal
        open={isCreateModalActive}
        onClose={toggleCreateModal}
        title="Add New Product"
      >
        <Modal.Section>
          <AddNewProduct onClose={toggleCreateModal} />
        </Modal.Section>
      </Modal>

      {/* Update SKU Modal */}
      <Modal
        open={isUpdateSKUModalActive}
        onClose={toggleUpdateSKUModal}
        title="Update SKU"
      >
        <Modal.Section>
          <UpdateSKU onClose={toggleUpdateSKUModal} />
        </Modal.Section>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        open={isStatusModalActive}
        onClose={toggleStatusModal}
        title="Update Status"
        primaryAction={{
          content: "Save",
          onAction: handleStatusUpdate,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: toggleStatusModal,
          },
        ]}
      >
        <Modal.Section>
          <Select
            label="Status"
            options={[{ label: "ACTIVE", value: "ACTIVE" }, { label: "DRAFT", value: "DRAFT" }, { label: "ARCHIVED", value: "ARCHIVED" }]}
            onChange={setNewStatus}
            value={newStatus}
          />
        </Modal.Section>
      </Modal>
    </Page>
  );
};

export default Products;
