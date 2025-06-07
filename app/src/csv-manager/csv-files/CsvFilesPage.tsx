import React, { useState } from 'react'
import CsvManagerLayout from '../Layout'
import Header from '../Header'
import { type CsvFile } from 'wasp/entities'
import { BiFile } from 'react-icons/bi'
import { IconContext } from 'react-icons/lib'
import { Button } from '../../components/ui/button'
import FileImportDialogue from './FileImportDialogue'
import { useQuery } from 'wasp/client/operations'
import { getCsvFiles } from 'wasp/client/operations'
import { useNavigate } from 'react-router-dom'

export function CsvFilesPage() {
  const { data: csvFiles, isLoading, error } = useQuery(getCsvFiles)
  console.log('CSV Files state:', { csvFiles, isLoading, error })
  
  const [importDialogueOpen, setImportDialogueOpen] = useState(false)
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <CsvManagerLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading files...</p>
        </div>
      </CsvManagerLayout>
    )
  }

  if (error) {
    return (
      <CsvManagerLayout>
        <div className="flex items-center justify-center h-full">
          <p>Error loading files: {error.message}</p>
        </div>
      </CsvManagerLayout>
    )
  }

  return (
    <CsvManagerLayout>
      <div className="flex flex-col h-full ">
        <Header heading='Imported Files' description={`Total ${(csvFiles as unknown as CsvFile[])?.length || 0} files`} leftComponent={<Button onClick={() => setImportDialogueOpen(true)}>Import CSV</Button>} />
        <div className="flex-1 p-10 flex gap-4 flex-wrap overflow-auto content-start">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <>
              {(csvFiles as unknown as CsvFile[])?.map((file) => (
                <CsvFileCard 
                  key={file.id} 
                  {...file} 
                  onClick={() => navigate(`/csv-files/${file.id}`)}
                />
              ))}
              <CsvFileCard onClick={() => setImportDialogueOpen(true)} type='new' fileName='Import new CSV' />
            </>
          )}
        </div>
      </div>
      <FileImportDialogue open={importDialogueOpen} setOpen={setImportDialogueOpen} />
    </CsvManagerLayout>
  )
}

function CsvFileCard(props: Partial<CsvFile> & { type?: 'new', onClick?: () => void }) {
  return (
    <div onClick={props.onClick} className='border-[#DEDEDE] border-2 rounded-xl basis-[200px] max-md:flex-grow h-[180px] overflow-hidden cursor-pointer hover:shadow-3 flex flex-col'>
      <div className="bg-[#F8F8F7] p-5 flex-1 flex flex-col items-center justify-center">
        <IconContext.Provider value={{ size: '50px' }}  >
          <BiFile className='fill-[#424242]' />
        </IconContext.Provider>
        <p className='font-semibold text-xs text-[#424242] text-center mt-4'>{props.fileName}</p>
        {!props.type && (
          <p className='font-semibold text-xs text-[#424242] text-center mt-2'>{props.rowCount} rows</p>
        )}
      </div>
    </div>)
}


