import { useState, useEffect } from 'react';
import axios from '../utils/axios';

const PendingOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);

  useEffect(() => {
    fetchPendingOrganizations();
  }, []);

  const fetchPendingOrganizations = async () => {
    try {
      const response = await axios.get('/api/admin/organizations/pending');
      setOrganizations(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load pending organizations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await axios.patch(`/api/admin/organizations/${id}/approve`);
      setOrganizations(organizations.filter(org => org._id !== id));
      alert('Organization approved successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve organization');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setActionLoading(id);
    try {
      await axios.patch(`/api/admin/organizations/${id}/reject`, {
        reason: rejectionReason
      });
      setOrganizations(organizations.filter(org => org._id !== id));
      setShowRejectModal(null);
      setRejectionReason('');
      alert('Organization rejected');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject organization');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-600">No pending organizations</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Pending Organizations ({organizations.length})</h3>
      
      {organizations.map((org) => (
        <div key={org._id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-xl font-bold text-gray-900">{org.name}</h4>
              <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mt-2">
                Pending Review
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">Email:</span> {org.email}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">Phone:</span> {org.phone}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">Category:</span> {org.category}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">Address:</span> {org.address}
              </p>
              {org.website && (
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Website:</span>{' '}
                  <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {org.website}
                  </a>
                </p>
              )}
            </div>
          </div>

          {org.description && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-1">Description:</p>
              <p className="text-sm text-gray-600">{org.description}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleApprove(org._id)}
              disabled={actionLoading === org._id}
              className="flex-1 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {actionLoading === org._id ? 'Processing...' : 'Approve'}
            </button>
            <button
              onClick={() => setShowRejectModal(org._id)}
              disabled={actionLoading === org._id}
              className="flex-1 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              Reject
            </button>
          </div>
        </div>
      ))}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Organization</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejection:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={actionLoading === showRejectModal}
                className="flex-1 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {actionLoading === showRejectModal ? 'Processing...' : 'Confirm Reject'}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectionReason('');
                }}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingOrganizations;
