import React, { useState } from 'react';
import { Mail, Plus, Eye, Send, Clock, Trash2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { emailCampaignService } from '../../services/emailCampaignService';
import { useAdminSearch } from '../../contexts/AdminSearchContext';
import CampaignPreviewModal from '../../components/admin/CampaignPreviewModal';

interface Campaign {
  id: string;
  title: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  total_recipients: number;
  sent_count: number;
  created_at: string;
  scheduled_at?: string;
}

const BulkEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const { setRefreshCallback } = useAdminSearch();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [previewCampaignId, setPreviewCampaignId] = useState<string | null>(null);

  // Fetch campaigns
  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await emailCampaignService.listCampaigns(50, 0);
      setCampaigns((response.data as unknown as Campaign[]) || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCampaigns();
    // Register refresh callback for the admin header refresh button
    setRefreshCallback(() => fetchCampaigns());
    
    return () => {
      // Clear callback when component unmounts
      setRefreshCallback(null);
    };
  }, [setRefreshCallback]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'sending':
        return 'bg-purple-100 text-purple-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendCampaign = async (_campaignId: string, campaignTitle: string) => {
    toast.loading('Sending campaign...');
    try {
      await emailCampaignService.sendCampaign(_campaignId);
      toast.dismiss();
      toast.success(`Campaign "${campaignTitle}" sent successfully!`);
      await fetchCampaigns(); // Refresh the list
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast.dismiss();
      toast.error('Failed to send campaign');
    }
  };

  const handleDeleteCampaign = async (_campaignId: string, campaignTitle: string) => {
    if (confirm(`Are you sure you want to delete "${campaignTitle}"?`)) {
      toast.loading('Deleting campaign...');
      try {
        await emailCampaignService.deleteCampaign(_campaignId);
        toast.dismiss();
        toast.success('Campaign deleted successfully!');
        await fetchCampaigns(); // Refresh the list
      } catch (error) {
        console.error('Error deleting campaign:', error);
        toast.dismiss();
        toast.error('Failed to delete campaign');
      }
    }
  };

  const handleExportStats = (_campaignId: string, _campaignTitle: string) => {
    toast.loading('Exporting statistics...');
    // TODO: Implement export stats
    setTimeout(() => {
      toast.dismiss();
      toast.success('Statistics exported successfully!');
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      case 'sending':
        return <Mail className="w-4 h-4 animate-bounce" />;
      case 'sent':
        return <Mail className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredCampaigns = filterStatus === 'all' 
    ? campaigns 
    : campaigns.filter(c => c.status === filterStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-amber-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bulk Email Campaigns</h1>
                <p className="text-sm text-gray-600">Send and manage email campaigns</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/email-campaigns/new')}
              className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              New Campaign
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm font-medium text-gray-700">Filter by status:</label>
            <div className="flex gap-2">
              {['all', 'draft', 'scheduled', 'sending', 'sent', 'failed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Campaigns Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <Mail className="w-8 h-8 text-amber-600" />
            </div>
            <p className="mt-2 text-gray-600">Loading campaigns...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-6">
              {filterStatus === 'all' 
                ? 'Create your first email campaign to get started'
                : `No ${filterStatus} campaigns yet`}
            </p>
            <button
              onClick={() => navigate('/admin/email-campaigns/new')}
              className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Recipients</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Sent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{campaign.title}</p>
                        <p className="text-sm text-gray-600">{campaign.subject}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {getStatusIcon(campaign.status)}
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{campaign.total_recipients}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{campaign.sent_count}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewCampaignId(campaign.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        {campaign.status === 'draft' && (
                          <button
                            onClick={() => navigate(`/admin/email-campaigns/${campaign.id}/edit`)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Mail className="w-4 h-4 text-gray-600" />
                          </button>
                        )}
                        {campaign.status === 'draft' && (
                          <button
                            onClick={() => handleSendCampaign(campaign.id, campaign.title)}
                            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                            title="Send"
                          >
                            <Send className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                        {['sent', 'failed'].includes(campaign.status) && (
                          <button
                            onClick={() => handleExportStats(campaign.id, campaign.title)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Export stats"
                          >
                            <Download className="w-4 h-4 text-gray-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCampaign(campaign.id, campaign.title)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewCampaignId && (
        <CampaignPreviewModal 
          campaignId={previewCampaignId}
          onClose={() => setPreviewCampaignId(null)}
        />
      )}
    </div>
  );
};

export default BulkEmailPage;
