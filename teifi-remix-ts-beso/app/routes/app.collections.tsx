import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, Layout, List, Page } from "@shopify/polaris";
import { apiVersion } from "../shopify.server";

export const query = `
    {
        collections(first: 10) {
            edges {
                node {
                    id
                    handle
                    title
                    description
                }
            }
            pageInfo {
                hasNextPage
            }
        }
    }
`;

export const loader: LoaderFunction = async ({ request }) => {
    

    const accessToken = "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";


    

    try {
        const response = await fetch(`https://teifi-jobs-68005ff9.myshopify.com/admin/api/${apiVersion}/graphql.json`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": accessToken!,
            },
            body: JSON.stringify({ query })  // Send the query as a JSON object
        });

        if (response.ok) {
            const { data } = await response.json();

            return data?.collections?.edges || [];  // Return collection data
        }

        return [];  // Return an empty array if the response is not OK

    } catch (err) {
        console.error("Error fetching collections:", err);
        return [];  // Return an empty array in case of error
    }
};




// Define the structure of the collection data (optional, but recommended)
type Collection = {
    id: string;
    handle: string;
    title: string;
    description: string;
};

const Collections = () => {
    const collections: { node: Collection }[] = useLoaderData();  // Specify the expected data structure

    if (!collections || collections.length === 0) {
        return (
            <Page>
                <Layout>
                    <Layout.Section>
                        <Card>
                            <h1>No Collections Found</h1>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }

    return (
        <Page>
            <Layout>
                <Layout.Section>
                    <Card>
                        <h1>Here are the collections</h1>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <Card>
                        <List type="bullet" gap="loose">
                            {collections.map(({ node: collection }) => (
                                <List.Item key={collection.id}>
                                    <h2>{collection.title}</h2>
                                    <p>{collection.description}</p>
                                </List.Item>
                            ))}
                        </List>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
};

export default Collections;