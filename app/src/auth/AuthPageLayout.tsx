import { ReactNode } from 'react';

export function AuthPageLayout({children} : {children: ReactNode }) {
  return (
    <div className='flex min-h-screen flex-col justify-center px-4 pt-10 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 sm:shadow-xl sm:ring-1 sm:ring-gray-900/10 sm:rounded-lg sm:px-10 dark:bg-white dark:text-gray-900'>
          <div className='-mt-8'>
            { children }
          </div>
        </div>
      </div>
    </div>
  );
}
