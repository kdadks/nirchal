import React, { useState, useEffect } from 'react';
import { X, Package, AlertCircle, Upload, Trash2 } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { returnEligibilityService } from '../../services/returnEligibilityService';
import { returnService } from '../../services/returnService';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import type { ReturnEligibilityCheck, ReturnReason, CreateReturnRequestInput } from '../../types/return.types';
import toast from 'react-hot-toast';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  product_variant_id?: string;
  variant_size?: string;
  variant_color?: string;
  variant_material?: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  delivered_at: string;
  order_items: OrderItem[];
}

interface ReturnRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onSuccess?: () => void;
  inline?: boolean; // New prop for inline rendering
}

const RETURN_REASONS: { value: ReturnReason; label: string; description: string }[] = [
  {
    value: 'defective',
    label: 'Defective/Damaged Product',
    description: 'Product arrived damaged or has manufacturing defects',
  },
  {
    value: 'wrong_item',
    label: 'Wrong Item Received',
    description: 'Received different product than ordered',
  },
  {
    value: 'size_issue',
    label: 'Size/Fit Issue',
    description: 'Product doesn\'t fit as expected',
  },
  {
    value: 'quality_issue',
    label: 'Quality Not Satisfactory',
    description: 'Product quality doesn\'t meet expectations',
  },
  {
    value: 'not_as_described',
    label: 'Not As Described',
    description: 'Product differs from description/images',
  },
  {
    value: 'changed_mind',
    label: 'Changed Mind',
    description: 'No longer need the product',
  },
  {
    value: 'other',
    label: 'Other Reason',
    description: 'Please provide details',
  },
];

export const ReturnRequestForm: React.FC<ReturnRequestFormProps> = ({
  isOpen,
  onClose,
  order,
  onSuccess,
  inline = false,
}) => {
  const { customer } = useCustomerAuth();
  const [step, setStep] = useState<'check' | 'select' | 'details' | 'confirm'>('check');
  const [eligibility, setEligibility] = useState<ReturnEligibilityCheck | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>(order.order_items);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // Form state
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [returnReason, setReturnReason] = useState<ReturnReason | ''>('');
  const [reasonDescription, setReasonDescription] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [returnAddress, setReturnAddress] = useState('');

  // Fetch order items if not provided
  useEffect(() => {
    if (isOpen && (!order.order_items || order.order_items.length === 0)) {
      loadOrderItems();
    } else {
      setOrderItems(order.order_items);
    }
  }, [isOpen, order.id]);

  const loadOrderItems = async () => {
    setIsLoadingItems(true);
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      if (error) throw error;
      setOrderItems((data as unknown as OrderItem[]) || []);
    } catch (error) {
      console.error('Error loading order items:', error);
      toast.error('Failed to load order items');
    } finally {
      setIsLoadingItems(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkEligibility();
      loadReturnAddress();
    } else {
      resetForm();
    }
  }, [isOpen, order.id]);

  const checkEligibility = async () => {
    setIsCheckingEligibility(true);
    try {
      const result = await returnEligibilityService.checkOrderEligibility(order.id);
      setEligibility(result);

      if (result.isEligible) {
        setStep('select');
        // Pre-select all eligible items
        const eligibleIds = new Set(result.eligibleItems.map(item => item.id));
        setSelectedItems(eligibleIds);
        // Set max quantities
        const quantities: Record<string, number> = {};
        result.eligibleItems.forEach(item => {
          quantities[item.id] = item.quantity;
        });
        setItemQuantities(quantities);
      } else {
        setStep('check');
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
      toast.error('Failed to check return eligibility');
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  const loadReturnAddress = async () => {
    try {
      // Load return address from settings
      const { data: settings } = await supabase
        .from('settings')
        .select('value')
        .eq('category', 'returns')
        .eq('key', 'return_address')
        .single();

      if (settings?.value) {
        setReturnAddress(String(settings.value));
      }
    } catch (error) {
      console.error('Error loading return address:', error);
    }
  };

  const resetForm = () => {
    setStep('check');
    setEligibility(null);
    setSelectedItems(new Set());
    setItemQuantities({});
    setReturnReason('');
    setReasonDescription('');
    setUploadedImages([]);
    setVideoUrl('');
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
      const newQuantities = { ...itemQuantities };
      delete newQuantities[itemId];
      setItemQuantities(newQuantities);
    } else {
      newSelected.add(itemId);
      const item = eligibility?.eligibleItems.find(i => i.id === itemId);
      if (item) {
        setItemQuantities({
          ...itemQuantities,
          [itemId]: item.quantity,
        });
      }
    }
    setSelectedItems(newSelected);
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    const item = eligibility?.eligibleItems.find(i => i.id === itemId);
    if (item && quantity >= 1 && quantity <= item.quantity) {
      setItemQuantities({
        ...itemQuantities,
        [itemId]: quantity,
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // TODO: Implement actual image upload to Supabase Storage
    // For now, just store file names
    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    setUploadedImages([...uploadedImages, ...newImages]);
    toast.success(`${files.length} image(s) uploaded`);
  };

  const removeImage = (index: number) => {
    const newImages = [...uploadedImages];
    newImages.splice(index, 1);
    setUploadedImages(newImages);
  };

  const handleSubmit = async () => {
    if (!returnReason) {
      toast.error('Please select a return reason');
      return;
    }

    if (selectedItems.size === 0) {
      toast.error('Please select at least one item to return');
      return;
    }

    if (!reasonDescription.trim()) {
      toast.error('Please provide details about your return');
      return;
    }

    setIsSubmitting(true);
    try {
      // Use customer ID from CustomerAuthContext
      if (!customer) {
        toast.error('Please log in to submit a return request');
        setIsSubmitting(false);
        return;
      }

      const items = Array.from(selectedItems).map(itemId => {
        const orderItem = orderItems.find(oi => oi.id === itemId)!;
        return {
          order_item_id: itemId,
          product_id: orderItem.product_id,
          product_name: orderItem.product_name,
          product_variant_id: orderItem.product_variant_id,
          variant_size: orderItem.variant_size,
          variant_color: orderItem.variant_color,
          variant_material: orderItem.variant_material,
          product_sku: orderItem.product_sku,
          quantity_ordered: orderItem.quantity,
          quantity_to_return: itemQuantities[itemId],
          unit_price: orderItem.unit_price,
          total_price: orderItem.unit_price * itemQuantities[itemId],
          customer_notes: reasonDescription,
          image_urls: uploadedImages,
        };
      });

      const input: CreateReturnRequestInput = {
        order_id: order.id,
        customer_id: customer.id,
        request_type: 'return_refund',
        return_reason: returnReason,
        reason_description: reasonDescription,
        pickup_address: returnAddress,
        customer_images: uploadedImages,
        customer_video_url: videoUrl || undefined,
        items,
      };

      console.log('Creating return request with input:', JSON.stringify(input, null, 2));
      const { error } = await returnService.createReturnRequest(input);

      if (error) {
        console.error('Return request creation failed:', error);
        console.error('Error message:', error.message);
        toast.error(`Failed to create return request: ${error.message}`);
        return;
      }

      toast.success('Return request submitted successfully!');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error submitting return:', error);
      toast.error('An error occurred while submitting your return request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const formContent = (
    <div className={`bg-white rounded-lg shadow-lg ${inline ? 'w-full' : 'max-w-3xl w-full max-h-[85vh]'} overflow-hidden flex flex-col`}>
      {/* Header */}
      <div className={`flex items-center justify-between ${inline ? 'p-4' : 'p-5'} border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50`}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Package className={`${inline ? 'h-4 w-4' : 'h-5 w-5'} text-blue-600`} />
            </div>
            <div>
              <h2 className={`${inline ? 'text-lg' : 'text-xl'} font-bold text-gray-900`}>Return Request</h2>
              <p className={`${inline ? 'text-xs' : 'text-sm'} text-gray-600 mt-0.5`}>Order #{order.order_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className={`${inline ? 'h-4 w-4' : 'h-5 w-5'} text-gray-500`} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className={`${inline ? 'px-4 py-3' : 'px-6 py-4'} bg-gray-50 border-b border-gray-200`}>
          <div className="flex items-center justify-between">
            {['Check', 'Select', 'Details', 'Confirm'].map((stepName, index) => {
              const stepValue = ['check', 'select', 'details', 'confirm'][index];
              const isActive = step === stepValue;
              const isCompleted = ['check', 'select', 'details', 'confirm'].indexOf(step) > index;

              return (
                <React.Fragment key={stepName}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`${inline ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'} rounded-full flex items-center justify-center font-semibold transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span
                      className={`${inline ? 'text-[10px] mt-1' : 'text-xs mt-1.5'} font-medium ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {stepName}
                    </span>
                  </div>
                  {index < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded transition-colors ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto ${inline ? 'p-4' : 'p-6'}`}>
          {/* Loading order items */}
          {isLoadingItems ? (
            <div className={`text-center ${inline ? 'py-8' : 'py-12'}`}>
              <div className={`animate-spin rounded-full ${inline ? 'h-8 w-8' : 'h-12 w-12'} border-b-2 border-blue-600 mx-auto mb-4`}></div>
              <p className={`text-gray-600 ${inline ? 'text-sm' : ''}`}>Loading order items...</p>
            </div>
          ) : (
            <>
              {/* Step 1: Eligibility Check */}
              {step === 'check' && (
            <div className={inline ? '' : 'max-w-2xl mx-auto'}>
              {isCheckingEligibility ? (
                <div className={`text-center ${inline ? 'py-8' : 'py-12'}`}>
                  <div className={`animate-spin rounded-full ${inline ? 'h-8 w-8' : 'h-12 w-12'} border-b-2 border-blue-600 mx-auto mb-4`}></div>
                  <p className="text-gray-600">Checking return eligibility...</p>
                </div>
              ) : eligibility && !eligibility.isEligible ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold text-red-900 mb-2">
                        Order Not Eligible for Return
                      </h3>
                      <ul className="space-y-1">
                        {eligibility.reasons.map((reason, index) => (
                          <li key={index} className="text-red-700">
                            • {reason}
                          </li>
                        ))}
                      </ul>
                      {eligibility.daysRemaining > 0 && (
                        <p className="text-sm text-red-600 mt-3">
                          Return window expires in {eligibility.daysRemaining} day(s)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Step 2: Select Items */}
          {step === 'select' && eligibility && (
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select Items to Return
                </h3>
                <p className="text-sm text-gray-600">
                  {eligibility.daysRemaining} day(s) remaining in your return window
                </p>
              </div>

              {/* Eligible Items */}
              <div className="space-y-3">
                {eligibility.eligibleItems.map((item: any) => (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedItems.has(item.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleItemSelection(item.id)}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => {}}
                        className="mt-1 h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                        <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                          {item.variant_size && <p>Size: {item.variant_size}</p>}
                          {item.variant_color && <p>Color: {item.variant_color}</p>}
                          {item.variant_material && <p>Material: {item.variant_material}</p>}
                          {item.product_sku && <p>SKU: {item.product_sku}</p>}
                        </div>
                        <p className="text-sm font-medium text-gray-900 mt-2">
                          ₹{item.unit_price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      {selectedItems.has(item.id) && (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <label className="text-sm font-medium text-gray-700">Qty:</label>
                          <input
                            type="number"
                            min="1"
                            max={item.quantity}
                            value={itemQuantities[item.id] || item.quantity}
                            onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value))}
                            className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ineligible Items */}
              {eligibility.ineligibleItems.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Ineligible Items (Services)
                  </h4>
                  <div className="space-y-2">
                    {eligibility.ineligibleItems.map((item: any) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg p-3 bg-gray-50 opacity-60"
                      >
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-700">{item.product_name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Service items cannot be returned
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Return Details */}
          {step === 'details' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Details</h3>

                {/* Return Reason */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Return <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {RETURN_REASONS.map((reason) => (
                      <label
                        key={reason.value}
                        className={`block border rounded-lg p-4 cursor-pointer transition-all ${
                          returnReason === reason.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="returnReason"
                            value={reason.value}
                            checked={returnReason === reason.value}
                            onChange={(e) => setReturnReason(e.target.value as ReturnReason)}
                            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{reason.label}</p>
                            <p className="text-sm text-gray-600 mt-0.5">{reason.description}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reasonDescription}
                    onChange={(e) => setReasonDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Please provide details about the issue..."
                  />
                </div>

                {/* Image Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Images (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload images of the product issue
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB each</p>
                    </label>
                  </div>

                  {/* Uploaded Images Preview */}
                  {uploadedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-3">
                      {uploadedImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Confirm Return Request</h3>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Return Summary</h4>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Items to Return:</p>
                    <ul className="mt-2 space-y-2">
                      {Array.from(selectedItems).map(itemId => {
                        const item = orderItems.find(oi => oi.id === itemId);
                        if (!item) return null;
                        return (
                          <li key={itemId} className="text-sm text-gray-600 flex justify-between">
                            <span>{item.product_name}</span>
                            <span>Qty: {itemQuantities[itemId]}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-sm font-medium text-gray-700">Return Reason:</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {RETURN_REASONS.find(r => r.value === returnReason)?.label}
                    </p>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-sm font-medium text-gray-700">Description:</p>
                    <p className="text-sm text-gray-600 mt-1">{reasonDescription}</p>
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-sm font-medium text-gray-700">
                        Uploaded Images: {uploadedImages.length}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Return Address Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-3">Next Steps</h4>
                <ol className="space-y-2 text-sm text-blue-800">
                  <li className="flex gap-2">
                    <span className="font-semibold">1.</span>
                    <span>Pack the item(s) securely with all tags and packaging</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold">2.</span>
                    <span>Ship to: {returnAddress || 'Address will be provided'}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold">3.</span>
                    <span>Update tracking number after shipping</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold">4.</span>
                    <span>We'll inspect within 2-3 business days of receiving</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold">5.</span>
                    <span>Refund will be processed to original payment method</span>
                  </li>
                </ol>
              </div>
            </div>
          )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`border-t border-gray-200 ${inline ? 'p-4' : 'p-6'} bg-gray-50 flex items-center justify-between`}>
          <button
            onClick={onClose}
            className={`${inline ? 'px-4 py-2 text-sm' : 'px-6 py-2.5'} text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors`}
          >
            Cancel
          </button>

          <div className={`flex ${inline ? 'gap-2' : 'gap-3'}`}>
            {step !== 'check' && (
              <button
                onClick={() => {
                  const steps = ['check', 'select', 'details', 'confirm'];
                  const currentIndex = steps.indexOf(step);
                  if (currentIndex > 0) {
                    setStep(steps[currentIndex - 1] as any);
                  }
                }}
                className={`${inline ? 'px-4 py-2 text-sm' : 'px-6 py-2.5'} text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors`}
              >
                Back
              </button>
            )}

            {step === 'select' && (
              <button
                onClick={() => setStep('details')}
                disabled={selectedItems.size === 0}
                className={`${inline ? 'px-4 py-2 text-sm' : 'px-6 py-2.5'} bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors`}
              >
                Continue
              </button>
            )}

            {step === 'details' && (
              <button
                onClick={() => setStep('confirm')}
                disabled={!returnReason || !reasonDescription.trim()}
                className={`${inline ? 'px-4 py-2 text-sm' : 'px-6 py-2.5'} bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors`}
              >
                Review
              </button>
            )}

            {step === 'confirm' && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`${inline ? 'px-4 py-2 text-sm' : 'px-6 py-2.5'} bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Return Request'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
  );

  // Render inline or as modal
  if (inline) {
    return formContent;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      {formContent}
    </div>
  );
};
