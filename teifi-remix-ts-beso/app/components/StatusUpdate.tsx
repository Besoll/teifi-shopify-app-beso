import { useState } from "react";
import { Modal, Select, Button } from "@shopify/polaris";

type StatusUpdateProps = {
  productId: string | null;
  currentStatus: string;
  onClose: () => void;
  onUpdate: (productId: string, newStatus: string) => void;
};

const StatusUpdate: React.FC<StatusUpdateProps> = ({
  productId,
  currentStatus,
  onClose,
  onUpdate,
}) => {
  const [newStatus, setNewStatus] = useState<string>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    if (!productId) return;

    setIsUpdating(true);
    try {
      await onUpdate(productId, newStatus);
      onClose();
    } catch (error) {
      console.error("Failed to update status: ", error);
      alert("An error occurred while updating status.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal
      open={!!productId}
      onClose={onClose}
      title="Update Product Status"
      primaryAction={{
        content: isUpdating ? "Saving..." : "Save",
        onAction: handleSave,
        disabled: isUpdating,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <Select
          label="Status"
          options={[
            { label: "ACTIVE", value: "ACTIVE" },
            { label: "DRAFT", value: "DRAFT" },
            { label: "ARCHIVED", value: "ARCHIVED" },
          ]}
          onChange={setNewStatus}
          value={newStatus}
        />
      </Modal.Section>
    </Modal>
  );
};

export default StatusUpdate;
