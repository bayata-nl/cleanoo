'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Modal from '@/components/admin/shared/Modal';
import FormField from '@/components/admin/shared/FormField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ServicesTabProps {
  services: any[];
  loading: boolean;
  fetchServices: () => Promise<void>;
  showServiceForm: boolean;
  setShowServiceForm: (show: boolean) => void;
}

// Available icons list
const AVAILABLE_ICONS = [
  { value: 'Broom', label: '🧹 Broom (General Cleaning)' },
  { value: 'SprayCan', label: '🧴 Spray Can (Deep Cleaning)' },
  { value: 'HandSparkles', label: '✨ Hand Sparkles (Premium)' },
  { value: 'Sparkles', label: '⭐ Sparkles (Luxury)' },
  { value: 'Home', label: '🏠 Home (House Cleaning)' },
  { value: 'HouseUser', label: '🏡 House User (Residential)' },
  { value: 'Building', label: '🏢 Building (Office)' },
  { value: 'Warehouse', label: '🏭 Warehouse (Industrial)' },
  { value: 'Store', label: '🏪 Store (Commercial)' },
  { value: 'Shower', label: '🚿 Shower (Bathroom)' },
  { value: 'Bed', label: '🛏️ Bed (Bedroom)' },
  { value: 'Utensils', label: '🍴 Utensils (Kitchen)' },
  { value: 'Couch', label: '🛋️ Couch (Furniture)' },
  { value: 'Car', label: '🚗 Car (Vehicle)' },
  { value: 'Door', label: '🚪 Door (Move In/Out)' },
  { value: 'Key', label: '🔑 Key (Rental)' },
  { value: 'Tools', label: '🔧 Tools (Maintenance)' },
  { value: 'PaintRoller', label: '🎨 Paint Roller (Painting)' },
  { value: 'Wind', label: '💨 Wind (Air Quality)' },
  { value: 'Snowflake', label: '❄️ Snowflake (AC Cleaning)' },
  { value: 'Box', label: '📦 Box (Organization)' },
  { value: 'Sun', label: '☀️ Sun (Window Cleaning)' },
  { value: 'Moon', label: '🌙 Moon (Night Service)' },
  { value: 'Leaf', label: '🍃 Leaf (Eco-Friendly)' },
  { value: 'Recycle', label: '♻️ Recycle (Green)' },
];

export default function ServicesTab({ 
  services, 
  loading, 
  fetchServices, 
  showServiceForm, 
  setShowServiceForm 
}: ServicesTabProps) {
  const { toast } = useToast();
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    icon: '',
    price: '',
    detailed_info: '',
    duration: '',
    features: '',
    // Translations
    title_nl: '',
    title_en: '',
    title_tr: '',
    title_pl: '',
    title_bg: '',
    title_uk: '',
    title_ro: '',
    description_nl: '',
    description_en: '',
    description_tr: '',
    description_pl: '',
    description_bg: '',
    description_uk: '',
    description_ro: '',
  });
  const [editingService, setEditingService] = useState<any>(null);

  const resetForm = () => {
    setServiceForm({ 
      title: '', description: '', icon: '', price: '', detailed_info: '', duration: '', features: '',
      title_nl: '', title_en: '', title_tr: '', title_pl: '', title_bg: '', title_uk: '', title_ro: '',
      description_nl: '', description_en: '', description_tr: '', description_pl: '', description_bg: '', description_uk: '', description_ro: '',
    });
    setEditingService(null);
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setServiceForm({
      title: service.title,
      description: service.description,
      icon: service.icon,
      price: service.price || '',
      detailed_info: service.detailed_info || '',
      duration: service.duration || '',
      features: service.features || '',
      title_nl: service.title_nl || '',
      title_en: service.title_en || '',
      title_tr: service.title_tr || '',
      title_pl: service.title_pl || '',
      title_bg: service.title_bg || '',
      title_uk: service.title_uk || '',
      title_ro: service.title_ro || '',
      description_nl: service.description_nl || '',
      description_en: service.description_en || '',
      description_tr: service.description_tr || '',
      description_pl: service.description_pl || '',
      description_bg: service.description_bg || '',
      description_uk: service.description_uk || '',
      description_ro: service.description_ro || '',
    });
    setShowServiceForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceForm.title || !serviceForm.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const url = editingService ? `/api/services/${editingService.id}` : '/api/services';
      const method = editingService ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceForm),
      });

      if (!response.ok) throw new Error('Failed to save service');

      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed to save service');

      toast({
        title: "Success",
        description: editingService ? "Service updated successfully" : "Service added successfully",
      });

      setShowServiceForm(false);
      resetForm();
      
      // Force refresh services with delay to ensure DB is updated
      setTimeout(() => {
        fetchServices();
      }, 100);
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save service.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete service');

      toast({
        title: "Success",
        description: "Service deleted successfully",
      });

      // Force refresh services with delay
      setTimeout(() => {
        fetchServices();
      }, 100);
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: "Failed to delete service.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Services Management</h2>
        <Button onClick={() => setShowServiceForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No services found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">{service.icon}</div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(service.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              {service.price && (
                <p className="text-lg font-bold text-blue-600">€{service.price}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Service Form Modal */}
      <Modal
        isOpen={showServiceForm}
        onClose={() => {
          setShowServiceForm(false);
          resetForm();
        }}
        title={editingService ? "Edit Service" : "Add New Service"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Service Title" required>
            <input
              type="text"
              value={serviceForm.title}
              onChange={(e) => setServiceForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter service title"
            />
          </FormField>

          <FormField label="Description" required>
            <textarea
              value={serviceForm.description}
              onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter service description"
            />
          </FormField>

          <FormField label="Icon" required>
            <Select
              value={serviceForm.icon}
              onValueChange={(value) => setServiceForm(prev => ({ ...prev, icon: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {AVAILABLE_ICONS.map((icon) => (
                  <SelectItem key={icon.value} value={icon.value}>
                    {icon.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Choose an icon that represents this service
            </p>
          </FormField>

          <FormField label="Price (€)">
            <input
              type="number"
              value={serviceForm.price}
              onChange={(e) => setServiceForm(prev => ({ ...prev, price: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter price"
              step="0.01"
            />
          </FormField>

          <FormField label="Duration (e.g., 2-3 hours)">
            <input
              type="text"
              value={serviceForm.duration}
              onChange={(e) => setServiceForm(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2-3 hours"
            />
          </FormField>

          <FormField label="Detailed Information">
            <textarea
              value={serviceForm.detailed_info}
              onChange={(e) => setServiceForm(prev => ({ ...prev, detailed_info: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter detailed information about this service..."
              rows={4}
            />
          </FormField>

          <FormField label="Features (one per line or comma separated)">
            <textarea
              value={serviceForm.features}
              onChange={(e) => setServiceForm(prev => ({ ...prev, features: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              rows={4}
            />
          </FormField>

          {/* Translations Section */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Translations (Title & Description)</h3>
            
            {/* Title Translations */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Title Translations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="🇳🇱 Nederlands">
                  <input
                    type="text"
                    value={serviceForm.title_nl}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, title_nl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dutch title"
                  />
                </FormField>

                <FormField label="🇬🇧 English">
                  <input
                    type="text"
                    value={serviceForm.title_en}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, title_en: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="English title"
                  />
                </FormField>

                <FormField label="🇹🇷 Türkçe">
                  <input
                    type="text"
                    value={serviceForm.title_tr}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, title_tr: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Turkish title"
                  />
                </FormField>

                <FormField label="🇵🇱 Polski">
                  <input
                    type="text"
                    value={serviceForm.title_pl}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, title_pl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Polish title"
                  />
                </FormField>

                <FormField label="🇧🇬 Български">
                  <input
                    type="text"
                    value={serviceForm.title_bg}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, title_bg: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Bulgarian title"
                  />
                </FormField>

                <FormField label="🇺🇦 Українська">
                  <input
                    type="text"
                    value={serviceForm.title_uk}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, title_uk: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ukrainian title"
                  />
                </FormField>

                <FormField label="🇷🇴 Română">
                  <input
                    type="text"
                    value={serviceForm.title_ro}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, title_ro: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Romanian title"
                  />
                </FormField>
              </div>
            </div>

            {/* Description Translations */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Description Translations</h4>
              <div className="space-y-4">
                <FormField label="🇳🇱 Nederlands">
                  <textarea
                    value={serviceForm.description_nl}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, description_nl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dutch description"
                    rows={2}
                  />
                </FormField>

                <FormField label="🇬🇧 English">
                  <textarea
                    value={serviceForm.description_en}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, description_en: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="English description"
                    rows={2}
                  />
                </FormField>

                <FormField label="🇹🇷 Türkçe">
                  <textarea
                    value={serviceForm.description_tr}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, description_tr: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Turkish description"
                    rows={2}
                  />
                </FormField>

                <FormField label="🇵🇱 Polski">
                  <textarea
                    value={serviceForm.description_pl}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, description_pl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Polish description"
                    rows={2}
                  />
                </FormField>

                <FormField label="🇧🇬 Български">
                  <textarea
                    value={serviceForm.description_bg}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, description_bg: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Bulgarian description"
                    rows={2}
                  />
                </FormField>

                <FormField label="🇺🇦 Українська">
                  <textarea
                    value={serviceForm.description_uk}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, description_uk: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ukrainian description"
                    rows={2}
                  />
                </FormField>

                <FormField label="🇷🇴 Română">
                  <textarea
                    value={serviceForm.description_ro}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, description_ro: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Romanian description"
                    rows={2}
                  />
                </FormField>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingService ? "Update Service" : "Add Service"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowServiceForm(false);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
