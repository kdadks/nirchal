import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { emailCampaignService } from '../../services/emailCampaignService';
import type { EmailCampaign, EmailCampaignRecipient } from '../../types/emailCampaign';

interface CampaignPreviewModalProps {
  campaignId: string;
  onClose: () => void;
}

const CampaignPreviewModal: React.FC<CampaignPreviewModalProps> = ({ campaignId, onClose }) => {
  const [campaign, setCampaign] = useState<EmailCampaign | null>(null);
  const [recipients, setRecipients] = useState<EmailCampaignRecipient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaignData();
  }, [campaignId]);

  const loadCampaignData = async () => {
    try {
      setLoading(true);
      const campaignData = await emailCampaignService.getCampaignById(campaignId);
      const recipientsData = await emailCampaignService.getCampaignRecipients(campaignId);
      
      setCampaign(campaignData);
      setRecipients(recipientsData as unknown as EmailCampaignRecipient[]);
    } catch (error) {
      console.error('Error loading campaign:', error);
      toast.error('Failed to load campaign preview');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-red-600">Campaign not found</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{campaign.title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Campaign Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Status</label>
              <p className="text-sm text-gray-900 mt-1">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                  campaign.status === 'sending' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </span>
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Recipients</label>
              <p className="text-sm text-gray-900 mt-1">{campaign.total_recipients}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Sent</label>
              <p className="text-sm text-gray-900 mt-1">{campaign.sent_count}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Failed</label>
              <p className="text-sm text-gray-900 mt-1">{campaign.failed_count}</p>
            </div>
          </div>

          {/* Email Details */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Email Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">From</label>
                <p className="text-sm text-gray-900 mt-1">{campaign.sender_name} &lt;{campaign.sender_email}&gt;</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Subject</label>
                <p className="text-sm text-gray-900 mt-1">{campaign.subject}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Content</label>
                <div className="mt-2 p-4 bg-gray-50 rounded border border-gray-200 prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: campaign.html_content }} />
                </div>
              </div>
            </div>
          </div>

          {/* Recipients */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recipients ({recipients.length})</h3>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Email</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Name</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recipients.map((recipient) => (
                    <tr key={recipient.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-900">{recipient.email}</td>
                      <td className="px-4 py-2 text-gray-600">{recipient.name || '-'}</td>
                      <td className="px-4 py-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          recipient.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                          recipient.status === 'sent' ? 'bg-green-100 text-green-800' :
                          recipient.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {recipient.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignPreviewModal;
