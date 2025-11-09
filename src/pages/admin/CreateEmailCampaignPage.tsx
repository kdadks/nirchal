import React, { useState } from 'react';
import { ArrowLeft, Save, Eye, Upload, X, Send } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import toast from 'react-hot-toast';
import { emailCampaignService } from '../../services/emailCampaignService';
import 'react-quill/dist/quill.snow.css';

interface Recipient {
  email: string;
  name?: string;
}

interface FormData {
  title: string;
  description: string;
  subject: string;
  html_content: string;
  sender_email: string;
  sender_name: string;
  recipients: Recipient[];
  scheduled_at: string;
  max_retries: number;
}

const CreateEmailCampaignPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: campaignId } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    subject: '',
    html_content: '',
    sender_email: '',
    sender_name: '',
    recipients: [],
    scheduled_at: '',
    max_retries: 3,
  });

  const [recipientInput, setRecipientInput] = useState('');
  const [recipientCSV, setRecipientCSV] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'recipients' | 'schedule'>('basic');
  const [_loading, setLoading] = useState(campaignId ? true : false);

  // Load campaign data if editing
  React.useEffect(() => {
    if (campaignId) {
      loadCampaign();
    }
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      const campaign = await emailCampaignService.getCampaignById(campaignId!);
      if (!campaign) {
        toast.error('Campaign not found');
        navigate('/admin/email-campaigns');
        return;
      }

      // Load recipients
      const recipients = await emailCampaignService.getCampaignRecipients(campaignId!);

      setFormData({
        title: campaign.title,
        description: campaign.description || '',
        subject: campaign.subject,
        html_content: campaign.html_content,
        sender_email: campaign.sender_email,
        sender_name: campaign.sender_name || '',
        recipients: recipients as unknown as Recipient[],
        scheduled_at: campaign.scheduled_at || '',
        max_retries: campaign.max_retries || 3,
      });
    } catch (error) {
      console.error('Error loading campaign:', error);
      toast.error('Failed to load campaign');
      navigate('/admin/email-campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to convert text to sentence case
  const toSentenceCase = (text: string): string => {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleHTMLContentChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      html_content: value
    }));
  };

  const handleAddRecipient = () => {
    if (!recipientInput.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const parts = recipientInput.trim().split('|');
    const email = parts[0].trim();
    const name = parts[1]?.trim();

    if (!emailRegex.test(email)) {
      toast.error('Invalid email address');
      return;
    }

    if (formData.recipients.some(r => r.email === email)) {
      toast.error('This email is already added');
      return;
    }

    setFormData(prev => ({
      ...prev,
      recipients: [...prev.recipients, { email, name: name ? toSentenceCase(name) : undefined }]
    }));
    setRecipientInput('');
    toast.success('Recipient added');
  };

  const handleRemoveRecipient = (email: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r.email !== email)
    }));
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRecipientCSV(file);
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        toast.error('CSV file is empty');
        return;
      }

      let addedCount = 0;
      const duplicateCount = { count: 0 };
      const invalidCount = { count: 0 };
      // More lenient email regex - RFC 5322 simplified
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
      // Function to validate email more thoroughly
      const isValidEmail = (email: string): boolean => {
        // Basic checks
        if (!email || email.length > 254) return false;
        if (!emailRegex.test(email)) return false;
        
        const [localPart, ...domainParts] = email.split('@');
        const domain = domainParts.join('@');
        
        // Check local part length (max 64 chars)
        if (!localPart || localPart.length > 64) return false;
        if (!localPart.match(/^[a-zA-Z0-9._%-]+$/)) return false;
        
        // Check domain
        if (!domain || domain.length < 3) return false;
        if (domain.startsWith('.') || domain.endsWith('.')) return false;
        if (domain.includes('..')) return false;
        
        return true;
      };

      lines.forEach((line, index) => {
        // Support both comma and tab-separated values
        const delimiter = line.includes('\t') ? '\t' : ',';
        const parts = line.split(delimiter).map(p => p.trim());
        const email = parts[0]?.trim().toLowerCase();
        const name = parts[1]?.trim();

        // Skip empty lines
        if (!email) {
          return;
        }

        // Skip header row if it looks like one
        if (index === 0 && (email === 'email' || email === 'email_address' || email === 'email address')) {
          return;
        }

        if (!isValidEmail(email)) {
          invalidCount.count++;
          console.warn(`Invalid email format: "${email}"`);
          return;
        }

        if (formData.recipients.some(r => r.email.toLowerCase() === email)) {
          duplicateCount.count++;
          return;
        }

        setFormData(prev => ({
          ...prev,
          recipients: [...prev.recipients, { email, name: name ? toSentenceCase(name) : undefined }]
        }));
        addedCount++;
      });

      if (addedCount > 0) {
        toast.success(`Added ${addedCount} recipient${addedCount !== 1 ? 's' : ''} from CSV`);
      }
      if (duplicateCount.count > 0) {
        toast.error(`${duplicateCount.count} duplicate email${duplicateCount.count !== 1 ? 's' : ''} skipped`);
      }
      if (invalidCount.count > 0) {
        toast.error(`${invalidCount.count} invalid email${invalidCount.count !== 1 ? 's' : ''} skipped`);
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast.error('Failed to parse CSV file');
      setRecipientCSV(null);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.title || !formData.subject || !formData.html_content) {
      toast.error('Please fill in title, subject, and content');
      return;
    }

    try {
      toast.loading('Saving campaign...');
      await emailCampaignService.createCampaign({
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        html_content: formData.html_content,
        sender_email: formData.sender_email,
        sender_name: formData.sender_name,
        recipients: formData.recipients,
        max_retries: formData.max_retries,
      });
      toast.dismiss();
      toast.success('Campaign saved as draft!');
      setTimeout(() => navigate(`/admin/email-campaigns`), 1000);
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.dismiss();
      toast.error('Failed to save campaign');
    }
  };

  const handleSendCampaign = async () => {
    // Validation
    if (!formData.title) {
      toast.error('Please add a campaign title');
      return;
    }
    if (!formData.subject) {
      toast.error('Please add an email subject');
      return;
    }
    if (!formData.html_content) {
      toast.error('Please add email content');
      return;
    }
    if (!formData.sender_email) {
      toast.error('Please add a sender email');
      return;
    }
    if (formData.recipients.length === 0) {
      toast.error('Please add at least one recipient');
      return;
    }

    try {
      toast.loading('Creating and sending campaign...');
      // Create the campaign
      const campaign = await emailCampaignService.createCampaign({
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        html_content: formData.html_content,
        sender_email: formData.sender_email,
        sender_name: formData.sender_name,
        recipients: formData.recipients,
        max_retries: formData.max_retries,
      });

      // Send the campaign (this will mark recipients as sent and update campaign status)
      await emailCampaignService.sendCampaign(campaign.id);

      toast.dismiss();
      toast.success(`Campaign sent to ${formData.recipients.length} recipient${formData.recipients.length !== 1 ? 's' : ''}!`);
      setTimeout(() => navigate('/admin/email-campaigns'), 1500);
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast.dismiss();
      toast.error('Failed to send campaign');
    }
  };

  const tabContent = {
    basic: (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleBasicChange}
            placeholder="e.g., Summer Collection Launch"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleBasicChange}
            placeholder="Internal notes about this campaign"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sender Email *</label>
            <input
              type="email"
              name="sender_email"
              value={formData.sender_email}
              onChange={handleBasicChange}
              placeholder="noreply@nirchal.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
            <input
              type="text"
              name="sender_name"
              value={formData.sender_name}
              onChange={handleBasicChange}
              placeholder="Nirchal"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject *</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleBasicChange}
            placeholder="Check out our Summer Collection!"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <p className="mt-1 text-xs text-gray-500">This will be shown to recipients in their inbox</p>
        </div>
      </div>
    ),

    content: (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Content (HTML) *</label>
          <ReactQuill
            value={formData.html_content}
            onChange={handleHTMLContentChange}
            theme="snow"
            modules={{
              toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                ['link', 'image'],
                ['clean']
              ]
            }}
            style={{ minHeight: '400px' }}
          />
        </div>
      </div>
    ),

    recipients: (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Add Recipients</label>

          {/* Manual Entry */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Enter email (or email|name):</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                placeholder="user@example.com or user@example.com|User Name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={handleAddRecipient}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* CSV Upload */}
          <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <label className="flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Upload CSV file</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>
            {recipientCSV && (
              <p className="text-xs text-green-600 mt-2">Selected: {recipientCSV.name}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">Format: email and name (comma or tab separated)</p>
            <p className="text-xs text-gray-500">Examples:</p>
            <p className="text-xs text-gray-400 font-mono">john@example.com,John Doe</p>
            <p className="text-xs text-gray-400 font-mono">jane@example.com	Jane Smith</p>
            <p className="text-xs text-gray-400 font-mono">test@example.com (name optional)</p>
          </div>

          {/* Recipients List */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Recipients ({formData.recipients.length})
            </p>
            <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg">
              {formData.recipients.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No recipients added yet
                </div>
              ) : (
                <div className="divide-y">
                  {formData.recipients.map((recipient, index) => (
                    <div
                      key={index}
                      className="p-3 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{recipient.email}</p>
                        {recipient.name && (
                          <p className="text-xs text-gray-600">{recipient.name}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveRecipient(recipient.email)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ),

    schedule: (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Send Time</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="send_time"
                value="immediately"
                defaultChecked
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Send immediately</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="send_time"
                value="scheduled"
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Schedule for later</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date & Time</label>
          <input
            type="datetime-local"
            name="scheduled_at"
            value={formData.scheduled_at}
            onChange={handleBasicChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Retries on Failure</label>
          <input
            type="number"
            name="max_retries"
            value={formData.max_retries}
            onChange={handleBasicChange}
            min="0"
            max="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <p className="mt-1 text-xs text-gray-500">If sending fails, retry this many times</p>
        </div>
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/email-campaigns')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Create Email Campaign</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={handleSaveDraft}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              <button
                onClick={handleSendCampaign}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Send className="w-4 h-4" />
                Send Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tabs Navigation */}
          <div className="space-y-2">
            {(['basic', 'content', 'recipients', 'schedule'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {tab === 'basic' && 'Basic Info'}
                {tab === 'content' && 'Email Content'}
                {tab === 'recipients' && 'Recipients'}
                {tab === 'schedule' && 'Schedule'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {tabContent[activeTab]}
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Email Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-xs text-gray-600">From:</p>
                  <p className="font-medium text-gray-900">
                    {formData.sender_name || 'Sender'} &lt;{formData.sender_email}&gt;
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-xs text-gray-600">Subject:</p>
                  <p className="font-medium text-gray-900">{formData.subject}</p>
                </div>
                <div className="border border-gray-200 rounded p-4 prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: formData.html_content }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEmailCampaignPage;
