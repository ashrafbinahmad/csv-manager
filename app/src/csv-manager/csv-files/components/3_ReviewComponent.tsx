import { type BatchType } from "wasp/entities";
import { Button } from "../../../components/ui/button";
import { DialogFooter } from "../../../components/ui/dialog";
import React, { useState } from "react";
import { DropzoneState } from "react-dropzone";
import { createCsvFile } from "wasp/client/operations";
import { toast } from "sonner";

export default function ReviewComponent({
  setActiveStep,
  dropzone,
  parsedCsv,
  fieldMappings,
  batchName,
  selectedBatchType,
}: {
  setActiveStep: React.Dispatch<React.SetStateAction<1 | 2 | 3 | 4>>;
  dropzone: DropzoneState;
  parsedCsv?: { data: string[][] };
  fieldMappings?: {
    fileColName: string;
    mappedColName: string;
  }[];
  batchName: string | undefined;
  selectedBatchType: BatchType | undefined;
}) {
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    try {
      if (!selectedBatchType || !batchName || !parsedCsv?.data || !fieldMappings?.length) {
        toast.error("Missing required data");
        return;
      }

      setIsImporting(true);
      const [headers, ...dataRows] = parsedCsv.data;
      const rows = dataRows.map((row, index) => {
        const rowData: Record<string, string> = {};
        fieldMappings.forEach(mapping => {
          const columnIndex = headers.indexOf(mapping.fileColName);
          if (columnIndex !== -1) {
            rowData[mapping.mappedColName] = row[columnIndex];
          }
        });
        return {
          rowData,
          rowIndex: index,
          sortOrder: index
        };
      });

      await createCsvFile({
        fileName: batchName,
        originalName: dropzone.acceptedFiles[0].name,
        batchTypeId: selectedBatchType.id,
        rows
      });

      toast.success("File imported successfully");
      setActiveStep(4);
    } catch (error: any) {
      toast.error(error.message || "Failed to import file");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <div className="p-5 grid gap-5">
        <div>
          <h2 className="font-semibold text-lg text-gray-800">
            Batch Information
          </h2>
          <div className="bg-gray-100 p-4 w-full rounded-sm flex flex-wrap gap-3">
            <div className="basis-[250px] whitespace-nowrap flex-grow">
              <h3 className="text-gray-700 text-sm font-semibold">
                Batch Name
              </h3>
              <p className="text-gray-700 text-sm">{batchName}</p>
            </div>
            <div className="basis-[250px] whitespace-nowrap flex-grow">
              <h3 className="text-gray-700 text-sm font-semibold">
                Batch Type
              </h3>
              <p className="text-gray-700 text-sm">{selectedBatchType?.name}</p>
            </div>
            <div className="basis-[250px] whitespace-nowrap flex-grow">
              <h3 className="text-gray-700 text-sm font-semibold">File</h3>
              <p className="text-gray-700 text-sm">
                {dropzone.acceptedFiles[0].path}
              </p>
            </div>
            <div className="basis-[250px] whitespace-nowrap flex-grow">
              <h3 className="text-gray-700 text-sm font-semibold">Records</h3>
              <p className="text-gray-700 text-sm">
                {(parsedCsv?.data.length || 1) - 1}{" "}
              </p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="font-semibold text-lg text-gray-800">Field Mapping</h2>
          <div className="bg-gray-100 p-4 w-full rounded-sm flex flex-wrap gap-3">
            <table className="w-full mb-4">
              <thead className="bg-gray-100 text-gray-500 p-1  rounded-sm text-sm font-semibold">
                <tr>
                  <th className="text-left text-sm p-2 ">SYSTEM FIELD</th>
                  <th className="text-left text-sm p-2">CSV COLUMN</th>
                </tr>
              </thead>
              <tbody className=" text-gray-700 p-1  rounded-sm  ">
                {fieldMappings?.map((col) => (
                  <tr key={col.mappedColName}>
                    <td className="p-2  font-medium text-sm">{col.mappedColName}</td>
                    <td className="p-2 font-medium w-[50%] text-sm">
                      {col.fileColName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="font-semibold text-lg text-gray-800">Data Preview</h2>
          <div className="bg-gray-100 p-4 rounded-sm flex flex-wrap gap-3 max-h-[200px] overflow-auto max-w-[740px]">
            <table className=" mb-4 ">
              <thead className="bg-gray-100 text-gray-500 p-1  rounded-sm text-sm font-semibold">
                <tr>
                  {parsedCsv?.data[0].map((header) => (
                    <th className="text-left text-sm p-2 border-b">{header.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody className=" text-gray-700 p-1  rounded-sm  ">
                {parsedCsv?.data?.slice(1).map((rowData, index) => (
                  <tr key={index}>
                    {rowData.map((cellData, cellInd) => (
                      <td key={cellInd} className="p-2  font-medium border-b text-sm">{cellData}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <DialogFooter className="p-5 border-t flex !justify-between w-full">
        <Button
          onClick={() => setActiveStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)}
          variant="outline"
        >
          Back
        </Button>
        <Button
          disabled={isImporting}
          onClick={handleImport}
        >
          {isImporting ? 'Importing...' : 'Import'}
        </Button>
      </DialogFooter>
    </>
  );
}
