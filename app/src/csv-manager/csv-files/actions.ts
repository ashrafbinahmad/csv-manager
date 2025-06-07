import { CreateCsvFile, UpdateCsvFile, DeleteCsvFile } from 'wasp/server/operations'
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

export const createCsvFile: CreateCsvFile<CreateCsvFileInput, CsvFile> = async ({ fileName, originalName, batchTypeId, rows }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  const user = context.user // Type assertion after check

  const csvFile = await context.entities.CsvFile.create({
    data: {
      fileName,
      originalName,
      batchType: { connect: { id: batchTypeId } },
      user: { connect: { id: user.id } },
      rowCount: rows.length,
      rows: {
        create: rows.map(row => ({
          rowData: row.rowData,
          rowIndex: row.rowIndex,
          sortOrder: row.sortOrder
        }))
      }
    },
    include: {
      batchType: true,
      rows: true
    }
  })

  return csvFile
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

export const deleteCsvFile: DeleteCsvFile<{ id: string }, void> = async ({ id }, context) => {
  if (!context.user) throw new Error('Not authenticated')

  // First, verify that the file belongs to the user
  const existingFile = await context.entities.CsvFile.findUnique({
    where: { id }
  })

  if (!existingFile) throw new Error('File not found')
  if (existingFile.userId !== context.user.id) throw new Error('Not authorized')

  // Delete the file and its rows (cascade delete will handle the rows)
  await context.entities.CsvFile.delete({
    where: { id }
  })
} 