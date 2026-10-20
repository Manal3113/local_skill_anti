import React from 'react';
import { useI18n } from '../i18n';
import { Search, Filter, RotateCcw, ShieldCheck, Check } from 'lucide-react';

export const FilterBar = ({
  searchQuery,
  setSearchQuery,
  selectedSkill,
  setSelectedSkill,
  selectedVillage,
  setSelectedVillage,
  selectedAvailability,
  setSelectedAvailability,
  verifiedOnly,
  setVerifiedOnly,
  sortBy,
  setSortBy,
  skillsList = [],
  villagesList = [],
  onResetFilters,
}) => {
  const { t } = useI18n();

  return (
    <div className="filter-card">
      {/* Search Input */}
      <div className="search-input-wrap">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder={t('search.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search workers"
        />
      </div>

      {/* Filter Controls Row */}
      <div className="filter-controls-row">
        {/* Skill Category Dropdown */}
        <div>
          <select
            className="filter-select"
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            aria-label="Filter by skill category"
          >
            <option value="all">{t('search.allSkills')}</option>
            {skillsList.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>

        {/* Village Dropdown */}
        <div>
          <select
            className="filter-select"
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            aria-label="Filter by village"
          >
            <option value="all">{t('search.allVillages')}</option>
            {villagesList.map((village) => (
              <option key={village} value={village}>
                {village}
              </option>
            ))}
          </select>
        </div>

        {/* Availability Status */}
        <div>
          <select
            className="filter-select"
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
            aria-label="Filter by availability status"
          >
            <option value="all">{t('search.allAvailability')}</option>
            <option value="available">{t('search.availableNow')}</option>
            <option value="busy">{t('search.busy')}</option>
            <option value="seasonal">{t('search.seasonal')}</option>
            <option value="on_leave">{t('search.onLeave')}</option>
          </select>
        </div>

        {/* Sort By Dropdown */}
        <div>
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort workers"
          >
            <option value="rating">{t('search.sortRating')}</option>
            <option value="newest">{t('search.sortNewest')}</option>
            <option value="experience">{t('search.sortExperience')}</option>
            <option value="name">{t('search.sortName')}</option>
          </select>
        </div>

        {/* Verified Only Checkbox */}
        <label className="checkbox-label" title="Filter to show only Panchayat verified workers">
          <input
            type="checkbox"
            className="checkbox-input"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
          />
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ShieldCheck size={16} style={{ color: '#16a34a' }} />
            {t('search.verifiedOnly')}
          </span>
        </label>

        {/* Reset Button */}
        <div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onResetFilters}
            title="Reset all search filters"
          >
            <RotateCcw size={14} />
            <span>{t('search.clearFilters')}</span>
          </button>
        </div>
      </div>

      {/* Quick Filter Shortcut Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center', fontWeight: 600 }}>
          Quick Filters:
        </span>
        <button
          type="button"
          className={`btn btn-sm ${selectedAvailability === 'available' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSelectedAvailability(selectedAvailability === 'available' ? 'all' : 'available')}
        >
          {t('search.availableNow')}
        </button>
        <button
          type="button"
          className={`btn btn-sm ${selectedSkill === 'Mason' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSelectedSkill(selectedSkill === 'Mason' ? 'all' : 'Mason')}
        >
          Mason (राजमिस्त्री / गवंडी)
        </button>
        <button
          type="button"
          className={`btn btn-sm ${selectedSkill === 'Electrician' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSelectedSkill(selectedSkill === 'Electrician' ? 'all' : 'Electrician')}
        >
          Electrician (बिजली मिस्त्री)
        </button>
        <button
          type="button"
          className={`btn btn-sm ${selectedSkill === 'Plumber' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSelectedSkill(selectedSkill === 'Plumber' ? 'all' : 'Plumber')}
        >
          Plumber (नलसाज)
        </button>
        <button
          type="button"
          className={`btn btn-sm ${verifiedOnly ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setVerifiedOnly(!verifiedOnly)}
        >
          {t('search.verifiedOnly')}
        </button>
      </div>
    </div>
  );
};
