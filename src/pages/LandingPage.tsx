import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ChartBar, 
  ClipboardList, 
  Users, 
  ShieldCheck, 
  CheckCircle, 
  ArrowRight,
  Menu,
  X,
  Syringe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: ChartBar,
      title: 'Interactive Dashboard',
      description: 'Visualize vaccination data with interactive charts and graphs. Monitor coverage rates and track progress.'
    },
    {
      icon: ClipboardList,
      title: 'Vaccination Records',
      description: 'Easily record and manage vaccination details including beneficiary information, vaccine type, and dose data.'
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Different access levels for administrators and health workers ensure data security and efficient collaboration.'
    },
    {
      icon: ShieldCheck,
      title: 'Secure Data Storage',
      description: 'Built with robust security measures to ensure all vaccination and personal data remains protected.'
    }
  ]

  const benefits = [
    { title: 'Increased Efficiency', description: 'Reduce administrative burden with streamlined data entry and automated reporting.' },
    { title: 'Better Coverage Tracking', description: 'Identify under-vaccinated areas and populations to improve vaccination coverage.' },
    { title: 'Data-Driven Decisions', description: 'Make informed decisions based on real-time analytics and comprehensive reports.' },
    { title: 'Improved Coordination', description: 'Enable better coordination between health workers across different regions.' }
  ]

  const testimonials = [
    {
      quote: 'TeekaSetu has transformed how we manage our district\'s vaccination program. The analytics have helped us identify and address coverage gaps.',
      author: 'Dr. Sarah Johnson',
      role: 'District Health Officer'
    },
    {
      quote: 'The interface is intuitive and makes recording vaccinations quick and easy, even in remote areas with limited connectivity.',
      author: 'Michael Chen',
      role: 'Field Health Worker'
    },
    {
      quote: 'Being able to generate reports instantly has saved our team countless hours and improved our reporting accuracy significantly.',
      author: 'Priya Patel',
      role: 'Immunization Program Manager'
    }
  ]

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Syringe className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900">TeekaSetu</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <a href="#features" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                Features
              </a>
              <a href="#benefits" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                Benefits
              </a>
              <a href="#testimonials" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                Testimonials
              </a>
              <Link to="/login">
                <Button variant="default" size="sm">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline" size="sm">Sign Up</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 pt-2 pb-3 space-y-2">
              <a href="#features" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>
                Features
              </a>
              <a href="#benefits" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>
                Benefits
              </a>
              <a href="#testimonials" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>
                Testimonials
              </a>
              <div className="pt-2 space-y-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                Streamline Vaccination{' '}
                <span className="text-primary">Management & Tracking</span>
              </h1>
              
              <p className="mt-4 text-lg text-orange-600 font-semibold italic">
                "हर टीका, हर जीवन की सुरक्षा।"
              </p>
              
              <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
                A comprehensive solution for healthcare workers and administrators to efficiently track, manage, and analyze vaccination data across regions.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto shadow-lg">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="mt-12 lg:mt-0">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <Syringe className="h-24 w-24 text-primary mx-auto mb-4" />
                  <p className="text-gray-600">Healthcare Illustration</p>
                  <p className="text-sm text-gray-400 mt-2">Add your image to /public folder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">Features</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900">
              Comprehensive Vaccination Management
            </p>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools you need to efficiently manage vaccination programs at any scale.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-0 bg-gray-50">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">Benefits</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900">
              Why Choose TeekaSetu?
            </p>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform is designed to solve real challenges in vaccination program management.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{benefit.title}</h3>
                  <p className="mt-2 text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Trusted by Healthcare Professionals
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              See what our users have to say about TeekaSetu
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 bg-gray-50">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-white">
                Ready to get started?
              </h2>
              <p className="mt-2 text-xl text-white/80">
                Sign up today and transform your vaccination management.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100">
                  Get started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex items-center justify-center md:justify-start">
              <Syringe className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900">TeekaSetu</span>
            </div>
            <p className="mt-4 md:mt-0 text-center text-gray-500">
              © {new Date().getFullYear()} TeekaSetu. All rights reserved.
            </p>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 flex flex-col md:flex-row md:justify-between items-center gap-4">
            <p className="text-gray-500">Designed for healthcare professionals and administrators.</p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
