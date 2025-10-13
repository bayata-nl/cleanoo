'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Shield, Lock, Eye, EyeOff, Mail } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome to the admin panel!",
        });
        
        router.push('/admin');
      } else {
        toast({
          title: "Login Failed",
          description: result.error || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Admin Login</h2>
          <p className="text-blue-100">Enter your credentials to access the admin panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:bg-white/20"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="pl-10 pr-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:bg-white/20"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-white" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-white" />
              )}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-white text-blue-700 hover:bg-blue-50 font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login to Admin Panel"}
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="text-blue-200 hover:text-white text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

