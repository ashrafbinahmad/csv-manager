import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { DialogFooter } from "../../../components/ui/dialog";
import React, { useState } from "react";
import { Label } from "../../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { DropzoneState, useDropzone } from "react-dropzone";
import { BiFile } from "react-icons/bi";
import { IconContext } from "react-icons/lib";
import { toast } from "sonner";
import { type BatchType } from "wasp/entities";
import { useQuery } from "wasp/client/operations";
import { getBatchTypes } from "wasp/client/operations";

export default function UploadFileComponent({
  setActiveStep,
  dropzone,
  setSelectedBatchType,
  selectedBatchType,
  setBatchName,
  batchName
}: {
  setActiveStep: React.Dispatch<React.SetStateAction<1 | 2 | 3 | 4>>;
  dropzone: DropzoneState;
  setSelectedBatchType: React.Dispatch<
    React.SetStateAction<BatchType | undefined>
  >;
  selectedBatchType: BatchType | undefined
  setBatchName: React.Dispatch<React.SetStateAction<string>>
  batchName: string | undefined
  batchTypes: BatchType[]
}) {
  const { data: batchTypes, isLoading } = useQuery(getBatchTypes);

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <div className="p-5 grid gap-5">
        <div>
          <Label htmlFor="batchname"> Batch Name </Label>
          <Input id="batchname" value={batchName} onChange={(e) => setBatchName(e.target.value) } />
        </div>
        <div>
          <Label htmlFor="batchtype"> Batch Type </Label>
          <RadioGroup
            className="flex gap-5 mt-2"
            onValueChange={(value) => {
              setSelectedBatchType((batchTypes as BatchType[])?.find((t) => t.id === value));
            }}
          >
            {(batchTypes as BatchType[])?.map((i) => (
              <div key={i.id} className="flex items-center gap-1">
                <RadioGroupItem value={i.id} id={i.id} />
                <Label htmlFor={i.id}>{i.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <Label htmlFor="fileinput" className="-mb-3">
          {" "}
          Upload file{" "}
        </Label>
        <div
          {...dropzone.getRootProps()}
          className="w-full p-5  border-2 border-gray-300 rounded-sm border-dashed cursor-pointer"
        >
          <input {...dropzone.getInputProps({ id: "fileinput" })} />
          {dropzone.acceptedFiles[0] ? (
            <div className="flex gap-2">
              {" "}
              <div className="left">
                <IconContext.Provider value={{ size: "40px" }}>
                  <BiFile className="fill-gray-700" />
                </IconContext.Provider>
              </div>
              <div className="right flex-grow ">
                <p className="font-semibold text-md text-gray-800">
                  {dropzone.acceptedFiles[0].path}
                </p>
                <p className="font-semibold text-xs text-gray-400">
                  {(dropzone.acceptedFiles[0].size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm font-semibold text-gray-800 text-center">
              Drag and drop your CSV file here, or click to Browse
            </p>
          )}
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
        <Button
          disabled={dropzone.acceptedFiles[0] === undefined}
          onClick={() => setActiveStep((prev) => (prev + 1) as 1 | 2 | 3 | 4)}
        >
          Continue
        </Button>
      </DialogFooter>
    </>
  );
}
