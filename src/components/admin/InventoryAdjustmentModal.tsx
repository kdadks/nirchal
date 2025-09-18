import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Package, AlertCircle, Save, Download } from 'lucide-react';

interface InventoryAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdjust: (adjustments: Array<{
    inventoryId: string;
    adjustment: number;
    reason: string;
    reference?: string;
  }>) => Promise<void>;
  inventory: Array<{
    id: string;
    product_id: string;
    variant_id: string | null;
    quantity: number;
    low_stock_threshold: number;
    product_name: string;
    product_price: number;
    variant_price_adjustment?: number;
    cost_price?: number;
    created_at: string;
    updated_at: string;
  }>;
  selectedItems?: string[];
}

interface AdjustmentItem {
  inventoryId: string;
  productName: string;
  currentQuantity: number;
  adjustment: number;
  newQuantity: number;
  reason: string;
  reference: string;
}

const InventoryAdjustmentModal: React.FC<InventoryAdjustmentModalProps> = ({
  isOpen,
  onClose,
  onAdjust,
  inventory,
  selectedItems = []
}) => {
  const [adjustments, setAdjustments] = useState<AdjustmentItem[]>([]);
  const [bulkReason, setBulkReason] = useState('');
  const [bulkReference, setBulkReference] = useState('');
  const [bulkAdjustment, setBulkAdjustment] = useState<number | ''>('');
  const [adjustmentType, setAdjustmentType] = useState<'individual' | 'bulk'>('individual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reasonOptions = [
    'Stock Count Correction',
    'Damaged Goods',
    'Lost/Stolen Items',
    'Expired Products',
    'Returns Processing',
    'Quality Control',
    'Supplier Correction',
    'System Error Fix',
    'Physical Audit',
    'Other'
  ];

  // Initialize adjustments when modal opens or selected items change
  useEffect(() => {
    if (isOpen) {
      const itemsToAdjust = selectedItems.length > 0 
        ? inventory.filter(item => selectedItems.includes(item.id))
        : [];

      if (itemsToAdjust.length > 0) {
        setAdjustments(itemsToAdjust.map(item => ({
          inventoryId: item.id,
          productName: item.product_name,
          currentQuantity: item.quantity,
          adjustment: 0,
          newQuantity: item.quantity,
          reason: '',
          reference: ''
        })));
        setAdjustmentType('bulk');
      } else {
        setAdjustments([]);
        setAdjustmentType('individual');
      }
    }
  }, [isOpen, selectedItems, inventory]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAdjustments([]);
      setBulkReason('');
      setBulkReference('');
      setBulkAdjustment('');
      setAdjustmentType('individual');
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const addAdjustmentItem = () => {
    setAdjustments(prev => [...prev, {
      inventoryId: '',
      productName: '',
      currentQuantity: 0,
      adjustment: 0,
      newQuantity: 0,
      reason: '',
      reference: ''
    }]);
  };

  const removeAdjustmentItem = (index: number) => {
    setAdjustments(prev => prev.filter((_, i) => i !== index));
  };

  const updateAdjustment = (index: number, field: keyof AdjustmentItem, value: any) => {
    setAdjustments(prev => prev.map((item, i) => {
      if (i !== index) return item;

      const updated = { ...item, [field]: value };

      // Handle inventory selection
      if (field === 'inventoryId') {
        const inventoryItem = inventory.find(inv => inv.id === value);
        if (inventoryItem) {
          updated.productName = inventoryItem.product_name;
          updated.currentQuantity = inventoryItem.quantity;
          updated.newQuantity = inventoryItem.quantity + updated.adjustment;
        }
      }

      // Handle adjustment changes
      if (field === 'adjustment') {
        updated.newQuantity = updated.currentQuantity + Number(value);
      }

      return updated;
    }));

    // Clear error for this field
    setErrors(prev => ({ ...prev, [`${index}-${field}`]: '' }));
  };

  const applyBulkAdjustment = () => {
    if (bulkAdjustment === '' || !bulkReason) return;

    setAdjustments(prev => prev.map(item => ({
      ...item,
      adjustment: Number(bulkAdjustment),
      newQuantity: item.currentQuantity + Number(bulkAdjustment),
      reason: bulkReason,
      reference: bulkReference
    })));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (adjustments.length === 0) {
      newErrors.general = 'Please add at least one adjustment';
      setErrors(newErrors);
      return false;
    }

    adjustments.forEach((item, index) => {
      if (!item.inventoryId) {
        newErrors[`${index}-inventoryId`] = 'Please select a product';
      }
      if (!item.reason) {
        newErrors[`${index}-reason`] = 'Please provide a reason';
      }
      if (item.newQuantity < 0) {
        newErrors[`${index}-adjustment`] = 'New quantity cannot be negative';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const adjustmentData = adjustments.map(item => ({
        inventoryId: item.inventoryId,
        adjustment: item.adjustment,
        reason: item.reason,
        reference: item.reference || undefined
      }));

      await onAdjust(adjustmentData);
      onClose();
    } catch (error) {
      console.error('Failed to submit adjustments:', error);
      setErrors({ general: 'Failed to submit adjustments. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportCSVTemplate = () => {
    const headers = ['Product ID', 'Product Name', 'Current Quantity', 'Adjustment', 'Reason', 'Reference'];
    const csvContent = [
      headers.join(','),
      ...inventory.slice(0, 10).map(item => [
        item.product_id,
        `"${item.product_name}"`,
        item.quantity,
        '0',
        '""',
        '""'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_adjustment_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Inventory Adjustments</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                disabled={isSubmitting}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {errors.general && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-1 text-sm text-red-700">{errors.general}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Adjustment Type Toggle */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => setAdjustmentType('individual')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    adjustmentType === 'individual'
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                  }`}
                >
                  Individual Adjustments
                </button>
                <button
                  onClick={() => setAdjustmentType('bulk')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    adjustmentType === 'bulk'
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                  }`}
                >
                  Bulk Adjustments
                </button>
              </div>
            </div>

            {/* Bulk Adjustment Controls */}
            {adjustmentType === 'bulk' && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Bulk Adjustment Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adjustment Amount
                    </label>
                    <input
                      type="number"
                      value={bulkAdjustment}
                      onChange={(e) => setBulkAdjustment(e.target.value ? Number(e.target.value) : '')}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="e.g., -5 or +10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason
                    </label>
                    <select
                      value={bulkReason}
                      onChange={(e) => setBulkReason(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">Select reason...</option>
                      {reasonOptions.map(reason => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference (Optional)
                    </label>
                    <input
                      type="text"
                      value={bulkReference}
                      onChange={(e) => setBulkReference(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="e.g., Audit #2024-001"
                    />
                  </div>
                </div>
                <button
                  onClick={applyBulkAdjustment}
                  disabled={!bulkAdjustment || !bulkReason}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-300"
                >
                  Apply to All Items
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={addAdjustmentItem}
                className="bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </button>
              <button
                onClick={exportCSVTemplate}
                className="bg-gray-600 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-700 flex items-center"
              >
                <Download className="h-4 w-4 mr-1" />
                Export Template
              </button>
            </div>

            {/* Adjustments List */}
            <div className="max-h-96 overflow-y-auto">
              {adjustments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No adjustments added yet</p>
                  <p className="text-sm">Click "Add Item" to start making adjustments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {adjustments.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="text-sm font-medium text-gray-900">Adjustment #{index + 1}</h5>
                        <button
                          onClick={() => removeAdjustmentItem(index)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product
                          </label>
                          <select
                            value={item.inventoryId}
                            onChange={(e) => updateAdjustment(index, 'inventoryId', e.target.value)}
                            className={`w-full border rounded-md px-3 py-2 text-sm ${
                              errors[`${index}-inventoryId`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Select product...</option>
                            {inventory.map(inv => (
                              <option key={inv.id} value={inv.id}>
                                {inv.product_name} (Current: {inv.quantity})
                              </option>
                            ))}
                          </select>
                          {errors[`${index}-inventoryId`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`${index}-inventoryId`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Quantity
                          </label>
                          <input
                            type="number"
                            value={item.currentQuantity}
                            readOnly
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Adjustment
                          </label>
                          <div className="flex">
                            <button
                              type="button"
                              onClick={() => updateAdjustment(index, 'adjustment', item.adjustment - 1)}
                              className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-l-md"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              value={item.adjustment}
                              onChange={(e) => updateAdjustment(index, 'adjustment', Number(e.target.value))}
                              className={`w-full border-t border-b text-center py-2 text-sm ${
                                errors[`${index}-adjustment`] ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="0"
                            />
                            <button
                              type="button"
                              onClick={() => updateAdjustment(index, 'adjustment', item.adjustment + 1)}
                              className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-r-md"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          {errors[`${index}-adjustment`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`${index}-adjustment`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Quantity
                          </label>
                          <input
                            type="number"
                            value={item.newQuantity}
                            readOnly
                            className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 ${
                              item.newQuantity < 0 ? 'text-red-600' : ''
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason
                          </label>
                          <select
                            value={item.reason}
                            onChange={(e) => updateAdjustment(index, 'reason', e.target.value)}
                            className={`w-full border rounded-md px-3 py-2 text-sm ${
                              errors[`${index}-reason`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Select reason...</option>
                            {reasonOptions.map(reason => (
                              <option key={reason} value={reason}>{reason}</option>
                            ))}
                          </select>
                          {errors[`${index}-reason`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`${index}-reason`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reference (Optional)
                          </label>
                          <input
                            type="text"
                            value={item.reference}
                            onChange={(e) => updateAdjustment(index, 'reference', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            placeholder="e.g., Audit #2024-001"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleSubmit}
              disabled={adjustments.length === 0 || isSubmitting}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Apply Adjustments ({adjustments.length})
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryAdjustmentModal;
