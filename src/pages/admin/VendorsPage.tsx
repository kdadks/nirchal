import React, { useState } from 'react';
import { useVendors } from '../../hooks/useAdmin';
import { useAdminContext } from '../../contexts/AdminContext';
import { usePagination } from '../../hooks/usePagination';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/common/Pagination';
import type { Vendor } from '../../types/admin';
import { Plus, Trash2, AlertTriangle, Edit } from 'lucide-react';

const VendorsPage: React.FC = () => {
  const { vendors, loading, createVendor, updateVendor, deleteVendor } = useVendors();
  const { refreshSpecificCount } = useAdminContext();
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: '',
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
      is_active: true
    });
    setEditingVendor(null);
    setShowForm(false);
  };

  const handleEdit = (vendor: Vendor) => {
    setFormData({
      name: vendor.name,
      description: vendor.description || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      website: vendor.website || '',
      address: vendor.address || '',
      is_active: vendor.is_active
    });
    setEditingVendor(vendor);
    setShowForm(true);
  };

  // Pagination
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData: paginatedVendors,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination({
    data: vendors || [],
    defaultItemsPerPage: 25,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        await updateVendor(editingVendor.id, formData);
      } else {
        await createVendor(formData);
        // Refresh vendor count after creating new vendor
        await refreshSpecificCount('vendors');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving vendor:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    try {
      await deleteVendor(deleteTarget);
      // Refresh vendor count after deleting vendor
      await refreshSpecificCount('vendors');
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting vendor:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      title: 'Vendor',
      render: (vendor: Vendor) => (
        <div className="admin-product-title-wrapper">
          <div className="admin-product-title-link">{vendor.name}</div>
          {vendor.email && (
            <div className="admin-text-muted admin-text-sm">{vendor.email}</div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'contact',
      title: 'Contact Info',
      render: (vendor: Vendor) => (
        <div className="admin-text-sm">
          {vendor.phone && <div className="admin-text-muted">📞 {vendor.phone}</div>}
          {vendor.website && (
            <div className="admin-text-muted">
              🌐 <a href={vendor.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--admin-primary)', textDecoration: 'none' }}>
                {vendor.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (vendor: Vendor) => (
        <span className={`admin-badge ${
          vendor.is_active ? 'admin-badge-success' : 'admin-badge-neutral'
        }`}>
          {vendor.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (vendor: Vendor) => (
        <div className="admin-table-actions">
          <button
            onClick={() => handleEdit(vendor)}
            className="admin-btn admin-btn-sm admin-btn-secondary"
            title="Edit Vendor"
          >
            <Edit className="h-3 w-3" />
          </button>
          <button
            onClick={() => {
              setDeleteTarget(vendor.id);
              setShowDeleteConfirm(true);
            }}
            className="admin-btn admin-btn-sm admin-btn-danger"
            title="Delete Vendor"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Vendor Form Modal */}
      {showForm && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
              </h3>
              <button
                onClick={resetForm}
                className="admin-modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="admin-modal-content">
              <form id="vendor-form" onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-group">
                <label className="admin-label">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="admin-input"
                  required
                />
              </div>
              
              <div className="admin-form-group">
                <label className="admin-label">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="admin-input"
                />
              </div>
              
              <div className="admin-form-group">
                <label className="admin-label">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="admin-input"
                />
              </div>
              
              <div className="admin-form-group">
                <label className="admin-label">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="admin-input"
                  placeholder="https://"
                />
              </div>
              
              <div className="admin-form-group">
                <label className="admin-label">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="admin-textarea"
                />
              </div>
              
              <div className="admin-form-group">
                <div className="admin-checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="admin-checkbox"
                  />
                  <label htmlFor="is_active" className="admin-checkbox-label">
                    Active
                  </label>
                </div>
              </div>
              </form>
            </div>
            
            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={resetForm}
                className="admin-btn admin-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="vendor-form"
                className="admin-btn admin-btn-primary"
              >
                {editingVendor ? 'Update' : 'Create'} Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <div className="admin-modal-icon-wrapper">
                <AlertTriangle className="admin-icon admin-text-danger" />
                <h3 className="admin-modal-title">Confirm Delete</h3>
              </div>
            </div>
            <div className="admin-modal-content">
              <p className="admin-text-muted admin-text-sm">
                Are you sure you want to delete this vendor? This action cannot be undone.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTarget(null);
                }}
                className="admin-btn admin-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="admin-btn admin-btn-danger"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vendors Table */}
      <DataTable
        columns={columns}
        data={paginatedVendors || []}
        isLoading={loading}
        searchable={true}
        filterable={false}
        title={`Vendors (${totalItems})`}
        subtitle="Manage your vendor relationships"
        headerActions={
          <button
            onClick={() => setShowForm(true)}
            className="admin-btn admin-btn-primary"
          >
            <Plus className="admin-icon-sm admin-mr-2" />
            Add Vendor
          </button>
        }
        footerContent={
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        }
      />
    </div>
  );
};

export default VendorsPage;
