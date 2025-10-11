'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Home, 
  Building2, 
  Car, 
  Clock, 
  User, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Zap,
  Shield,
  Award,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';
import { 
  FaHome, 
  FaBuilding, 
  FaCar, 
  FaBroom, 
  FaSparkles, 
  FaCouch,
  FaTools,
  FaWarehouse,
  FaSprayCan,
  FaShower,
  FaDoorOpen,
  FaKey,
  FaBox
} from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

import { Service } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    // Fetch services from API
    fetch('/api/services')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch services');
        }
        return res.json();
      })
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setServices(data.data);
        } else {
          console.error('Services data is not an array:', data);
          setServices([]);
        }
        setLoadingServices(false);
      })
      .catch(err => {
        console.error('Error fetching services:', err);
        setServices([]);
        setLoadingServices(false);
      });

    // Testimonials removed
  }, []);



// FontAwesome style icon mapping (fallback to lucide if not found)
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  // FontAwesome icons
  Home: FaHome,
  Building2: FaBuilding,
  Car: FaCar,
  Clock: FaBroom,
  Sparkles: FaSparkles,
  Broom: FaBroom,
  Couch: FaCouch,
  Tools: FaTools,
  Warehouse: FaWarehouse,
  SprayCan: FaSprayCan,
  Shower: FaShower,
  Door: FaDoorOpen,
  Key: FaKey,
  Box: FaBox,
  // Lucide fallbacks
  LucideHome: Home,
  LucideBuilding: Building2,
  LucideCar: Car,
  LucideClock: Clock,
  LucideSparkles: Sparkles
};


  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group cursor-pointer">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Cleanoo
              </span>
            </Link>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              {authLoading ? (
                <div className="animate-pulse bg-gray-100 rounded px-3 py-2">
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
              ) : user ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:bg-gray-100"
                  onClick={() => router.push('/dashboard')}
                >
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:bg-gray-100"
                    onClick={() => router.push('/login')}
                  >
                    Login
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md"
                    onClick={() => router.push('/register')}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Simple with Background Image */}
      <section className="relative min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 overflow-hidden">
        {/* Background Image from Unsplash */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop"
            alt="Professional Cleaning Service"
            fill
            className="object-cover"
            priority
            quality={85}
            sizes="100vw"
          />
          {/* Dark Overlay - Reduced opacity for better image visibility */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-blue-800/50 to-indigo-900/60"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto text-center text-white">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-full">
              <Sparkles className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold mb-6">
            {t('hero.title')}
            <span className="block text-blue-200">{t('hero.subtitle')}</span>
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            {t('hero.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              onClick={() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('hero.bookButton')}
            </Button>
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 bg-blue-500 text-white hover:bg-blue-600 font-semibold border-2 border-blue-400 hover:border-blue-300 shadow-lg backdrop-blur-sm"
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('hero.viewServicesButton')}
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-20"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">Our Services</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              {t('services.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('services.description')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingServices ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100 animate-pulse">
                  <div className="w-20 h-20 bg-gray-200 rounded-2xl mb-6 mx-auto"></div>
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                </div>
              ))
            ) : Array.isArray(services) && services.length > 0 ? (
              services.map((service, index) => {
                const IconComponent = iconMap[service.icon];
                const gradients = [
                  'from-blue-500 to-indigo-600',
                  'from-purple-500 to-pink-600',
                  'from-green-500 to-emerald-600',
                  'from-orange-500 to-red-600',
                  'from-cyan-500 to-blue-600',
                  'from-yellow-500 to-orange-600',
                ];
                const bgGradients = [
                  'from-blue-50 to-indigo-50',
                  'from-purple-50 to-pink-50',
                  'from-green-50 to-emerald-50',
                  'from-orange-50 to-red-50',
                  'from-cyan-50 to-blue-50',
                  'from-yellow-50 to-orange-50',
                ];
                return (
                  <div 
                    key={service.id} 
                    className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl p-8 border border-gray-100 hover:border-gray-200 transition-all duration-500 relative overflow-hidden cursor-pointer transform hover:-translate-y-2"
                  >
                    {/* Hover Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${bgGradients[index % 6]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon with Animation */}
                      <div className="flex items-center justify-center mb-6">
                        <div className={`w-20 h-20 bg-gradient-to-br ${gradients[index % 6]} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {IconComponent && <IconComponent className="h-10 w-10 text-white" />}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center group-hover:text-gray-800 transition-colors">
                        {service.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 text-center leading-relaxed mb-6 group-hover:text-gray-700 transition-colors">
                        {service.description}
                      </p>

                      {/* CTA Arrow */}
                      <div className="flex justify-center">
                        <div className="inline-flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>

                    {/* Corner Decoration */}
                    <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-12">
                <div className="inline-flex flex-col items-center space-y-4">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <Sparkles className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">No services available at the moment</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Join Our Cleaning Team Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl opacity-5"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl opacity-5"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left Content */}
          <div className="text-white space-y-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Award className="h-4 w-4" />
              <span className="text-sm font-semibold">Career Opportunity</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Join Our Cleaning Team
            </h2>
            
            <p className="text-xl text-blue-100 leading-relaxed">
              Join our dynamic team and help us deliver the best cleaning experience to our customers. 
              Enjoy flexible hours and a supportive team culture.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-xl group"
                onClick={() => router.push('/staff/register')}
              >
                Join Us
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 font-semibold"
                onClick={() => router.push('/staff/login')}
              >
                Staff Login
              </Button>
            </div>
          </div>

          {/* Right Content - Benefits Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">What We Offer</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Flexible Shifts</h4>
                  <p className="text-sm text-gray-600">Choose hours that work for you</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Performance Bonuses</h4>
                  <p className="text-sm text-gray-600">Earn more with excellent work</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Training & Growth</h4>
                  <p className="text-sm text-gray-600">Continuous learning opportunities</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Safe Environment</h4>
                  <p className="text-sm text-gray-600">Respectful and secure workplace</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">50+</div>
                  <div className="text-sm text-gray-600">Team Members</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">4.9/5</div>
                  <div className="text-sm text-gray-600">Employee Rating</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">95%</div>
                  <div className="text-sm text-gray-600">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Login to Book Section */}
      <section id="booking-form" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Ready to Book Your Cleaning?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Login to your account to book cleaning services and manage your bookings
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-10 w-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {user ? 'Welcome back!' : 'Login to Book Services'}
              </h3>
              
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {user 
                  ? 'You are already logged in. Go to your dashboard to book services.'
                  : 'Please login to your account to book cleaning services and manage your bookings.'
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <User className="h-5 w-5 mr-3" />
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => router.push('/login')}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <User className="h-5 w-5 mr-3" />
                      Login
                    </Button>
                    <Button
                      onClick={() => router.push('/register')}
                      variant="outline"
                      className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-4 px-8 rounded-xl transition-all duration-300"
                    >
                      Create Account
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="space-y-6">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Cleanoo
                </span>
              </Link>
              <p className="text-gray-400 leading-relaxed">
                Professional cleaning services for homes and offices. Making your space sparkle since 2024.
              </p>
              {/* Social Links */}
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110">
                  <Facebook className="h-5 w-5 text-gray-400 hover:text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110">
                  <Twitter className="h-5 w-5 text-gray-400 hover:text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110">
                  <Instagram className="h-5 w-5 text-gray-400 hover:text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110">
                  <Linkedin className="h-5 w-5 text-gray-400 hover:text-white" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#services" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Services
                  </a>
                </li>
                <li>
                  <a href="#booking-form" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Book Now
                  </a>
                </li>
                <li>
                  <button onClick={() => router.push('/staff/register')} className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Join Our Team
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/staff/login')} className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Staff Login
                  </button>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Our Services</h4>
              <ul className="space-y-3">
                <li className="text-gray-400 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Home Cleaning
                </li>
                <li className="text-gray-400 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Office Cleaning
                </li>
                <li className="text-gray-400 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Deep Cleaning
                </li>
                <li className="text-gray-400 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Move-In/Out
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Contact Us</h4>
              <ul className="space-y-4">
                <li>
                  <a href="mailto:info@cleanoo.nl" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-start group">
                    <Mail className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-blue-400" />
                    <span className="group-hover:underline">info@cleanoo.nl</span>
                  </a>
                </li>
                <li>
                  <a href="tel:+31123456789" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-start group">
                    <Phone className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-green-400" />
                    <span className="group-hover:underline">+31 12 345 6789</span>
                  </a>
                </li>
                <li className="text-gray-400 flex items-start">
                  <MapPin className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-red-400" />
                  <span>Amsterdam, Netherlands</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm">
                © 2024 Cleanoo. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-full blur-3xl opacity-5"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-5"></div>
      </footer>
    </div>
  );
} 