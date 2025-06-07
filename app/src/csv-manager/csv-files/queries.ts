import { GetCsvFiles, GetCsvFile } from 'wasp/server/operations'

export const getCsvFiles: GetCsvFiles = async (args, context) => {
  if (!context.user) throw new Error('Not authenticated')
  
  return context.entities.CsvFile.findMany({
    where: {
      userId: context.user.id
    },
    orderBy: { uploadedAt: 'desc' },
    include: {
      batchType: true,
      rows: {
        orderBy: {
          id: 'asc'
        }
      }
    }
  })
}

export const getCsvFile: GetCsvFile<{ id: string }> = async ({ id }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  
  console.log('Getting CSV file with ID:', id);
  try {
    const file = await context.entities.CsvFile.findUnique({
      where: { 
        id,
        userId: context.user.id
      },
      include: {
        batchType: true,
        rows: {
          orderBy: {
            id: 'asc'
          }
        }
      }
    });
    
    console.log('Found file:', file);
    
    if (!file) {
      console.error('CSV file not found for ID:', id);
      throw new Error('CSV file not found');
    }
    
    return file;
  } catch (error) {
    console.error('Error fetching CSV file:', error);
    throw error;
  }
} 