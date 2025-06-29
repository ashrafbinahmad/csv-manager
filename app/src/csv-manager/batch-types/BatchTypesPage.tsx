import { useQuery } from "wasp/client/operations";
import { getBatchTypes, deleteBatchType } from "wasp/client/operations";
import { useState, useEffect } from "react";
import NewBatchTypeDialogue from "./NewBatchTypeDialogue";
import { Button } from "../../components/ui/button";
import { type BatchType } from "wasp/entities";
import CsvManagerLayout from "../Layout";
import Header from "../Header";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { ConfirmDeletionDialog } from "../../components/ui/ConfirmDeletionDialog";

export function BatchTypesPage() {
  const { data: batchTypes, isLoading } = useQuery(getBatchTypes);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [editingBatchType, setEditingBatchType] = useState<BatchType | null>(null);
  const [deletingBatchType, setDeletingBatchType] = useState<BatchType | null>(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'create') {
      setIsNewDialogOpen(true);
    }
  }, [location.search]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <CsvManagerLayout>
      <Header
        heading="Batch Types"
        description={`Total ${(batchTypes as BatchType[])?.length} batch types`}
        leftComponent={
          <Button onClick={() => setIsNewDialogOpen(true)}>
            New Batch Type
          </Button>
        }
      />
      <div className="container mx-auto p-10">
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
          {(batchTypes as BatchType[])?.map((batchType) => (
            <div key={batchType.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{batchType.name}</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingBatchType(batchType)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setDeletingBatchType(batchType)}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Columns:</h3>
                <ul className="grid grid-cols-2 max-md:grid-cols-1 gap-2">
                  {batchType.columns.map((col, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span>{col}</span>
                      {batchType.requiredColumnIndexes.includes(index) && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                          Required
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <NewBatchTypeDialogue
          open={isNewDialogOpen || !!editingBatchType}
          setOpen={(open) => {
            setIsNewDialogOpen(open);
            if (!open) setEditingBatchType(null);
          }}
          batchType={editingBatchType || undefined}
        />

        <ConfirmDeletionDialog
          open={!!deletingBatchType}
          onOpenChange={(open) => !open && setDeletingBatchType(null)}
          onConfirm={async () => {
            if (!deletingBatchType) return;
            try {
              await deleteBatchType({ id: deletingBatchType.id });
              toast.success("Batch type deleted");
              setDeletingBatchType(null);
            } catch (error: any) {
              toast.error(error.message);
            }
          }}
          title="Delete Batch Type"
          description={`Are you sure you want to delete "${deletingBatchType?.name}"? This will also delete all associated CSV files and their data. This action cannot be undone.`}
        />
      </div>
    </CsvManagerLayout>
  );
}
