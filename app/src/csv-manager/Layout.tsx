import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import { Toaster } from '../components/ui/sonner'
import { useAuth } from 'wasp/client/auth'
import { useNavigate } from 'react-router-dom'
import { routes } from 'wasp/client/router'

export default function CsvManagerLayout({ children, type }: { children: React.ReactNode, type?: 'collapsed' }) {
  const [collapseSidebar, setCollapseSidebar] = useState(false)
  const { data: user, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (type === 'collapsed') setCollapseSidebar(true)
  }, [type])

  useEffect(() => {
    if (!isLoading && !user) {
      navigate(routes.LoginRoute.to)
    }
  }, [user, isLoading, navigate])
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user) {
    return null
  }
  
  return (
    <main className={`grid h-screen transition-all duration-150 ${collapseSidebar ? "grid-cols-[50px_auto]" : "grid-cols-[220px_auto] max-md:grid-cols-[50px_auto]"}`}>
      <Sidebar />
      <div className='h-full overflow-auto'>{children}</div>
      <Toaster />
    </main>
  )
}
