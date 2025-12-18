import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Syringe, Mail, Lock, Eye, EyeOff, User, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { ThemeToggle } from '@/components/ThemeToggle'

const DISTRICTS = [
  'Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Bharatpur', 'Bhilwara', 'Bikaner',
  'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungarpur', 'Jaipur', 'Jaisalmer',
  'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Karauli', 'Kota', 'Nagaur', 'Pali',
  'Pratapgarh', 'Rajsamand', 'Sawai Madhopur', 'Sikar', 'Sirohi', 'Sri Ganganagar', 'Tonk', 'Udaipur'
]

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: '', district: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const { name, email, password, confirmPassword, role, district } = form

    if (!name || !email || !password || !confirmPassword || !role) return toast.error('Please fill all required fields')
    if (password !== confirmPassword) return toast.error('Passwords do not match')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    if (role === 'health_worker' && !district) return toast.error('Please select your district')

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name, role, district: role === 'health_worker' ? district : null } }
      })
      if (error) throw error

      if (data.user) {
        await supabase.from('user_profiles').insert({
          id: data.user.id, name, email, role,
          district: role === 'health_worker' ? district : null
        })
      }

      toast.success('Account created! Check your email to verify.')
      navigate('/login')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/20 rounded-full blur-[100px]" />

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl animate-fade-in">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25">
              <Syringe className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">TeekaSetu</span>
          </Link>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground">Start tracking vaccinations</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} className="pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} className="pl-10" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••" value={form.password} onChange={handleChange} className="pl-10 pr-9" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="confirmPassword" name="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="••••••" value={form.confirmPassword} onChange={handleChange} className="pl-10 pr-9" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select id="role" name="role" value={form.role} onChange={handleChange}>
                <option value="">Select role</option>
                <option value="admin">Administrator</option>
                <option value="health_worker">Health Worker</option>
              </Select>
            </div>

            {form.role === 'health_worker' && (
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Select id="district" name="district" value={form.district} onChange={handleChange} className="pl-10">
                    <option value="">Select district</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </Select>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white h-11 mt-2" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
