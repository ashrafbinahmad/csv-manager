import { type BatchType } from "wasp/entities";
import { Button } from "../../../components/ui/button";
import { DialogFooter } from "../../../components/ui/dialog";
import React, { useState } from "react";
import { DropzoneState } from "react-dropzone";
import { IconContext } from "react-icons/lib";
import { MdDone } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export default function CompleteComponent({
  setActiveStep,
  //   dropzone,
  parsedCsv,
  //   fieldMappings,
  batchName,
  selectedBatchType,
  setOpen,
}: {
  setActiveStep: React.Dispatch<React.SetStateAction<1 | 2 | 3 | 4>>;
  //   dropzone: DropzoneState;
  parsedCsv?: { data: string[][] };
  //   fieldMappings?: {
  //     fileColName: string;
  //     mappedColName: string;
  //   }[];
  batchName: string | undefined;
  selectedBatchType: BatchType | undefined;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // const [csvFileColumns, setCsvFileColumns] = useState<string[]>([
  //   "Company",
  //   "Location",
  // ]);

  const navigate = useNavigate()
  return (
    <>
      <div className="p-5 grid gap-5">
        <div className="grid justify-center items-center gap-2 text-center">
          <div className="h-[40px] w-[40px] rounded-full bg-green-200 text-green-900 flex justify-center items-center m-auto">
            <IconContext.Provider value={{ size: "25px" }}>
              <MdDone />
            </IconContext.Provider>
          </div>
          <h2 className="font-semibold text-lg text-gray-800">
            Batch Import Successfull
          </h2>
          <p className="font-semibold text-md text-gray-500 max-w-sm">
            Your batch "{batchName}" has been successfully imported and is now
            available in your batches list.
          </p>
        </div>
        <div className="w-[400px] m-auto grid gap-3">
          <div className="bg-gray-100 p-5 w-full rounded-sm  grid gap-2">
            <div className="flex justify-between font-semibold text-sm">
              <span>Batch Name</span>
              <span>{batchName}</span>
            </div>
            <div className="flex justify-between font-semibold text-sm">
              <span>Type</span>
              <span>{selectedBatchType?.name}</span>
            </div>
            <div className="flex justify-between font-semibold text-sm">
              <span>Records</span>
              <span>{(parsedCsv?.data.length || 1) - 1}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="w-1/2" onClick={() => navigate("/batch-types")} variant={"outline"}> Go to Batch Types </Button>
            <Button className="w-1/2" onClick={() => setActiveStep(1)}> Import Another Batch </Button>
          </div>
        </div>
      </div>

      <DialogFooter className="p-5 border-t flex !justify-between w-full">
        {/* <Button
          onClick={() => setActiveStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)}
          variant="outline"
        >
          Back
        </Button> */}
        <div></div>
        <Button onClick={() => setOpen(false)}>Finish</Button>
      </DialogFooter>
    </>
  );
}
