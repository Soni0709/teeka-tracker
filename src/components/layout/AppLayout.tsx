import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import type { UserProfile } from '@/types'

interface AppLayoutProps {
  userProfile: UserProfile | null
}

export default function AppLayout({ userProfile }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar userProfile={userProfile} />
      
      {/* Main Content - padding adjusts for sidebar */}
      <main className="pt-16 lg:pt-0 lg:pl-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
