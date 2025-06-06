import { type BatchType } from "wasp/entities";
import { Button } from "../../../components/ui/button";
import { DialogDescription, DialogFooter } from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import React, { useState } from "react";

export default function MapFieldsComponent({
  setActiveStep,
  parsedCsv,
  setFieldMappings,
  fieldMappings,
  selectedBatchType,
}: {
  setActiveStep: React.Dispatch<React.SetStateAction<1 | 2 | 3 | 4>>;
  parsedCsv?: { data: string[][] };
  setFieldMappings: React.Dispatch<
    React.SetStateAction<
      | {
          fileColName: string;
          mappedColName: string;
        }[]
      | undefined
    >
  >;
  fieldMappings?: {
    fileColName: string;
    mappedColName: string;
  }[];
  selectedBatchType?: BatchType;
}) {
  return (
    <>
      <div className="p-5">
        <DialogDescription className="mb-2">
          Map your CSV columns to our system fields. Required fiélds are marked
          with an asterisk (*)
        </DialogDescription>
        <table className="w-full mb-4">
          <thead className="bg-gray-100 text-gray-500 p-1 px-5 rounded-sm text-sm font-semibold">
            <tr>
              <th className="text-left p-2 px-5">SYSTEM FIELD</th>
              <th className="text-left p-2">CSV COLUMN</th>
            </tr>
          </thead>
          <tbody className=" text-gray-700 p-1 px-5 rounded-sm  ">
            {selectedBatchType?.columns.map((col,colIndex) => (
              <tr key={col}>
                <td className="p-2 px-5 border-b">{col}{selectedBatchType.requiredColumnIndexes.includes(colIndex) && "*"}</td>
                <td className="p-2 border-b w-[50%]">
                  <Select
                    onValueChange={(val) => {
                      setFieldMappings?.((prev) => {
                        const newMappings = [...(prev || [])];
                        const existingMapping = newMappings.find(
                          (m) => m.mappedColName === col
                        );
                        if (existingMapping) {
                          existingMapping.fileColName = val;
                        } else {
                          newMappings.push({
                            mappedColName: col,
                            fileColName: val,
                          });
                        }
                        return newMappings;
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          fieldMappings?.find((m) => m.mappedColName === col)
                            ?.fileColName || "-- Not Mapped --"
                        }
                        defaultValue={
                          fieldMappings?.find((m) => m.mappedColName === col)
                            ?.fileColName
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {parsedCsv?.data?.[0]?.map((csvCol) => (
                        <SelectItem value={csvCol}>{csvCol}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DialogFooter className="p-5 border-t flex !justify-between w-full">
        <Button
          onClick={() => setActiveStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)}
          variant="outline"
        >
          Back
        </Button>
        <div></div>
        <Button
          disabled={
            !selectedBatchType?.columns.every((col, index) => {
              if (selectedBatchType.requiredColumnIndexes.includes(index)) {
                return fieldMappings?.some((m) => m.mappedColName === col);
              }
              return true;
            })
          }
          onClick={() => setActiveStep((prev) => (prev + 1) as 1 | 2 | 3 | 4)}
        >
          Continue
        </Button>
      </DialogFooter>
    </>
  );
}
