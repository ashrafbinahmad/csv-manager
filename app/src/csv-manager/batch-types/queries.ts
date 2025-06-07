import { GetBatchTypes } from 'wasp/server/operations'

export const getBatchTypes: GetBatchTypes = async (args, context) => {
  if (!context.user) throw new Error('Not authenticated')
  
  return context.entities.BatchType.findMany({
    where: {
      userId: context.user.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
} 