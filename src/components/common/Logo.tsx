import { Link } from 'react-router-dom'
import { Syringe } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  clickable?: boolean
  className?: string
}

export default function Logo({ size = 'md', clickable = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: { icon: 'h-4 w-4', text: 'text-lg', container: 'p-1.5' },
    md: { icon: 'h-5 w-5', text: 'text-2xl', container: 'p-2' },
    lg: { icon: 'h-6 w-6', text: 'text-3xl', container: 'p-2.5' }
  }

  const { icon, text, container } = sizeClasses[size]

  const logo = (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${container} rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25`}>
        <Syringe className={`${icon} text-white`} />
      </div>
      <span className={`${text} font-bold whitespace-nowrap`} style={{
        background: 'linear-gradient(to right, #14b8a6, #22d3ee)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>TeekaSetu</span>
    </div>
  )

  if (clickable) {
    return <Link to="/" className="hover:opacity-80 transition-opacity">{logo}</Link>
  }

  return logo
}
