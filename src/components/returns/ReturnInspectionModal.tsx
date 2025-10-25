import React, { useState, useEffect } from 'react';
import { X, Package, Check, AlertTriangle } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { returnService } from '../../services/returnService';
import type {
  ReturnRequestWithItems,
  ItemCondition,
  CompleteInspectionInput,
  InspectionResultInput,
} from '../../types/return.types';
import { QUALITY_DEDUCTION_RATES } from '../../types/return.types';
import toast from 'react-hot-toast';

interface ReturnInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnRequest: ReturnRequestWithItems;
  onComplete: () => void;
}

const CONDITION_OPTIONS: { value: ItemCondition; label: string; color: string }[] = [
  { value: 'excellent', label: 'Excellent (No deduction)', color: 'text-green-700 bg-green-50 border-green-200' },
  { value: 'good', label: 'Good (5% deduction)', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { value: 'fair', label: 'Fair (15% deduction)', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  { value: 'poor', label: 'Poor (30% deduction)', color: 'text-orange-700 bg-orange-50 border-orange-200' },
  { value: 'damaged', label: 'Damaged (50% deduction)', color: 'text-red-700 bg-red-50 border-red-200' },
  { value: 'not_received', label: 'Not Received (100% deduction)', color: 'text-gray-700 bg-gray-50 border-gray-200' },
];

export const ReturnInspectionModal: React.FC<ReturnInspectionModalProps> = ({
  isOpen,
  onClose,
  returnRequest,
  onComplete,
}) => {
  const [itemConditions, setItemConditions] = useState<Record<string, ItemCondition>>({});
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [qualityIssues, setQualityIssues] = useState<Record<string, string>>({});
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Initialize with default conditions
      const initialConditions: Record<string, ItemCondition> = {};
      returnRequest.return_items?.forEach(item => {
        initialConditions[item.id] = 'excellent';
      });
      setItemConditions(initialConditions);
      setItemNotes({});
      setQualityIssues({});
      setInspectionNotes('');
    }
  }, [isOpen, returnRequest]);

  const calculateItemRefund = (item: any, condition: ItemCondition) => {
    const originalAmount = item.unit_price * item.quantity;
    const deductionPercentage = QUALITY_DEDUCTION_RATES[condition];
    const deductionAmount = (originalAmount * deductionPercentage) / 100;
    const approvedAmount = originalAmount - deductionAmount;

    return {
      originalAmount,
      deductionPercentage,
      deductionAmount,
      approvedAmount,
    };
  };

  const calculateTotalRefund = () => {
    let totalOriginal = 0;
    let totalDeduction = 0;
    let totalApproved = 0;

    returnRequest.return_items?.forEach(item => {
      const condition = itemConditions[item.id] || 'excellent';
      const calc = calculateItemRefund(item, condition);
      totalOriginal += calc.originalAmount;
      totalDeduction += calc.deductionAmount;
      totalApproved += calc.approvedAmount;
    });

    return { totalOriginal, totalDeduction, totalApproved };
  };

  const determineOverallStatus = (): 'approved' | 'partially_approved' | 'rejected' => {
    const conditions = Object.values(itemConditions);
    
    if (conditions.every(c => c === 'not_received')) {
      return 'rejected';
    }
    
    if (conditions.every(c => c === 'excellent' || c === 'good')) {
      return 'approved';
    }
    
    return 'partially_approved';
  };

  const handleSubmit = async () => {
    // Validation
    const hasAllConditions = returnRequest.return_items?.every(item => 
      itemConditions[item.id] !== undefined
    );

    if (!hasAllConditions) {
      toast.error('Please assess the condition of all items');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Not authenticated');
        return;
      }

      const inspectionResults: InspectionResultInput[] = returnRequest.return_items!.map(item => {
        const condition = itemConditions[item.id];
        const calc = calculateItemRefund(item, condition);

        return {
          item_id: item.id,
          item_condition: condition,
          inspection_notes: itemNotes[item.id] || undefined,
          quality_issue_description: qualityIssues[item.id] || undefined,
          deduction_percentage: calc.deductionPercentage,
          deduction_amount: calc.deductionAmount,
          approved_return_amount: calc.approvedAmount,
          inspection_image_urls: [], // TODO: Add image upload
        };
      });

      const input: CompleteInspectionInput = {
        return_request_id: returnRequest.id,
        inspection_results: inspectionResults,
        inspection_notes: inspectionNotes,
        inspected_by: user.id,
        overall_status: determineOverallStatus(),
      };

      const { error } = await returnService.completeInspection(input);

      if (error) {
        toast.error(`Inspection failed: ${error.message}`);
        return;
      }

      toast.success('Inspection completed! Click the email button to notify customer.', {
        duration: 5000,
        icon: '✅',
      });
      onComplete();
    } catch (error) {
      console.error('Error completing inspection:', error);
      toast.error('An error occurred during inspection');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totals = calculateTotalRefund();
  const overallStatus = determineOverallStatus();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Inspect Return</h2>
              <p className="text-sm text-gray-600 mt-1">
                Return #{returnRequest.return_number}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Return Items Inspection */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Item Inspection</h3>

            {returnRequest.return_items?.map((item) => {
              const condition = itemConditions[item.id] || 'excellent';
              const calc = calculateItemRefund(item, condition);

              return (
                <div key={item.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  {/* Item Header */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900">{item.product_name}</h4>
                    <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                      {item.variant_size && <p>Size: {item.variant_size}</p>}
                      {item.variant_color && <p>Color: {item.variant_color}</p>}
                      {item.variant_material && <p>Material: {item.variant_material}</p>}
                      {item.product_sku && <p>SKU: {item.product_sku}</p>}
                      <p className="font-medium text-gray-900 mt-2">
                        Quantity: {item.quantity} × ₹{item.unit_price.toFixed(2)} = ₹{calc.originalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Condition Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Condition
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CONDITION_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                            condition === option.value
                              ? option.color
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`condition-${item.id}`}
                            value={option.value}
                            checked={condition === option.value}
                            onChange={(e) => setItemConditions({
                              ...itemConditions,
                              [item.id]: e.target.value as ItemCondition,
                            })}
                            className="sr-only"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{option.label}</span>
                            {condition === option.value && (
                              <Check className="h-4 w-4" />
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Refund Calculation */}
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Original Amount</p>
                        <p className="font-semibold text-gray-900">₹{calc.originalAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Deduction ({calc.deductionPercentage}%)</p>
                        <p className="font-semibold text-red-600">-₹{calc.deductionAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Approved Amount</p>
                        <p className="font-semibold text-green-600">₹{calc.approvedAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quality Issue Description */}
                  {(condition === 'fair' || condition === 'poor' || condition === 'damaged') && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quality Issue Description
                      </label>
                      <textarea
                        value={qualityIssues[item.id] || ''}
                        onChange={(e) => setQualityIssues({
                          ...qualityIssues,
                          [item.id]: e.target.value,
                        })}
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Describe the quality issues..."
                      />
                    </div>
                  )}

                  {/* Item Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Inspection Notes (Optional)
                    </label>
                    <textarea
                      value={itemNotes[item.id] || ''}
                      onChange={(e) => setItemNotes({
                        ...itemNotes,
                        [item.id]: e.target.value,
                      })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Add any additional notes..."
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall Inspection Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Inspection Notes
            </label>
            <textarea
              value={inspectionNotes}
              onChange={(e) => setInspectionNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Add general notes about the inspection..."
            />
          </div>

          {/* Summary */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-4">Inspection Summary</h4>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-blue-700">Total Original</p>
                <p className="text-lg font-bold text-blue-900">₹{totals.totalOriginal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Total Deduction</p>
                <p className="text-lg font-bold text-red-600">-₹{totals.totalDeduction.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Total Approved Refund</p>
                <p className="text-lg font-bold text-green-600">₹{totals.totalApproved.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
              <AlertTriangle className={`h-5 w-5 ${
                overallStatus === 'approved' ? 'text-green-600' :
                overallStatus === 'rejected' ? 'text-red-600' : 'text-yellow-600'
              }`} />
              <span className="text-sm font-medium">
                Status: <span className="capitalize">{overallStatus.replace('_', ' ')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Complete Inspection
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
