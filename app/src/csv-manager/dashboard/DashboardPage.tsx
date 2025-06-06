import React from 'react'
import CsvManagerLayout from '../Layout'
import { useQuery } from 'wasp/client/operations'
import { getCsvFiles } from 'wasp/client/operations'
import { getBatchTypes } from 'wasp/client/operations'
import { Link } from 'react-router-dom'
import type { CsvFile, BatchType } from 'wasp/entities'
import { PlusIcon } from 'lucide-react'

export function Dashboard() {
  const { data: csvFiles } = useQuery(getCsvFiles)
  const { data: batchTypes } = useQuery(getBatchTypes)

  const typedCsvFiles = csvFiles as CsvFile[] | undefined
  const typedBatchTypes = batchTypes as BatchType[] | undefined

  const totalRecords = typedCsvFiles?.reduce((acc: number, file: CsvFile) => acc + file.rowCount, 0) || 0
  const filesPerBatchType = typedBatchTypes?.map((type: BatchType) => ({
    name: type.name,
    count: typedCsvFiles?.filter((file: CsvFile) => file.batchTypeId === type.id).length || 0
  })) || []

  if (!typedCsvFiles?.length) {
    return (
      <CsvManagerLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to CSV Manager</h2>
            <p className="text-gray-600 mb-8">Get started by creating your first batch type</p>
            <Link
              to="/batch-types/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Batch Type
            </Link>
          </div>
        </div>
      </CsvManagerLayout>
    )
  }

  return (
    <CsvManagerLayout>
      <div className="p-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total Files" value={typedCsvFiles.length} />
          <StatCard title="Total Records" value={totalRecords} />
          <StatCard title="Batch Types" value={typedBatchTypes?.length || 0} />
        </div>

        {/* Files per Batch Type */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Files by Batch Type</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {filesPerBatchType.map(({ name, count }: { name: string; count: number }) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-gray-600">{name}</span>
                  <span className="text-gray-900 font-medium">{count} files</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Files */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Files</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {typedCsvFiles.slice(0, 5).map((file: CsvFile) => (
                <div key={file.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-900 font-medium">{file.originalName}</span>
                    <p className="text-sm text-gray-500">
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-gray-600">{file.rowCount} records</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CsvManagerLayout>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}
