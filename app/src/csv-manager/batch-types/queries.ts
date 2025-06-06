import { GetBatchTypes } from 'wasp/server/operations'

export const getBatchTypes: GetBatchTypes = async (args, context) => {
  return context.entities.BatchType.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })
} 