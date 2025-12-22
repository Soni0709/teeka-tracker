/* eslint-disable react-hooks/static-components */
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Syringe, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronLeft,
  Menu,
  X,
  Stethoscope
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import type { UserProfile } from '@/types'

interface SidebarProps {
  userProfile: UserProfile | null
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/beneficiaries', label: 'Beneficiaries', icon: Users },
  { path: '/vaccinations', label: 'Vaccinations', icon: Syringe },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ userProfile }: SidebarProps) {
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 shadow-lg flex-shrink-0">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold text-foreground">TeekaSetu</span>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
              ${isActive 
                ? 'bg-primary text-white shadow-md' 
                : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground'
              }
              ${isCollapsed ? 'justify-center' : ''}`
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border space-y-3">
        {/* Theme Toggle */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && <span className="text-sm text-muted-foreground">Theme</span>}
          <ThemeToggle />
        </div>

        {/* User Info */}
        {!isCollapsed && userProfile && (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="font-medium text-foreground text-sm truncate">{userProfile.name}</p>
            <p className="text-xs text-foreground/70 truncate">{userProfile.email}</p>
            <p className="text-xs text-primary capitalize mt-1">{userProfile.role.replace('_', ' ')}</p>
          </div>
        )}

        {/* Logout Button */}
        <Button
          variant="outline"
          className={`w-full text-foreground hover:bg-destructive hover:text-white hover:border-destructive ${isCollapsed ? 'px-2' : ''}`}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">TeekaSetu</span>
          </div>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-16 left-0 bottom-0 z-40 w-64 bg-card border-r border-border
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <NavContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex fixed top-0 left-0 bottom-0 z-40 bg-card border-r border-border
          flex-col transition-all duration-300
          ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        <NavContent />
        
        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 p-1.5 rounded-full bg-card border border-border shadow-md
            hover:bg-muted transition-colors"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>
    </>
  )
}
