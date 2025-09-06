import React, { useState } from 'react';
import { useLogisticsPartners } from '../../hooks/useAdmin';
import { useAdminContext } from '../../contexts/AdminContext';
import { usePagination } from '../../hooks/usePagination';
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
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Partner
        </button>
      </div>

      {/* Partners Table */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">All Logistics Partners</h2>
        </div>
        <div className="overflow-x-auto">
          {logisticsPartners.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No logistics partners found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Services
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                          {partner.description && (
                            <div className="text-sm text-gray-500">{partner.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {partner.contact_person && (
                          <div className="text-gray-900 font-medium">{partner.contact_person}</div>
                        )}
                        {partner.email && <div className="text-gray-900">{partner.email}</div>}
                        {partner.phone && <div className="text-gray-500">{partner.phone}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {partner.website && (
                          <div className="mb-1">
                            <a 
                              href={partner.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center"
                            >
                              Website <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        )}
                        {partner.tracking_url_template && (
                          <div className="text-gray-500">Tracking Available</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${
                        partner.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {partner.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Partner Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., BlueDart Express"
                      />
                    </div>

                    {/* Contact Person & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                        <input
                          type="text"
                          value={formData.contact_person}
                          onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Contact person name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="contact@partner.com"
                        />
                      </div>
                    </div>

                    {/* Phone & Website */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://www.partner.com"
                        />
                      </div>
                    </div>

                    {/* Tracking URL Template */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tracking URL Template</label>
                      <input
                        type="url"
                        value={formData.tracking_url_template}
                        onChange={(e) => setFormData(prev => ({ ...prev, tracking_url_template: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://track.partner.com/track?id={TRACKING_NUMBER}"
                      />
                      <p className="text-xs text-gray-500 mt-1">Use {"{TRACKING_NUMBER}"} placeholder for dynamic tracking numbers</p>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Complete business address..."
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Brief description of services offered..."
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
                        Active (available for shipping)
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingPartner ? 'Update Partner' : 'Add Partner'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
                        Are you sure you want to delete this logistics partner? This action cannot be undone and may affect existing orders.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteTarget(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
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
