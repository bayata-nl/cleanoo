'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useStaffAuth } from '@/contexts/StaffAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Sparkles } from 'lucide-react';

export default function StaffLogin() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useStaffAuth();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      
      if (success) {
        toast({
          title: "Success",
          description: "Login successful!",
        });
        router.push('/staff/dashboard');
      } else {
        toast({
          title: "Error",
          description: "Invalid email or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Language Switcher */}
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>

        <div>
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">{t('staff.login.title')}</h1>
          </div>
          <h2 className="text-center text-lg text-gray-600">
            {t('staff.login.subtitle')}
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('staff.login.email')}
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full"
                placeholder={t('auth.login.emailPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('staff.login.password')}
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full"
                placeholder={t('auth.login.passwordPlaceholder')}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? t('staff.login.signingIn') : t('staff.login.button')}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {t('staff.login.noAccount')}{' '}
              <a href="/staff/register" className="font-medium text-blue-600 hover:text-blue-500">
                {t('staff.login.register')}
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

