import React, { useState } from 'react';
import { ArrowLeft, Save, Eye, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
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

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      alert('Invalid email address');
      return;
    }

    if (formData.recipients.some(r => r.email === email)) {
      alert('This email is already added');
      return;
    }

    setFormData(prev => ({
      ...prev,
      recipients: [...prev.recipients, { email, name }]
    }));
    setRecipientInput('');
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
    // TODO: Parse CSV file for recipients
    // Expected format: email,name or just email
  };

  const handleSaveDraft = async () => {
    if (!formData.title || !formData.subject || !formData.html_content) {
      alert('Please fill in title, subject, and content');
      return;
    }

    try {
      // TODO: Implement save draft API call
      alert('Campaign saved as draft!');
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('Failed to save campaign');
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
            <p className="text-xs text-gray-500 mt-2">Expected format: email,name (optional)</p>
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
                className="flex items-center gap-2 px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                Save Draft
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
