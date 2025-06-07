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
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteCsvFile } from 'wasp/client/operations'
import { ConfirmDeletionDialog } from '../../components/ui/ConfirmDeletionDialog'

export function CsvFilesPage() {
  const { data: csvFiles, isLoading, error, refetch } = useQuery(getCsvFiles)
  const [importDialogueOpen, setImportDialogueOpen] = useState(false)
  const navigate = useNavigate()

  // For deletion confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const handleDeleteClick = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setPendingDeleteId(fileId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return
    try {
      await deleteCsvFile({ id: pendingDeleteId })
      toast.success('File deleted successfully')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete file')
    } finally {
      setDeleteDialogOpen(false)
      setPendingDeleteId(null)
    }
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setPendingDeleteId(null)
  }

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
                  onDelete={(e) => handleDeleteClick(file.id, e)}
                />
              ))}
              <CsvFileCard onClick={() => setImportDialogueOpen(true)} type='new' fileName='Import new CSV' />
            </>
          )}
        </div>
      </div>
      <FileImportDialogue open={importDialogueOpen} setOpen={setImportDialogueOpen} />
      <ConfirmDeletionDialog
        open={deleteDialogOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        message="Are you sure you want to delete this CSV file? This action cannot be undone."
        title="Delete CSV File"
      />
    </CsvManagerLayout>
  )
}

function CsvFileCard(props: Partial<CsvFile> & { type?: 'new', onClick?: () => void, onDelete?: (e: React.MouseEvent) => void }) {
  return (
    <div onClick={props.onClick} className='border-[#DEDEDE] border-2 rounded-xl basis-[200px] max-md:flex-grow h-[180px] overflow-hidden cursor-pointer hover:shadow-3 flex flex-col relative group'>
      <div className="bg-[#F8F8F7] p-5 flex-1 flex flex-col items-center justify-center">
        <IconContext.Provider value={{ size: '50px' }}  >
          <BiFile className='fill-[#424242]' />
        </IconContext.Provider>
        <p className='font-semibold text-xs text-[#424242] text-center mt-4'>{props.fileName}</p>
        {!props.type && (
          <p className='font-semibold text-xs text-[#424242] text-center mt-2'>{props.rowCount} rows</p>
        )}
      </div>
      {!props.type && props.onDelete && (
        <button 
          onClick={props.onDelete}
          className="absolute top-2 right-2 p-1 rounded-full bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-500" />
        </button>
      )}
    </div>
  )
}


