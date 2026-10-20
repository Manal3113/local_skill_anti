import React, { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../i18n';
import { useToast } from '../components/Toast';
import { fetchAdminRequests, updateRequestStatus, fetchStats } from '../services/contactService';
import { fetchWorkers, toggleVerification, deleteWorker } from '../services/workerService';
import { getStoredAdminUser } from '../services/authService';
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Search,
  Check,
  X,
  Trash2,
  RefreshCw,
  Phone,
  Building,
  BarChart3,
  FileText,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export const AdminDashboard = () => {
  const { t } = useI18n();
  const { addToast } = useToast();
  const adminUser = getStoredAdminUser();

  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'workers' | 'analytics'

  // Contact Requests State
  const [requests, setRequests] = useState([]);
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');
  const [requestSearch, setRequestSearch] = useState('');
  const [requestsLoading, setRequestsLoading] = useState(true);

  // Workers State
  const [workers, setWorkers] = useState([]);
  const [workerSearch, setWorkerSearch] = useState('');
  const [workersLoading, setWorkersLoading] = useState(true);

  // Stats State
  const [stats, setStats] = useState(null);

  // Action Dialog State for Approving / Denying with notes
  const [activeActionModal, setActiveActionModal] = useState(null); // { request, targetStatus }
  const [adminNotes, setAdminNotes] = useState('');
  const [actionProcessing, setActionProcessing] = useState(false);

  // Load Contact Requests
  const loadRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const res = await fetchAdminRequests({
        status: requestStatusFilter,
        search: requestSearch,
        limit: 100,
      });
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (err) {
      addToast('Failed to load contact requests: ' + err.message, 'error');
    } finally {
      setRequestsLoading(false);
    }
  }, [requestStatusFilter, requestSearch, addToast]);

  // Load Workers
  const loadWorkers = useCallback(async () => {
    setWorkersLoading(true);
    try {
      const res = await fetchWorkers({
        search: workerSearch,
        all: 'true',
      });
      if (res.success) {
        setWorkers(res.workers || []);
      }
    } catch (err) {
      addToast('Failed to load workers: ' + err.message, 'error');
    } finally {
      setWorkersLoading(false);
    }
  }, [workerSearch, addToast]);

  // Load Stats
  const loadDashboardStats = useCallback(async () => {
    try {
      const res = await fetchStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  useEffect(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  useEffect(() => {
    if (activeTab === 'requests') {
      loadRequests();
    } else if (activeTab === 'workers') {
      loadWorkers();
    }
  }, [activeTab, loadRequests, loadWorkers]);

  // Handle Approve / Deny Action
  const handleConfirmStatusChange = async () => {
    if (!activeActionModal) return;
    const { request, targetStatus } = activeActionModal;

    setActionProcessing(true);
    try {
      await updateRequestStatus(request._id, targetStatus, adminNotes);
      addToast(
        `Contact request ${targetStatus === 'approved' ? 'Approved' : 'Denied'} successfully!`,
        'success'
      );
      setActiveActionModal(null);
      setAdminNotes('');
      loadRequests();
      loadDashboardStats();
    } catch (err) {
      addToast(err.message || 'Action failed', 'error');
    } finally {
      setActionProcessing(false);
    }
  };

  // Handle Worker Verification Toggle
  const handleToggleVerification = async (workerId) => {
    try {
      const res = await toggleVerification(workerId);
      addToast(res.message || 'Worker verification status updated', 'success');
      loadWorkers();
      loadDashboardStats();
    } catch (err) {
      addToast(err.message || 'Verification update failed', 'error');
    }
  };

  // Handle Delete Worker
  const handleDeleteWorker = async (workerId, workerName) => {
    if (window.confirm(`${t('admin.confirmDelete')} (${workerName})`)) {
      try {
        await deleteWorker(workerId);
        addToast('Worker removed from registry', 'info');
        loadWorkers();
        loadDashboardStats();
      } catch (err) {
        addToast(err.message || 'Failed to delete worker', 'error');
      }
    }
  };

  return (
    <div className="main-content">
      {/* Top Banner with Clerk Credentials Badge */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontWeight: 700 }}>
            <Building size={20} />
            <span>{adminUser?.panchayatName || 'Gram Panchayat Administration'}</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginTop: 4 }}>
            {t('admin.dashboardTitle')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Logged in as: <strong>{adminUser?.fullName || 'Panchayat Clerk'}</strong> ({adminUser?.role})
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            loadDashboardStats();
            if (activeTab === 'requests') loadRequests();
            if (activeTab === 'workers') loadWorkers();
          }}
        >
          <RefreshCw size={14} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Stats Counters */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div className="filter-card" style={{ padding: 18, marginBottom: 0 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {t('admin.statTotalWorkers')}
            </span>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
              {stats.totalWorkers}
            </p>
          </div>

          <div className="filter-card" style={{ padding: 18, marginBottom: 0 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {t('admin.statVerified')}
            </span>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#15803d', marginTop: 4 }}>
              {stats.verificationRate}%{' '}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                ({stats.verifiedWorkers})
              </span>
            </p>
          </div>

          <div className="filter-card" style={{ padding: 18, marginBottom: 0, borderLeft: '4px solid #f59e0b' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {t('admin.statPendingRequests')}
            </span>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#b45309', marginTop: 4 }}>
              {stats.pendingRequests}
            </p>
          </div>

          <div className="filter-card" style={{ padding: 18, marginBottom: 0 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {t('admin.statTotalRequests')}
            </span>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
              {stats.totalRequests}
            </p>
          </div>

          <div className="filter-card" style={{ padding: 18, marginBottom: 0 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {t('admin.statAvailable')}
            </span>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#15803d', marginTop: 4 }}>
              {stats.availableWorkers}
            </p>
          </div>
        </div>
      )}

      {/* Tabs Header */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={16} />
            {t('admin.tabRequests')}
            {stats?.pendingRequests > 0 && (
              <span
                style={{
                  background: '#f59e0b',
                  color: '#fff',
                  borderRadius: 10,
                  padding: '2px 7px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {stats.pendingRequests}
              </span>
            )}
          </span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'workers' ? 'active' : ''}`}
          onClick={() => setActiveTab('workers')}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={16} />
            {t('admin.tabWorkers')} ({stats?.totalWorkers || 0})
          </span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <BarChart3 size={16} />
            {t('admin.tabAnalytics')}
          </span>
        </button>
      </div>

      {/* TAB 1: CONTACT REQUESTS APPROVAL MANAGEMENT */}
      {activeTab === 'requests' && (
        <div>
          {/* Filter & Search Bar */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              marginBottom: 16,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1, minWidth: 260 }}>
              <input
                type="text"
                className="form-input"
                placeholder={t('admin.searchRequests')}
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ width: 'auto', minWidth: 180 }}
              value={requestStatusFilter}
              onChange={(e) => setRequestStatusFilter(e.target.value)}
            >
              <option value="all">{t('admin.filterAll')}</option>
              <option value="pending">{t('admin.filterPending')}</option>
              <option value="approved">{t('admin.filterApproved')}</option>
              <option value="denied">{t('admin.filterDenied')}</option>
            </select>
          </div>

          {/* Requests Table */}
          {requestsLoading ? (
            <div className="skeleton" style={{ height: 260, borderRadius: 'var(--radius-md)' }}></div>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <Clock size={36} style={{ color: 'var(--text-light)' }} />
              <p>No contact requests matching the selected filter.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>{t('admin.thRequester')}</th>
                    <th>{t('admin.thWorker')}</th>
                    <th>{t('admin.thPurpose')}</th>
                    <th>{t('admin.thStatus')}</th>
                    <th>{t('admin.thDate')}</th>
                    <th>{t('admin.thActions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req._id}>
                      <td>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>
                          {req.trackingId}
                        </strong>
                      </td>
                      <td>
                        <div>
                          <strong>{req.requesterName}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {req.requesterOrganization}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#166534' }}>
                            Ph: {req.requesterPhone}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{req.workerName}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>
                            {req.workerSkill} • {req.workerVillage}
                          </div>
                        </div>
                      </td>
                      <td style={{ maxWidth: 280 }}>
                        <p style={{ fontSize: '0.82rem', lineHeight: 1.4 }}>
                          {req.purpose}
                        </p>
                        {req.adminNotes && (
                          <p style={{ fontSize: '0.75rem', color: '#991b1b', marginTop: 4 }}>
                            <em>Note: {req.adminNotes}</em>
                          </p>
                        )}
                      </td>
                      <td>
                        {req.status === 'approved' && (
                          <span className="badge badge-verified">
                            <CheckCircle size={12} /> Approved
                          </span>
                        )}
                        {req.status === 'pending' && (
                          <span className="badge badge-busy">
                            <Clock size={12} /> Pending
                          </span>
                        )}
                        {req.status === 'denied' && (
                          <span className="badge badge-onleave">
                            <XCircle size={12} /> Denied
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {req.status !== 'approved' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              title="Approve request and release worker phone"
                              onClick={() => {
                                setActiveActionModal({ request: req, targetStatus: 'approved' });
                                setAdminNotes('Verified legitimate rural requirement.');
                              }}
                            >
                              <Check size={13} />
                              <span>Approve</span>
                            </button>
                          )}
                          {req.status !== 'denied' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              title="Deny request"
                              onClick={() => {
                                setActiveActionModal({ request: req, targetStatus: 'denied' });
                                setAdminNotes('Declined due to privacy policy / suspicious inquiry.');
                              }}
                            >
                              <X size={13} />
                              <span>Deny</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WORKER REGISTRY DIRECTORY MANAGEMENT */}
      {activeTab === 'workers' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                className="form-input"
                placeholder={t('admin.searchWorkers')}
                value={workerSearch}
                onChange={(e) => setWorkerSearch(e.target.value)}
              />
            </div>
          </div>

          {workersLoading ? (
            <div className="skeleton" style={{ height: 260, borderRadius: 'var(--radius-md)' }}></div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Worker Name</th>
                    <th>Skill</th>
                    <th>Village</th>
                    <th>Mobile Number (Clerk View)</th>
                    <th>Availability</th>
                    <th>Verification Seal</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((worker) => (
                    <tr key={worker._id}>
                      <td>
                        <strong>{worker.name}</strong>
                        {worker.eShramUan && (
                          <div style={{ fontSize: '0.75rem', color: '#854d0e' }}>
                            {worker.eShramUan}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="worker-skill-badge">{worker.skillCategory}</span>
                      </td>
                      <td>{worker.village}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#15803d' }}>
                          +91 {worker.phone}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${worker.availabilityStatus.replace('_', '')}`}>
                          {worker.availabilityStatus}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`btn btn-sm ${worker.isVerified ? 'btn-success' : 'btn-secondary'}`}
                          onClick={() => handleToggleVerification(worker._id)}
                          title="Click to toggle verification"
                        >
                          <ShieldCheck size={14} />
                          <span>{worker.isVerified ? 'Verified' : 'Verify'}</span>
                        </button>
                      </td>
                      <td>★ {worker.rating > 0 ? worker.rating : 'New'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca' }}
                          onClick={() => handleDeleteWorker(worker._id, worker.name)}
                          title="Remove worker"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DEMOGRAPHICS & ANALYTICS */}
      {activeTab === 'analytics' && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {/* Top Skills Breakdown */}
          <div className="filter-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
              <span>{t('admin.skillsBreakdown')}</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.skillDistribution?.map((item) => (
                <div key={item._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{item._id}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{item.count} workers</span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: '#f1f5f9',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--primary) 0%, #16a34a 100%)',
                        width: `${Math.min(100, (item.count / stats.totalWorkers) * 100 * 2.5)}%`,
                        borderRadius: 4,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Village Density Breakdown */}
          <div className="filter-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building size={18} style={{ color: 'var(--accent)' }} />
              <span>{t('admin.villagesBreakdown')}</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.villageDistribution?.map((item) => (
                <div key={item._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{item._id}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{item.count} workers</span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: '#f1f5f9',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--accent) 0%, #ea580c 100%)',
                        width: `${Math.min(100, (item.count / stats.totalWorkers) * 100 * 2.5)}%`,
                        borderRadius: 4,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Approve / Deny Action */}
      {activeActionModal && (
        <div className="modal-overlay" onClick={() => setActiveActionModal(null)} role="dialog">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>
                {activeActionModal.targetStatus === 'approved' ? 'Approve Contact Request' : 'Deny Contact Request'}
              </h3>
              <button className="close-btn" onClick={() => setActiveActionModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Target Worker: <strong>{activeActionModal.request.workerName}</strong>
                <br />
                Requester: <strong>{activeActionModal.request.requesterName}</strong> (
                {activeActionModal.request.requesterOrganization})
              </p>

              {activeActionModal.targetStatus === 'approved' && (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    fontSize: '0.82rem',
                    color: '#166534',
                  }}
                >
                  Approving this request will immediately release the worker's verified contact phone number to
                  the requester.
                </div>
              )}

              <div className="form-group">
                <label className="form-label">{t('admin.notesPrompt')}</label>
                <textarea
                  className="form-textarea"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveActionModal(null)}
                disabled={actionProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn ${activeActionModal.targetStatus === 'approved' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleConfirmStatusChange}
                disabled={actionProcessing}
              >
                <span>{actionProcessing ? 'Processing...' : t('admin.saveNotes')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
