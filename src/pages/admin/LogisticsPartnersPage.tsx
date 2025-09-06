import React, { useState } from 'react';
import { useLogisticsPartners } from '../../hooks/useAdmin';
import { useAdminContext } from '../../contexts/AdminContext';
import { usePagination } from '../../hooks/usePagination';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/common/Pagination';
import type { LogisticsPartner } from '../../types/admin';
import { Plus, Trash2, AlertTriangle, Edit, Truck, ExternalLink } from 'lucide-react';

const LogisticsPartnersPage: React.FC = () => {
  const { logisticsPartners, loading, createLogisticsPartner, updateLogisticsPartner, deleteLogisticsPartner } = useLogisticsPartners();
  const { refreshSpecificCount } = useAdminContext();
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingPartner, setEditingPartner] = useState<LogisticsPartner | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    tracking_url_template: '',
    contact_person: '',
    is_active: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      tracking_url_template: '',
      contact_person: '',
      is_active: true
    });
    setEditingPartner(null);
    setShowForm(false);
  };

  const handleEdit = (partner: LogisticsPartner) => {
    setFormData({
      name: partner.name,
      description: partner.description || '',
      email: partner.email || '',
      phone: partner.phone || '',
      website: partner.website || '',
      address: partner.address || '',
      tracking_url_template: partner.tracking_url_template || '',
      contact_person: partner.contact_person || '',
      is_active: partner.is_active
    });
    setEditingPartner(partner);
    setShowForm(true);
  };

  // Pagination
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData: paginatedPartners,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination({
    data: logisticsPartners || [],
    defaultItemsPerPage: 25,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPartner) {
        await updateLogisticsPartner(editingPartner.id, formData);
      } else {
        await createLogisticsPartner(formData);
        // Refresh logistics partners count after creating new partner
        await refreshSpecificCount('logisticsPartners');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving logistics partner:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    try {
      await deleteLogisticsPartner(deleteTarget);
      // Refresh logistics partners count after deleting partner
      await refreshSpecificCount('logisticsPartners');
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting logistics partner:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { 
      key: 'name' as keyof LogisticsPartner, 
      title: 'Partner Name',
      sortable: true,
      render: (partner: LogisticsPartner) => (
        <div className="flex items-center space-x-2">
          <Truck className="h-4 w-4 text-blue-600" />
          <span className="font-medium">{partner.name}</span>
        </div>
      )
    },
    { 
      key: 'contact_person' as keyof LogisticsPartner, 
      title: 'Contact Person',
      sortable: true,
      render: (partner: LogisticsPartner) => (
        <span className="text-gray-600">{partner.contact_person || '-'}</span>
      )
    },
    { 
      key: 'email' as keyof LogisticsPartner, 
      title: 'Contact Info',
      sortable: false,
      render: (partner: LogisticsPartner) => (
        <div className="text-sm">
          {partner.email && <div className="text-gray-600">{partner.email}</div>}
          {partner.phone && <div className="text-gray-500">{partner.phone}</div>}
        </div>
      )
    },
    { 
      key: 'website' as keyof LogisticsPartner, 
      title: 'Website',
      sortable: false,
      render: (partner: LogisticsPartner) => (
        partner.website ? (
          <a 
            href={partner.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>Visit</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
    { 
      key: 'is_active' as keyof LogisticsPartner, 
      title: 'Status',
      sortable: true,
      render: (partner: LogisticsPartner) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${
          partner.is_active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {partner.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions' as keyof LogisticsPartner,
      title: 'Actions',
      sortable: false,
      render: (partner: LogisticsPartner) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(partner)}
            className="text-blue-600 hover:text-blue-800"
            title="Edit logistics partner"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setDeleteTarget(partner.id);
              setShowDeleteConfirm(true);
            }}
            className="text-red-600 hover:text-red-800"
            title="Delete logistics partner"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading logistics partners...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logistics Partners</h1>
          <p className="text-gray-600 mt-1">Manage shipping and delivery partners</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="admin-btn admin-btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Partner</span>
        </button>
      </div>

      {/* Partners Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DataTable
          data={paginatedPartners}
          columns={columns}
        />
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={resetForm}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <Truck className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingPartner ? 'Edit Logistics Partner' : 'Add New Logistics Partner'}
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Partner Name */}
                    <div>
                      <label className="admin-label">Partner Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="admin-input"
                        placeholder="e.g., Blue Dart Express"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="admin-label">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="admin-input"
                        rows={3}
                        placeholder="Brief description of services..."
                      />
                    </div>

                    {/* Contact Person */}
                    <div>
                      <label className="admin-label">Contact Person</label>
                      <input
                        type="text"
                        value={formData.contact_person}
                        onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                        className="admin-input"
                        placeholder="Primary contact person"
                      />
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="admin-label">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="admin-input"
                          placeholder="contact@partner.com"
                        />
                      </div>
                      <div>
                        <label className="admin-label">Phone</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="admin-input"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    {/* Website */}
                    <div>
                      <label className="admin-label">Website</label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        className="admin-input"
                        placeholder="https://www.partner.com"
                      />
                    </div>

                    {/* Tracking URL Template */}
                    <div>
                      <label className="admin-label">Tracking URL Template</label>
                      <input
                        type="url"
                        value={formData.tracking_url_template}
                        onChange={(e) => setFormData(prev => ({ ...prev, tracking_url_template: e.target.value }))}
                        className="admin-input"
                        placeholder="https://www.partner.com/track?awb={tracking_number}"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use {'{tracking_number}'} as placeholder for the tracking number
                      </p>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="admin-label">Address</label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className="admin-input"
                        rows={3}
                        placeholder="Complete business address..."
                      />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                        Active (can be assigned to orders)
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="admin-btn admin-btn-primary w-full sm:w-auto sm:ml-3"
                  >
                    {editingPartner ? 'Update Partner' : 'Add Partner'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="admin-btn admin-btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Logistics Partner
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this logistics partner? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="admin-btn admin-btn-danger w-full sm:w-auto sm:ml-3"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteTarget(null);
                  }}
                  className="admin-btn admin-btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogisticsPartnersPage;
