import { CreateCsvFile, UpdateCsvFile } from 'wasp/server/operations'
import { CsvFile } from 'wasp/entities'

type CreateCsvFileInput = {
  fileName: string
  originalName: string
  batchTypeId: string
  rows: { rowData: Record<string, string>, rowIndex: number, sortOrder: number }[]
}

export type UpdateCsvFileInput = {
  id: string
  fileName: string
  rows: { id: string, rowData: Record<string, string>, sortOrder: number }[]
  deletedRowIds: string[]
}

export const createCsvFile: CreateCsvFile<CreateCsvFileInput, CsvFile> = async (args, context) => {
  if (!context.user) throw new Error('Not authenticated')

  // First create the file
  const file = await context.entities.CsvFile.create({
    data: {
      fileName: args.fileName,
      originalName: args.originalName,
      batchTypeId: args.batchTypeId,
      userId: context.user.id,
      rowCount: args.rows.length,
    }
  })

  // Then create all rows
  await context.entities.CsvRow.createMany({
    data: args.rows.map(row => ({
      rowData: row.rowData,
      sortOrder: row.sortOrder,
      rowIndex: row.rowIndex,
      csvFileId: file.id
    }))
  })

  return file
}

export const updateCsvFile: UpdateCsvFile<UpdateCsvFileInput, CsvFile> = async (args, context) => {
  if (!context.user) throw new Error('Not authenticated')

  const file = await context.entities.CsvFile.findUnique({
    where: { id: args.id },
    include: { rows: true }
  })

  if (!file) throw new Error('File not found')
  if (file.userId !== context.user.id) throw new Error('Not authorized')

  // Delete removed rows
  if (args.deletedRowIds.length > 0) {
    await context.entities.CsvRow.deleteMany({
      where: {
        id: {
          in: args.deletedRowIds
        }
      }
    })
  }

  // Update rows sequentially to maintain order
  for (const row of args.rows) {
    await context.entities.CsvRow.update({
      where: { id: row.id },
      data: { 
        rowData: row.rowData,
        sortOrder: row.sortOrder
      }
    })
  }

  // Update file name and row count
  return context.entities.CsvFile.update({
    where: { id: args.id },
    data: { 
      fileName: args.fileName,
      rowCount: args.rows.length
    },
    include: {
      batchType: true,
      rows: {
        orderBy: {
          sortOrder: 'asc'
        }
      }
    }
  })
} 