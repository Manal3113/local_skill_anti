import React, { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../i18n';
import { fetchWorkers, fetchFilterOptions } from '../services/workerService';
import { fetchStats } from '../services/contactService';
import { WorkerCard } from '../components/WorkerCard';
import { FilterBar } from '../components/FilterBar';
import {
  Users,
  ShieldCheck,
  MapPin,
  Briefcase,
  AlertCircle,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  Phone,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const SearchPage = ({ onRequestContact }) => {
  const { t } = useI18n();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [selectedVillage, setSelectedVillage] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Data state
  const [workers, setWorkers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Metadata dropdown options
  const [skillsList, setSkillsList] = useState([]);
  const [villagesList, setVillagesList] = useState([]);
  const [statsData, setStatsData] = useState(null);

  // Load filter options and aggregate stats
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [filterData, stats] = await Promise.all([
          fetchFilterOptions(),
          fetchStats(),
        ]);
        if (filterData.success) {
          setSkillsList(filterData.skills || []);
          setVillagesList(filterData.villages || []);
        }
        if (stats.success) {
          setStatsData(stats.stats);
        }
      } catch (err) {
        console.error('Error loading metadata:', err);
      }
    };
    loadMeta();
  }, []);

  // Fetch workers with debounce on search query
  const loadWorkers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWorkers({
        search: searchQuery,
        skill: selectedSkill,
        village: selectedVillage,
        availability: selectedAvailability,
        verified: verifiedOnly ? 'true' : 'all',
        sortBy,
        page: currentPage,
        limit: 12,
      });

      if (response && response.success) {
        setWorkers(response.workers || []);
        setTotalCount(response.total || 0);
        setTotalPages(response.totalPages || 1);
        setError(null);
      } else {
        setError(response?.message || 'Could not retrieve workers from database.');
      }
    } catch (err) {
      console.error('Failed to fetch workers:', err);
      setError(err.message || 'Could not connect to the registry server. Please check your network.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedSkill, selectedVillage, selectedAvailability, verifiedOnly, sortBy, currentPage]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadWorkers();
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [loadWorkers]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSkill('all');
    setSelectedVillage('all');
    setSelectedAvailability('all');
    setVerifiedOnly(false);
    setSortBy('rating');
    setCurrentPage(1);
  };

  return (
    <div className="main-content">
      {/* Hero Banner with Community Impact Metrics */}
      <section className="hero-banner">
        <div className="hero-badge">
          <ShieldCheck size={15} />
          <span>{t('app.panchayatAffiliation')}</span>
        </div>
        <h2 className="hero-title">{t('app.tagline')}</h2>
        <p className="hero-subtitle">{t('app.subheading')}</p>

        {statsData && (
          <div className="hero-stats-row">
            <div className="hero-stat-pill">
              <Users size={16} style={{ color: '#facc15' }} />
              <span>
                <strong>{statsData.totalWorkers}</strong> Workers Listed
              </span>
            </div>
            <div className="hero-stat-pill">
              <ShieldCheck size={16} style={{ color: '#4ade80' }} />
              <span>
                <strong>{statsData.verificationRate}%</strong> Panchayat Verified
              </span>
            </div>
            <div className="hero-stat-pill">
              <Briefcase size={16} style={{ color: '#60a5fa' }} />
              <span>
                <strong>{statsData.totalSkills}</strong> Skill Trades
              </span>
            </div>
            <div className="hero-stat-pill">
              <MapPin size={16} style={{ color: '#f472b6' }} />
              <span>
                <strong>{statsData.totalVillages}</strong> Nearby Villages
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Filter and Search Bar */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        selectedSkill={selectedSkill}
        setSelectedSkill={(val) => {
          setSelectedSkill(val);
          setCurrentPage(1);
        }}
        selectedVillage={selectedVillage}
        setSelectedVillage={(val) => {
          setSelectedVillage(val);
          setCurrentPage(1);
        }}
        selectedAvailability={selectedAvailability}
        setSelectedAvailability={(val) => {
          setSelectedAvailability(val);
          setCurrentPage(1);
        }}
        verifiedOnly={verifiedOnly}
        setVerifiedOnly={(val) => {
          setVerifiedOnly(val);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        setSortBy={(val) => {
          setSortBy(val);
          setCurrentPage(1);
        }}
        skillsList={skillsList}
        villagesList={villagesList}
        onResetFilters={handleResetFilters}
      />

      {/* Results Header: Count & View Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          margin: '12px 0',
        }}
      >
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
          {t('search.showingResults', { count: workers.length, total: totalCount })}
        </p>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('grid')}
            title={t('search.viewGrid')}
          >
            <LayoutGrid size={15} />
            <span>{t('search.viewGrid')}</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('table')}
            title={t('search.viewTable')}
          >
            <TableIcon size={15} />
            <span>{t('search.viewTable')}</span>
          </button>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="workers-grid">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="worker-card"
              style={{ minHeight: 280 }}
            >
              <div className="skeleton" style={{ height: 40, marginBottom: 12 }}></div>
              <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 12 }}></div>
              <div className="skeleton" style={{ height: 60, marginBottom: 12 }}></div>
              <div className="skeleton" style={{ height: 44, marginTop: 'auto' }}></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="empty-state" style={{ borderColor: 'var(--danger)' }}>
          <AlertCircle size={48} style={{ color: 'var(--danger)' }} />
          <h3 style={{ color: 'var(--danger)' }}>Server Connection Error</h3>
          <p style={{ color: 'var(--text-muted)' }}>{error}</p>
          <button type="button" className="btn btn-primary" onClick={loadWorkers}>
            <RotateCcw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && workers.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Users size={32} />
          </div>
          <h3>{t('search.noWorkersFound')}</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: 440 }}>
            {t('search.noWorkersHint')}
          </p>
          <button type="button" className="btn btn-primary" onClick={handleResetFilters}>
            <RotateCcw size={15} />
            <span>{t('search.clearFilters')}</span>
          </button>
        </div>
      )}

      {/* Results - Card View */}
      {!loading && !error && workers.length > 0 && viewMode === 'grid' && (
        <div className="workers-grid">
          {workers.map((worker) => (
            <WorkerCard
              key={worker._id}
              worker={worker}
              onRequestContact={onRequestContact}
            />
          ))}
        </div>
      )}

      {/* Results - Table View */}
      {!loading && !error && workers.length > 0 && viewMode === 'table' && (
        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Worker Name</th>
                <th>Skill</th>
                <th>Village</th>
                <th>Status</th>
                <th>Verification</th>
                <th>Rating</th>
                <th>Daily Wage</th>
                <th>Contact Action</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker) => (
                <tr key={worker._id}>
                  <td>
                    <strong>{worker.name}</strong>
                    {worker.eShramUan && (
                      <span
                        className="badge badge-eshram"
                        style={{ marginLeft: 6, display: 'inline-flex' }}
                      >
                        e-Shram
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="worker-skill-badge">{worker.skillCategory}</span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} style={{ color: 'var(--accent)' }} />
                      {worker.village}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${worker.availabilityStatus.replace('_', '')}`}>
                      {worker.availabilityStatus}
                    </span>
                  </td>
                  <td>
                    {worker.isVerified ? (
                      <span className="badge badge-verified">
                        <ShieldCheck size={13} /> Verified
                      </span>
                    ) : (
                      <span className="badge badge-unverified">Pending</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#f59e0b' }}>
                      ★ {worker.rating > 0 ? worker.rating : 'New'}
                    </span>
                  </td>
                  <td>
                    ₹{worker.dailyWageMin} - ₹{worker.dailyWageMax}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onRequestContact(worker)}
                    >
                      <Phone size={13} />
                      <span>Request</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 12,
            marginTop: 32,
          }}
        >
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
