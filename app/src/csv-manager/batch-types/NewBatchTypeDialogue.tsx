import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useEffect, useState } from "react";
import { type BatchType } from "wasp/entities";
import { Label } from "../../components/ui/label";
import { createBatchType, updateBatchType } from "wasp/client/operations";
import { toast } from "sonner";

export default function NewBatchTypeDialogue({
  open,
  setOpen,
  batchType,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  batchType?: BatchType;
}) {
  const [formData, setFormData] = useState<Partial<BatchType>>({
    columns: [""],
    requiredColumnIndexes: [],
    name: "",
  });

  useEffect(() => {
    if (batchType) {
      setFormData(batchType);
    }
  }, [batchType]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) setFormData({ columns: [""], requiredColumnIndexes: [], name: "" });
      }}
    >
      <DialogContent className="_sm:max-w-[425px] p-0 max-w-[800px] gap-0 max-h-[590px] overflow-auto">
        <div className="HEADER">
          <div className="border-b p-5">
            <DialogTitle>{batchType ? 'Edit' : 'New'} Batch Type</DialogTitle>
          </div>
        </div>

        <div className="p-5 grid gap-5">
          <div>
            <Label htmlFor="batchname"> Batch Name </Label>
            <Input
              id="batchname"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <table className="w-full mb-4">
            <thead className="bg-gray-100 text-gray-500 p-1 px-5 rounded-sm text-sm font-semibold">
              <tr>
                <th className="text-left p-2 px-5">COL. NAME</th>
                <th className="text-left p-2">REQUIRED</th>
                <th className="text-left p-2"></th>
              </tr>
            </thead>
            <tbody className=" text-gray-700 p-1 px-5 rounded-sm  ">
              {formData.columns?.map((col, index) => (
                <tr key={index}>
                  <td className="p-2 px-5 border-b">
                    <Input
                      value={col}
                      onChange={(e) => {
                        setFormData((prev) => {
                          const newColumns = [...(prev.columns || [])];
                          newColumns[index] = e.target.value;
                          return { ...prev, columns: newColumns };
                        });
                      }}
                    />
                  </td>
                  <td className="p-2 border-b ">
                    <Input
                      type="checkbox"
                      className="!w-8 accent-black"
                      checked={formData.requiredColumnIndexes?.includes(index)}
                      onChange={(e) => {
                        setFormData((prev) => {
                          const newRequired = [
                            ...(prev.requiredColumnIndexes || []),
                          ];
                          if (e.target.checked) {
                            newRequired.push(index);
                          } else {
                            const i = newRequired.indexOf(index);
                            if (i > -1) {
                              newRequired.splice(i, 1);
                            }
                          }
                          return {
                            ...prev,
                            requiredColumnIndexes: newRequired,
                          };
                        });
                      }}
                    />
                  </td>

                  <td className="p-2 border-b px-5">
                    <Button
                      onClick={() => {
                        setFormData((prev) => {
                          const newColumns = [...(prev.columns || [])];
                          newColumns.splice(index, 1);

                          const newRequired =
                            prev.requiredColumnIndexes?.reduce(
                              (acc: number[], reqIndex) => {
                                if (reqIndex < index) {
                                  acc.push(reqIndex);
                                } else if (reqIndex > index) {
                                  acc.push(reqIndex - 1);
                                }
                                return acc;
                              },
                              []
                            ) || [];

                          return {
                            ...prev,
                            columns: newColumns,
                            requiredColumnIndexes: newRequired,
                          };
                        });
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} className="p-2 px-5">
                  <Button
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        columns: [...(prev.columns || []), ""],
                      }));
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Add New Column
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <DialogFooter className="p-5 border-t flex !justify-between w-full">
          <div></div>
          <Button
            disabled={!formData.columns?.length || formData.columns.some(i => !i) || !formData.name}
            onClick={async () => {
              try {
                if (batchType) {
                  await updateBatchType({
                    id: batchType.id,
                    name: formData.name!,
                    columns: formData.columns!,
                    requiredColumnIndexes: formData.requiredColumnIndexes || []
                  });
                  setOpen(false);
                  toast.success("Batch type updated");
                  return;
                }
                await createBatchType({
                  name: formData.name!,
                  columns: formData.columns!,
                  requiredColumnIndexes: formData.requiredColumnIndexes || []
                });
                setOpen(false);
                toast.success("Batch type created");
              } catch (error: any) {
                toast.error(error.message);
              }
            }}
          >
            {batchType ? 'Save Changes' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
