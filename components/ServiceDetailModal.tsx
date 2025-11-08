'use client';

import { X, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Service } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  onBookNow: () => void;
  IconComponent?: React.ComponentType<{ className?: string }>;
}

export default function ServiceDetailModal({ 
  isOpen, 
  onClose, 
  service, 
  onBookNow,
  IconComponent 
}: ServiceDetailModalProps) {
  const { t, language } = useLanguage();

  if (!isOpen || !service) return null;

  // Get translated service field
  const getServiceField = (service: any, field: 'title' | 'description') => {
    const translatedField = `${field}_${language}`;
    return (service[translatedField] && service[translatedField].trim()) 
      ? service[translatedField] 
      : service[field]; // Fallback to default
  };

  // Parse features if it's a JSON string
  let features: string[] = [];
  if (service.features) {
    try {
      features = JSON.parse(service.features);
    } catch (e) {
      // If not JSON, split by comma or newline
      features = service.features.split(/[,\n]/).map(f => f.trim()).filter(Boolean);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {IconComponent && (
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-3xl font-bold">{getServiceField(service, 'title')}</h2>
                {service.duration && (
                  <div className="flex items-center space-x-2 mt-2 text-blue-100">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{service.duration}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
              {t('services.modal.description')}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {getServiceField(service, 'description')}
            </p>
          </div>

          {/* Detailed Info */}
          {service.detailed_info && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t('services.modal.details')}
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {service.detailed_info}
              </p>
            </div>
          )}

          {/* Features */}
          {features.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t('services.modal.features')}
              </h3>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Price */}
          {service.price && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">{t('services.modal.startingFrom')}</p>
                <p className="text-4xl font-bold text-blue-600">{service.price}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-8 py-6 rounded-b-3xl border-t border-gray-200">
          <div className="flex space-x-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 py-6 text-lg font-semibold"
            >
              {t('common.close')}
            </Button>
            <Button
              onClick={onBookNow}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              {t('services.modal.bookNow')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

