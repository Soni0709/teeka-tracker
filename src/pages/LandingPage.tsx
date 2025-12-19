import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChartBar, ClipboardList, Users, ShieldCheck, ArrowRight, Menu, X, Heart, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ThemeToggle'
import Logo from '@/components/common/Logo'

const features = [
  { icon: ChartBar, title: 'Interactive Dashboard', desc: 'Real-time charts and analytics to monitor vaccination progress.' },
  { icon: ClipboardList, title: 'Smart Records', desc: 'Effortlessly manage beneficiary data and vaccination history.' },
  { icon: Users, title: 'Role-Based Access', desc: 'Secure multi-level access for admins and health workers.' },
  { icon: ShieldCheck, title: 'Bank-Grade Security', desc: 'Your data protected with enterprise-level encryption.' },
]

const stats = [
  { value: '10K+', label: 'Vaccinations Tracked' },
  { value: '500+', label: 'Health Workers' },
  { value: '32', label: 'Districts Covered' },
  { value: '99.9%', label: 'Uptime' },
]

const testimonials = [
  { quote: 'TeekaSetu transformed our vaccination program. Coverage gaps identified instantly.', author: 'Dr. Sarah Johnson', role: 'District Health Officer' },
  { quote: 'Intuitive and fast. Recording vaccinations has never been this easy.', author: 'Michael Chen', role: 'Field Health Worker' },
  { quote: 'Reports that used to take days now take seconds. Game changer!', author: 'Priya Patel', role: 'Program Manager' },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="md" />

          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</a>
            <a href="#stats" className="text-sm text-muted-foreground hover:text-primary transition-colors">Impact</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-primary transition-colors">Reviews</a>
            <ThemeToggle />
            <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link to="/signup"><Button size="sm" className="gradient-btn">Get Started</Button></Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background p-4 space-y-3 animate-fade-in">
            <a href="#features" className="block py-2 text-muted-foreground hover:text-primary" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#stats" className="block py-2 text-muted-foreground hover:text-primary" onClick={() => setMenuOpen(false)}>Impact</a>
            <a href="#testimonials" className="block py-2 text-muted-foreground hover:text-primary" onClick={() => setMenuOpen(false)}>Reviews</a>
            <div className="pt-2 space-y-2">
              <Link to="/login" onClick={() => setMenuOpen(false)}><Button variant="outline" className="w-full">Sign In</Button></Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)}><Button className="w-full gradient-btn">Get Started</Button></Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative py-16 lg:py-28 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Trusted by 500+ Health Workers</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-foreground">
              Vaccination Tracking
              <br />
              <span className="text-primary">Made Simple</span>
            </h1>
            
            <p className="text-lg text-amber-600 dark:text-amber-400 font-semibold italic mb-4 flex items-center justify-center gap-2">
              <Activity className="h-4 w-4" />
              "हर टीका, हर जीवन की सुरक्षा"
            </p>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              The modern platform for healthcare teams to track, analyze, and optimize vaccination programs with real-time insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="gradient-btn px-8 h-12 text-base shadow-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="px-8 h-12 text-base">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-2 shadow-2xl">
              <div className="rounded-xl bg-muted/50 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-xs text-muted-foreground">TeekaSetu Dashboard</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {['Total: 12,847', 'Week: 1,234', 'Rate: 87.3%', 'Pending: 156'].map((stat, i) => (
                    <div key={i} className="p-3 rounded-lg bg-card border border-border">
                      <p className="text-sm font-semibold text-foreground">{stat}</p>
                    </div>
                  ))}
                </div>
                <div className="h-32 rounded-lg bg-card border border-border flex items-end justify-around p-4 gap-1">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-emerald-500 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 bg-muted/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl sm:text-5xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold mb-2">FEATURES</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Everything You Need</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <Card key={i} className="bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold mb-2">TESTIMONIALS</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Loved by Healthcare Teams</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Card key={i} className="bg-card hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                      {t.author[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{t.author}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">"{t.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-white/90 mb-8 max-w-xl mx-auto">Join hundreds of healthcare professionals already using TeekaSetu.</p>
            <Link to="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 px-8 h-12">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <Logo size="sm" clickable={false} />
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} TeekaSetu. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
