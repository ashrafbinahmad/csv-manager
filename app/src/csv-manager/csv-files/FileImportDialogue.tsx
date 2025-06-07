import { CgFileDocument } from "react-icons/cg";
import { MdAddBox, MdDone } from "react-icons/md";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useEffect, useState } from "react";
import MapFieldsComponent from "./components/2_MapFieldsComponent";
import UploadFileComponent from "./components/1_UploadFileComponent";
import ReviewComponent from "./components/3_ReviewComponent";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import Papa from "papaparse";
import { type BatchType } from "wasp/entities";
import CompleteComponent from "./components/4_CompleteComponent";

export default function FileImportDialogue({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const steps = ["Upload File", "Map Fields", "Review", "Complete"];
  const [parsedCsv, setParsedCsv] = useState<{ data: string[][] }>();
  const [fieldMappings, setFieldMappings] =
    useState<{ fileColName: string; mappedColName: string }[]>();
  const [batchTypes, setBatchTypes] = useState<BatchType[]>([
    {
      columns: ["Name", "Job"],
      requiredColumnIndexes: [0],
      createdAt: new Date(),
      id: "1",
      name: "People",
      userId: "mock-user-id"
    },
    {
      columns: ["Company name", "Company moto"],
      requiredColumnIndexes: [0],
      createdAt: new Date(),
      id: "2",
      name: "Company",
      userId: "mock-user-id"
    },
  ]);
  const [selectedBatchType, setSelectedBatchType] = useState<BatchType>();
  const [batchName, setBatchName] = useState<string>("");

  const dropzone = useDropzone({
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    multiple: false,
    onDropRejected: () => {
      toast.error("Invalid file/files input");
    },
  });

  useEffect(() => {
    if (!dropzone.acceptedFiles[0]) return;
    Papa.parse(dropzone.acceptedFiles[0], {
      complete(results) {
        setParsedCsv(results as unknown as { data: string[][] });
      },
    });
  }, [dropzone.acceptedFiles[0]]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        setActiveStep(1);
      }}
    >
      <DialogContent className="_sm:max-w-[425px] p-0 max-w-[800px] gap-0 max-h-[590px] overflow-auto">
        <div className="HEADER">
          <div className="border-b p-5">
            <DialogTitle>Import Batch</DialogTitle>
          </div>
          <div className="border-b pt-5 pb-[30px] px-[30px] flex gap-[4px]">
            {steps.map((step, index) => {
              const thisStepId = index + 1;
              return (
                <div
                  key={thisStepId}
                  className={`flex items-center gap-[4px]  ${
                    thisStepId === 4 ? "" : "flex-grow"
                  }`}
                >
                  <div
                    className={`CIRCLE w-8 h-8 rounded-full   flex items-center justify-center relative ${
                      thisStepId < activeStep
                        ? "bg-green-700 text-white"
                        : thisStepId === activeStep
                          ? "bg-gray-700 text-white"
                          : "bg-gray-300 text-gray-700"
                    } `}
                  >
                    {thisStepId < activeStep ? <MdDone /> : <p>{thisStepId}</p>}

                    <p className="absolute top-9 text-black text-xs font-semibold whitespace-nowrap">
                      {step}
                    </p>
                  </div>

                  <div
                    className={`LINE w-[100px] h-1  rounded-sm flex-grow ${
                      thisStepId < activeStep
                        ? "bg-green-700 text-white"
                        : "bg-gray-300 text-gray-700"
                    } ${thisStepId === 4 ? "hidden" : ""}`}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-b ">
          {activeStep === 1 && (
            <UploadFileComponent
              batchName={batchName}
              setBatchName={setBatchName}
              selectedBatchType={selectedBatchType}
              setSelectedBatchType={setSelectedBatchType}
              batchTypes={batchTypes}
              dropzone={dropzone}
              setActiveStep={setActiveStep}
            />
          )}
          {activeStep === 2 && (
            <MapFieldsComponent
              selectedBatchType={selectedBatchType}
              fieldMappings={fieldMappings}
              setFieldMappings={setFieldMappings}
              parsedCsv={parsedCsv}
              setActiveStep={setActiveStep}
            />
          )}
          {activeStep === 3 && (
            <ReviewComponent
              selectedBatchType={selectedBatchType}
              batchName={batchName}
              fieldMappings={fieldMappings}
              parsedCsv={parsedCsv}
              dropzone={dropzone}
              setActiveStep={setActiveStep}
            />
          )}
          {activeStep === 4 && (
            <CompleteComponent
              selectedBatchType={selectedBatchType}
              batchName={batchName}
              // fieldMappings={fieldMappings}
              parsedCsv={parsedCsv}
              // dropzone={dropzone}
              setActiveStep={setActiveStep}
              setOpen={setOpen}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
