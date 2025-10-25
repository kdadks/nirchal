import React from 'react';
import { createPortal } from 'react-dom';
import { X, Package, User, MapPin, FileText, Image, Video } from 'lucide-react';
import { ReturnRequestWithItems } from '../../types/return.types';
import { getStatusLabel, getStatusColor, formatDate } from '../../types/return.index';

interface ReturnDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnRequest: ReturnRequestWithItems | null;
}

export const ReturnDetailsModal: React.FC<ReturnDetailsModalProps> = ({
  isOpen,
  onClose,
  returnRequest,
}) => {
  if (!isOpen || !returnRequest) return null;

  // Render modal in a portal to avoid stacking-context issues with fixed headers
  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Compact */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{returnRequest.return_number}</h2>
              <p className="text-xs text-gray-600">
                Order #{
                  returnRequest.order_number || (returnRequest as any).order?.order_number ||
                  (returnRequest.order_id ? String(returnRequest.order_id).slice(0, 8) : 'N/A')
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content - Compact */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Status and Timeline - Compact */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Status</h3>
              <span
                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  returnRequest.status
                )}`}
              >
                {getStatusLabel(returnRequest.status)}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-gray-600 mb-0.5">Request Date</p>
                <p className="font-medium text-gray-900">
                  {formatDate(returnRequest.created_at)}
                </p>
              </div>
              {returnRequest.customer_shipped_date && (
                <div>
                  <p className="text-gray-600 mb-0.5">Shipped Date</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(returnRequest.customer_shipped_date)}
                  </p>
                </div>
              )}
              {returnRequest.received_date && (
                <div>
                  <p className="text-gray-600 mb-0.5">Received Date</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(returnRequest.received_date)}
                  </p>
                </div>
              )}
              {returnRequest.decision_date && (
                <div>
                  <p className="text-gray-600 mb-0.5">Decision Date</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(returnRequest.decision_date)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information - Compact */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <User className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">Customer Information</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-gray-600 mb-0.5">Name</p>
                <p className="font-medium text-gray-900">
                  {returnRequest.customer_first_name} {returnRequest.customer_last_name}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-0.5">Email</p>
                <p className="font-medium text-gray-900">{returnRequest.customer_email}</p>
              </div>
              {returnRequest.customer_phone && (
                <div>
                  <p className="text-gray-600 mb-0.5">Phone</p>
                  <p className="font-medium text-gray-900">{returnRequest.customer_phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Return Address - Compact */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">Return Address</h3>
            </div>
            <div className="text-xs text-gray-900 leading-relaxed">
              <p>{returnRequest.return_address_line1}</p>
              {returnRequest.return_address_line2 && <p>{returnRequest.return_address_line2}</p>}
              <p>
                {returnRequest.return_address_city}, {returnRequest.return_address_state}{' '}
                {returnRequest.return_address_postal_code}
              </p>
              <p>{returnRequest.return_address_country}</p>
            </div>
          </div>

          {/* Return Reason - Compact */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">Return Reason</h3>
            </div>
            <div className="space-y-1.5 text-xs">
              <div>
                <p className="text-gray-600 mb-0.5">Reason</p>
                <p className="font-medium text-gray-900 capitalize">
                  {returnRequest.reason?.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-0.5">Details</p>
                <p className="text-gray-900">{returnRequest.reason_details}</p>
              </div>
            </div>
          </div>

          {/* Return Items - Compact */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Package className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">Items to Return</h3>
            </div>
            <div className="space-y-2">
              {returnRequest.return_items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 p-2 bg-gray-50 rounded"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-xs truncate">{item.product_name}</p>
                    <div className="mt-0.5 text-xs text-gray-600 flex flex-wrap gap-x-2">
                      {item.product_sku && <span>SKU: {item.product_sku}</span>}
                      {item.variant_size && <span>Size: {item.variant_size}</span>}
                      {item.variant_color && <span>Color: {item.variant_color}</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    <p className="font-semibold text-gray-900 text-xs">₹{item.total_price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Evidence - Compact */}
          {(returnRequest.customer_images?.length > 0 || returnRequest.customer_video_url) && (
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Image className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">Customer Evidence</h3>
              </div>
              <div className="space-y-2">
                {returnRequest.customer_images?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1.5">Images</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {returnRequest.customer_images.map((imageUrl, index) => (
                        <a
                          key={index}
                          href={imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block aspect-square bg-gray-100 rounded overflow-hidden hover:opacity-75 transition-opacity"
                        >
                          <img
                            src={imageUrl}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {returnRequest.customer_video_url && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Video</p>
                    <a
                      href={returnRequest.customer_video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-xs"
                    >
                      <Video className="h-3 w-3" />
                      View Video Evidence
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tracking Information - Compact */}
          {returnRequest.customer_tracking_number && (
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Tracking Information</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-600 mb-0.5">Tracking Number</p>
                  <p className="font-medium text-gray-900">
                    {returnRequest.customer_tracking_number}
                  </p>
                </div>
                {returnRequest.customer_courier_name && (
                  <div>
                    <p className="text-gray-600 mb-0.5">Courier</p>
                    <p className="font-medium text-gray-900">
                      {returnRequest.customer_courier_name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Inspection Notes - Compact */}
          {returnRequest.inspection_notes && (
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Inspection Notes</h3>
              <p className="text-xs text-gray-900">{returnRequest.inspection_notes}</p>
            </div>
          )}

          {/* Decision Notes - Compact */}
          {returnRequest.decision_notes && (
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Decision Notes</h3>
              <p className="text-xs text-gray-900">{returnRequest.decision_notes}</p>
            </div>
          )}

          {/* Rejection Reason - Compact */}
          {returnRequest.rejection_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-red-900 mb-1.5">Rejection Reason</h3>
              <p className="text-xs text-red-800">{returnRequest.rejection_reason}</p>
            </div>
          )}
        </div>

        {/* Footer - Compact */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
