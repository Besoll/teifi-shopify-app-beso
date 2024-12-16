import { useState } from "react";
import { Button, Form, FormLayout, TextField } from "@shopify/polaris";

type AddNewProductProps = {
  onClose: () => void; // Callback to close the modal
};

const AddNewProduct = ({ onClose }: AddNewProductProps) => {
  const [title, setTitle] = useState<string>("");
  const [status, setStatus] = useState<string>("DRAFT");
  const [sku, setSku] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateProduct = async () => {
      // Ensure status is uppercase
      const transformedStatus = status.trim().toUpperCase();

      if (!title.trim()) {
        setError("Product title is required");
        return;
      }

      if (!["DRAFT", "ACTIVE", "ARCHIVED"].includes(transformedStatus)) {
        setError("Product status must be one of 'DRAFT', 'ACTIVE', or 'ARCHIVED'");
        return;
      }

      setIsSubmitting(true);
      setError(null);

    try {
      const response = await fetch("/api/create-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), status: transformedStatus, sku: sku.trim() }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create product");
      }

      const data = await response.json();
      console.log(data.message); // Product created successfully
      onClose();
    } catch (err: any) {
      setError(err.message || "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleCreateProduct}>
      <FormLayout>
        <TextField
          label="Product Title"
          value={title}
          onChange={(value) => setTitle(value)}
          autoComplete="off"
          requiredIndicator
        />
        <TextField
          label="Product Status"
          value={status}
          onChange={(value) => setStatus(value)}
          autoComplete="off"
          helpText="Available statuses are 'DRAFT', 'ACTIVE', or 'ARCHIVED' (enum)."
        />
        {error && <div style={{ color: "red" }}>{error}</div>}
        <Button loading={isSubmitting} onClick={handleCreateProduct}>
          Create Product
        </Button>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
      </FormLayout>
    </Form>
  );
};

export default AddNewProduct;
