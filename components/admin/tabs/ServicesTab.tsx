'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Modal from '@/components/admin/shared/Modal';
import FormField from '@/components/admin/shared/FormField';

interface ServicesTabProps {
  services: any[];
  loading: boolean;
  fetchServices: () => Promise<void>;
  showServiceForm: boolean;
  setShowServiceForm: (show: boolean) => void;
}

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
    price: ''
  });
  const [editingService, setEditingService] = useState<any>(null);

  const resetForm = () => {
    setServiceForm({ title: '', description: '', icon: '', price: '' });
    setEditingService(null);
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setServiceForm({
      title: service.title,
      description: service.description,
      icon: service.icon,
      price: service.price || ''
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
      fetchServices();
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

      fetchServices();
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

          <FormField label="Icon (Emoji)">
            <input
              type="text"
              value={serviceForm.icon}
              onChange={(e) => setServiceForm(prev => ({ ...prev, icon: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 🧹"
            />
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
