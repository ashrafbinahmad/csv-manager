import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import { Toaster } from '../components/ui/sonner'

export default function CsvManagerLayout({ children, type }: { children: React.ReactNode, type?: 'collapsed' }) {
  const [collapseSidebar, setCollapseSidebar] = useState(false)
  useEffect(() => {
    if (type === 'collapsed') setCollapseSidebar(true)
  }, [type])
  
  return (
    <main className={`grid h-screen transition-all duration-150 ${collapseSidebar ? "grid-cols-[50px_auto]" : "grid-cols-[220px_auto] max-md:grid-cols-[50px_auto]"}`}>
      <Sidebar />
      <div className='h-full overflow-auto'>{children}</div>
      <Toaster />
    </main>
  )
}
