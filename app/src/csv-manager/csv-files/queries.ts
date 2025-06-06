import { GetCsvFiles, GetCsvFile } from 'wasp/server/operations'

export const getCsvFiles: GetCsvFiles = async (args, context) => {
  return context.entities.CsvFile.findMany({
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
  console.log('Getting CSV file with ID:', id);
  try {
    const file = await context.entities.CsvFile.findUnique({
      where: { id },
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