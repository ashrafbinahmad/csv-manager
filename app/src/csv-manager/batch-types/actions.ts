import { BatchType } from 'wasp/entities'
import { CreateBatchType, DeleteBatchType, UpdateBatchType } from 'wasp/server/operations'

type CreateBatchTypeInput = Pick<BatchType, 'name' | 'columns'> & {
  requiredColumnIndexes: number[]
}

type UpdateBatchTypeInput = CreateBatchTypeInput & {
  id: string
}

export const createBatchType: CreateBatchType<CreateBatchTypeInput, BatchType> = async (args, context) => {
  if (!context.user) throw new Error('Not authenticated')
  
  const requiredColumns = args.requiredColumnIndexes.map(i => args.columns[i])
  
  return context.entities.BatchType.create({
    data: {
      name: args.name,
      columns: args.columns,
      requiredColumnIndexes: args.requiredColumnIndexes,
      userId: context.user.id
    }
  })
}

export const updateBatchType: UpdateBatchType<UpdateBatchTypeInput, BatchType> = async (args, context) => {
  if (!context.user) throw new Error('Not authenticated')
  
  const batchType = await context.entities.BatchType.findUnique({
    where: { id: args.id }
  })
  
  if (!batchType) throw new Error('Batch type not found')
  if (batchType.userId !== context.user.id) throw new Error('Not authorized')
  
  const { id, ...data } = args
  return context.entities.BatchType.update({
    where: { id },
    data
  })
}

export const deleteBatchType: DeleteBatchType<{ id: string }, void> = async ({ id }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  
  const batchType = await context.entities.BatchType.findUnique({
    where: { id }
  })
  
  if (!batchType) throw new Error('Batch type not found')
  if (batchType.userId !== context.user.id) throw new Error('Not authorized')
  
  await context.entities.BatchType.delete({
    where: { id }
  })
} 