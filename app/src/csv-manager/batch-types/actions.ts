import { BatchType } from 'wasp/entities'
import { CreateBatchType, DeleteBatchType, UpdateBatchType } from 'wasp/server/operations'

type CreateBatchTypeInput = Pick<BatchType, 'name' | 'columns'> & {
  requiredColumnIndexes: number[]
}

type UpdateBatchTypeInput = CreateBatchTypeInput & {
  id: string
}

export const createBatchType: CreateBatchType<CreateBatchTypeInput, BatchType> = async (args, context) => {
  const requiredColumns = args.requiredColumnIndexes.map(i => args.columns[i])
  
  return context.entities.BatchType.create({
    data: {
      name: args.name,
      columns: args.columns,
      requiredColumnIndexes: args.requiredColumnIndexes
    }
  })
}

export const updateBatchType: UpdateBatchType<UpdateBatchTypeInput, BatchType> = async (args, context) => {
  const { id, ...data } = args
  return context.entities.BatchType.update({
    where: { id },
    data
  })
}

export const deleteBatchType: DeleteBatchType<{ id: string }, void> = async ({ id }, context) => {
  await context.entities.BatchType.delete({
    where: { id }
  })
} 