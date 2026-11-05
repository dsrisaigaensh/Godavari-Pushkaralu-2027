import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import {
  FolderGit2,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  Filter,
  RotateCcw,
  ChevronRight,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Calendar,
  Award,
  Flag,
  HardHat,
  Zap,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n/LanguageContext';
import type {
  SummaryMetrics,
  DashboardVisualizations,
  ActionQueueItem,
  DashboardFilterOptions,
} from '../../types/dashboard';

import kalashIcon from '../../assets/kalash_icon.png';
import ghatPanorama from '../../assets/godavari_ghat_panorama.png';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Filters State
  const [filters, setFilters] = useState({
    project_id: '',
    zone_id: '',
    category: '',
    vendor_id: '',
    status: '',
    risk_level: '',
  });

  const [filterOptions, setFilterOptions] = useState<DashboardFilterOptions | null>(null);
  const [metrics, setMetrics] = useState<SummaryMetrics | null>(null);
  const [visuals, setVisuals] = useState<DashboardVisualizations | null>(null);
  const [actionQueue, setActionQueue] = useState<ActionQueueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Map controls state
  const [mapLayerTab, setMapLayerTab] = useState<'layers' | 'legend'>('layers');
  const [mobileMapControlsOpen, setMobileMapControlsOpen] = useState<boolean>(false);
  const [mapLayers, setMapLayers] = useState({
    projects: true,
    assets: true,
    inspections: true,
    defects: true,
    boundaries: false,
  });

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Load Filter Options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const opts = await api.getDashboardFilters();
        setFilterOptions(opts);
      } catch (err: any) {
        console.error('Failed to load filter options', err);
      }
    };
    fetchOptions();
  }, []);

  // Load Metrics, Visuals, and Action Queue on Filter Change
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters: Record<string, string> = {};
      if (filters.project_id) activeFilters.project_id = filters.project_id;
      if (filters.zone_id) activeFilters.zone_id = filters.zone_id;
      if (filters.category) activeFilters.category = filters.category;
      if (filters.vendor_id) activeFilters.vendor_id = filters.vendor_id;
      if (filters.status) activeFilters.status = filters.status;
      if (filters.risk_level) activeFilters.risk_level = filters.risk_level;

      const [metricsData, visualsData, queueData] = await Promise.all([
        api.getDashboardMetrics(activeFilters),
        api.getDashboardVisualizations(activeFilters),
        api.getDashboardActionQueue(),
      ]);

      setMetrics(metricsData);
      setVisuals(visualsData);
      setActionQueue(queueData);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve executive dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [filters]);

  // Initialize preview map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    // Center on Rajamahendravaram Godavari River
    const map = L.map(mapContainerRef.current, {
      center: [16.995, 81.778],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Custom colored pin creator
    const createMarkerIcon = (color: string, label: string) => {
      return L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="background-color: ${color}; width: 26px; height: 26px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3);">
            <div style="transform: rotate(45deg); color: white; font-size: 10px; font-weight: bold;">${label}</div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
      });
    };

    // Add illustrative Pushkaralu Ghat markers
    const samplePins = [
      { lat: 17.002, lng: 81.775, color: '#16A34A', label: '✓', title: 'Kotilingala Ghat Works' },
      { lat: 16.992, lng: 81.779, color: '#EA580C', label: 'W', title: 'Pushkar Ghat Intake Pump' },
      { lat: 16.985, lng: 81.788, color: '#DC2626', label: '!', title: 'Saraswati Ghat Pipeline Defect' },
      { lat: 17.010, lng: 81.768, color: '#9333EA', label: 'I', title: 'Markandeya Temple Inspection' },
      { lat: 16.978, lng: 81.795, color: '#2563EB', label: 'A', title: 'Dowleswaram Barrage Assets' },
    ];

    samplePins.forEach((pin) => {
      L.marker([pin.lat, pin.lng], { icon: createMarkerIcon(pin.color, pin.label) })
        .bindPopup(`<strong>${pin.title}</strong>`)
        .addTo(markersGroup);
    });

    // Fix map layout on resize
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {
        // Ignore resize during fast unmount
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      try {
        map.off();
        map.remove();
      } catch {
        // Suppress DOMException during React 19 unmount
      }
      mapInstanceRef.current = null;
    };
  }, []);

  const handleResetFilters = () => {
    setFilters({
      project_id: '',
      zone_id: '',
      category: '',
      vendor_id: '',
      status: '',
      risk_level: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  // Calculate high-level progress numbers
  const verifiedScore = 72; // Representative Godavari Pushkaralu readiness score

  return (
    <div className="space-y-4 md:space-y-5">
      {/* 1. Hero Command Center Banner (Matches reference design) */}
      <div className="bg-gradient-to-r from-[#FFFBF5] via-[#FFF5E8] to-[#FFF1DE] rounded-2xl border border-[#EBDCC8] shadow-card overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-stretch justify-between relative min-h-[145px]">
          {/* Left Decorative Information Cell */}
          <div className="p-5 md:p-6 flex items-center gap-4 md:gap-5 z-10 flex-1">
            {/* Golden Sacred Kumbham / Kalash Medallion */}
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-[#D97706] via-[#F59E0B] to-[#FDE68A] p-2 flex items-center justify-center shadow-lg shadow-amber-900/10 shrink-0 border-2 border-white/80">
              <img
                src={kalashIcon}
                alt="Godavari Pushkaralu Kalash"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>

            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-serif text-[#4A120E] tracking-tight leading-tight">
                {t('hero_title', 'Sri Godavari Pushkaralu 2027')}
              </h1>
              <h2 className="text-xs sm:text-sm md:text-base font-bold text-[#2A1810] mt-0.5 tracking-tight">
                {t('hero_sub', 'Infrastructure Readiness Command Center')}
              </h2>
              <div className="text-[11px] sm:text-xs text-[#8A3B2B] font-medium mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold">{t('hero_pillars', 'Planning • Execution • Verification • Readiness')}</span>
              </div>
            </div>
          </div>

          {/* Right Side: Scenic Panoramic Godavari River Ghats Background & Status Pill */}
          <div className="relative md:w-1/2 flex items-center justify-end p-4 md:p-5 overflow-hidden">
            {/* Scenic Background image with smooth gradient fade */}
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-85"
              style={{
                backgroundImage: `url(${ghatPanorama})`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFF5E8] via-[#FFF5E8]/60 to-transparent pointer-events-none" />

            {/* Floating Pushkaralu Readiness Status Badge */}
            <div className="relative z-10 bg-[#3A0D0D]/90 backdrop-blur-md rounded-2xl p-3 text-white border border-amber-500/40 shadow-xl min-w-[210px]">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${loading ? 'bg-amber-400 animate-spin' : 'bg-emerald-400 animate-pulse shadow-emerald-400/50 shadow-sm'}`} />
                <span className="text-xs font-bold tracking-tight">{t('readiness_in_progress', `Pushkaralu Readiness: In Progress (${verifiedScore}%)`)}</span>
              </div>
              <div className="text-[11px] text-amber-200 mt-1 font-medium">
                {verifiedScore}% Verified
              </div>
              <div className="w-full bg-black/40 rounded-full h-2 mt-1.5 overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-700"
                  style={{ width: `${verifiedScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Jurisdiction & Filters Bar (Matches screenshot layout) */}
      <div className="bg-white p-3.5 md:p-4 rounded-2xl border border-[#EBDCC8] shadow-subtle flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#9A3412] font-bold text-xs uppercase tracking-wider">
            <Filter className="w-4 h-4 text-[#EA580C]" />
            <span>{t('jurisdiction_filters', 'Jurisdiction & Filters')}</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-saffron hover:text-saffron-dark flex items-center gap-1 font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Project */}
          <div>
            <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">{t('filter_project', 'Project')}</label>
            <select
              value={filters.project_id}
              onChange={(e) => setFilters({ ...filters, project_id: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-[#FAF7F2] border border-[#E2D3BF] rounded-xl text-stone-900 focus:ring-1 focus:ring-saffron focus:bg-white truncate"
            >
              <option value="">{t('filter_all_projects', 'All Projects')}</option>
              {filterOptions?.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ghat / Zone */}
          <div>
            <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">{t('filter_ghat_zone', 'Ghat / Zone')}</label>
            <select
              value={filters.zone_id}
              onChange={(e) => setFilters({ ...filters, zone_id: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-[#FAF7F2] border border-[#E2D3BF] rounded-xl text-stone-900 focus:ring-1 focus:ring-saffron focus:bg-white truncate"
            >
              <option value="">{t('filter_all_ghats', 'All Ghats & Zones')}</option>
              {filterOptions?.zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          {/* Work Category */}
          <div>
            <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">{t('filter_category', 'Work Category')}</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-[#FAF7F2] border border-[#E2D3BF] rounded-xl text-stone-900 focus:ring-1 focus:ring-saffron focus:bg-white truncate"
            >
              <option value="">{t('filter_all_categories', 'All Categories')}</option>
              {filterOptions?.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Vendor */}
          <div>
            <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">{t('filter_vendor', 'Vendor')}</label>
            <select
              value={filters.vendor_id}
              onChange={(e) => setFilters({ ...filters, vendor_id: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-[#FAF7F2] border border-[#E2D3BF] rounded-xl text-stone-900 focus:ring-1 focus:ring-saffron focus:bg-white truncate"
            >
              <option value="">{t('filter_all_vendors', 'All Vendors')}</option>
              {filterOptions?.vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Workflow State */}
          <div>
            <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">{t('filter_workflow_state', 'Workflow State')}</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-[#FAF7F2] border border-[#E2D3BF] rounded-xl text-stone-900 focus:ring-1 focus:ring-saffron focus:bg-white truncate"
            >
              <option value="">{t('filter_all_states', 'All States')}</option>
              {filterOptions?.statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">{t('filter_date_range', 'Date Range')}</label>
            <div className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-[#FAF7F2] border border-[#E2D3BF] rounded-xl text-stone-800">
              <Calendar className="w-3.5 h-3.5 text-saffron shrink-0" />
              <span className="truncate text-[11px] font-medium">Jan 01, 2026 - Jul 31, 2027</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-2xl text-xs text-govError flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 3. 6 Primary Core Metric Cards (Exact match to screenshot) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Projects */}
        <div
          onClick={() => navigate('/projects')}
          className="p-3.5 bg-white rounded-2xl border border-[#EBDCC8] shadow-subtle hover:border-saffron hover:shadow-card transition-all cursor-pointer group flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#EA580C] shrink-0 group-hover:scale-105 transition-transform">
            <HardHat className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-stone-500 block truncate">{t('kpi_total_projects', 'Total Projects')}</span>
            <p className="text-2xl font-black text-stone-900 leading-tight">
              {metrics?.total_projects ?? 8}
            </p>
            <span className="text-[10px] text-stone-500 font-medium block truncate">{t('kpi_total_projects_sub', 'Approved Schemes')}</span>
          </div>
        </div>

        {/* Active Works */}
        <div
          onClick={() => navigate('/projects')}
          className="p-3.5 bg-white rounded-2xl border border-[#EBDCC8] shadow-subtle hover:border-amber-400 hover:shadow-card transition-all cursor-pointer group flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#D97706] shrink-0 group-hover:scale-105 transition-transform">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-stone-500 block truncate">{t('kpi_active_works', 'Active Works')}</span>
            <p className="text-2xl font-black text-stone-900 leading-tight">
              {metrics?.active_works ?? 4}
            </p>
            <span className="text-[10px] text-stone-500 font-medium block truncate">{t('kpi_active_works_sub', 'In Execution')}</span>
          </div>
        </div>

        {/* Reported Complete */}
        <div
          onClick={() => navigate('/projects')}
          className="p-3.5 bg-white rounded-2xl border border-[#EBDCC8] shadow-subtle hover:border-rose-400 hover:shadow-card transition-all cursor-pointer group flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-[#E11D48] shrink-0 group-hover:scale-105 transition-transform">
            <Flag className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-stone-500 block truncate">{t('kpi_reported_complete', 'Reported Complete')}</span>
            <p className="text-2xl font-black text-stone-900 leading-tight">
              {metrics?.reported_complete_works ?? 2}
            </p>
            <span className="text-[10px] text-rose-600 font-semibold block truncate">{t('kpi_reported_complete_sub', 'Vendor Claims 100%')}</span>
          </div>
        </div>

        {/* Verified Complete */}
        <div
          onClick={() => navigate('/inspections')}
          className="p-3.5 bg-white rounded-2xl border border-[#EBDCC8] shadow-subtle hover:border-emerald-400 hover:shadow-card transition-all cursor-pointer group flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#15803D] shrink-0 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-stone-500 block truncate">{t('kpi_verified_complete', 'Verified Complete')}</span>
            <p className="text-2xl font-black text-stone-900 leading-tight">
              {metrics?.verified_complete_works ?? 1}
            </p>
            <span className="text-[10px] text-emerald-700 font-semibold block truncate">{t('kpi_verified_complete_sub', 'Inspection Certified')}</span>
          </div>
        </div>

        {/* Accepted Works */}
        <div
          onClick={() => navigate('/readiness')}
          className="p-3.5 bg-white rounded-2xl border border-[#EBDCC8] shadow-subtle hover:border-amber-400 hover:shadow-card transition-all cursor-pointer group flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-300/80 flex items-center justify-center text-[#B45309] shrink-0 group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-stone-500 block truncate">{t('kpi_accepted_works', 'Accepted Works')}</span>
            <p className="text-2xl font-black text-stone-900 leading-tight">
              {metrics?.accepted_works ?? 1}
            </p>
            <span className="text-[10px] text-amber-700 font-semibold block truncate">{t('kpi_accepted_works_sub', 'Formally Approved')}</span>
          </div>
        </div>

        {/* Works at Risk */}
        <div
          onClick={() => navigate('/readiness')}
          className="p-3.5 bg-white rounded-2xl border border-[#EBDCC8] shadow-subtle hover:border-red-400 hover:shadow-card transition-all cursor-pointer group flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200/80 flex items-center justify-center text-[#DC2626] shrink-0 group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-stone-500 block truncate">{t('kpi_works_at_risk', 'Works at Risk')}</span>
            <p className="text-2xl font-black text-stone-900 leading-tight">
              {metrics?.works_at_risk ?? 3}
            </p>
            <span className="text-[10px] text-red-600 font-semibold block truncate">{t('kpi_works_at_risk_sub', 'Score ≥ 60 / Critical')}</span>
          </div>
        </div>
      </div>

      {/* 4. Lower Grid: Project Readiness Map | Action Queue | Overall Readiness (Matches screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Project Readiness Map */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EBDCC8] shadow-card overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-[#EFE6DA] flex items-center justify-between bg-[#FDFBF7]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-stone-900 tracking-tight">{t('project_readiness_map', 'Project Readiness Map')}</h3>
            </div>
            <button
              onClick={() => navigate('/map')}
              className="text-xs font-bold text-[#9A3412] hover:text-brand flex items-center gap-1 transition-colors"
            >
              <span>{t('view_full_map', 'View Full Map')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Leaflet Map Container with Floating Layers Box */}
          <div className="relative flex-1 min-h-[280px]">
            <div ref={mapContainerRef} className="w-full h-full min-h-[280px] z-0" />

            {/* Mobile Layers Toggle Button */}
            <button
              onClick={() => setMobileMapControlsOpen(!mobileMapControlsOpen)}
              className="sm:hidden absolute top-2.5 right-2.5 z-[500] px-2.5 py-1 bg-white/95 backdrop-blur-sm border border-[#E2D3BF] rounded-lg shadow-sm text-xs font-bold text-stone-700 flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-saffron" />
              <span>{mobileMapControlsOpen ? 'Close' : 'Layers'}</span>
            </button>

            {/* Floating Layers & Legend Panel */}
            <div className={`absolute top-2.5 sm:top-2.5 right-2.5 z-[500] bg-white/95 backdrop-blur-sm border border-[#E2D3BF] rounded-xl shadow-card p-2 text-xs w-48 ${
              mobileMapControlsOpen ? 'block mt-8 sm:mt-0' : 'hidden sm:block'
            }`}>
              <div className="flex items-center rounded-lg bg-stone-100 p-0.5 mb-2">
                <button
                  onClick={() => setMapLayerTab('layers')}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all ${
                    mapLayerTab === 'layers'
                      ? 'bg-amber-100/80 text-amber-900 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Layers
                </button>
                <button
                  onClick={() => setMapLayerTab('legend')}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all ${
                    mapLayerTab === 'legend'
                      ? 'bg-amber-100/80 text-amber-900 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Legend
                </button>
              </div>

              {mapLayerTab === 'layers' ? (
                <div className="space-y-1.5 text-[11px]">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-1.5 text-stone-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Projects & Works
                    </span>
                    <input
                      type="checkbox"
                      checked={mapLayers.projects}
                      onChange={(e) => setMapLayers({ ...mapLayers, projects: e.target.checked })}
                      className="accent-[#EA580C] rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-1.5 text-stone-700">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> Assets
                    </span>
                    <input
                      type="checkbox"
                      checked={mapLayers.assets}
                      onChange={(e) => setMapLayers({ ...mapLayers, assets: e.target.checked })}
                      className="accent-[#EA580C] rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-1.5 text-stone-700">
                      <span className="w-2 h-2 rounded-full bg-purple-500" /> Inspections
                    </span>
                    <input
                      type="checkbox"
                      checked={mapLayers.inspections}
                      onChange={(e) => setMapLayers({ ...mapLayers, inspections: e.target.checked })}
                      className="accent-[#EA580C] rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-1.5 text-stone-700">
                      <span className="w-2 h-2 rounded-full bg-red-500" /> Defects
                    </span>
                    <input
                      type="checkbox"
                      checked={mapLayers.defects}
                      onChange={(e) => setMapLayers({ ...mapLayers, defects: e.target.checked })}
                      className="accent-[#EA580C] rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-1.5 text-stone-700">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> Ghat / Zone Boundaries
                    </span>
                    <input
                      type="checkbox"
                      checked={mapLayers.boundaries}
                      onChange={(e) => setMapLayers({ ...mapLayers, boundaries: e.target.checked })}
                      className="accent-[#EA580C] rounded"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-1 text-[10px] text-stone-600">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> On Track / Certified</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> In Progress / Under Review</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Defect / Critical SLA</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Physical Infrastructure Asset</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle Column: Prioritized Action Queue */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#EBDCC8] shadow-card overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-3.5 border-b border-[#EFE6DA] flex items-center justify-between bg-[#FDFBF7]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-[#D97706]">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                </div>
                <h3 className="text-xs font-bold text-stone-900 tracking-tight">{t('prioritized_action_queue', 'Prioritized Action Queue')}</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {t('active_triggers', '13 Active Triggers')}
              </span>
            </div>

            <div className="divide-y divide-[#EFE6DA]/80">
              {(actionQueue && actionQueue.length > 0 ? actionQueue.slice(0, 4) : [
                { id: '1', title: t('action_item_1_title', 'Sanitation Block – Main Ghat'), description: t('action_item_1_desc', 'Inspection failed • Rework required'), link_url: '/defects' },
                { id: '2', title: t('action_item_2_title', 'Water Kiosk – Zone 3'), description: t('action_item_2_desc', 'Milestone overdue by 3 days'), link_url: '/projects' },
                { id: '3', title: t('action_item_3_title', 'Temporary Lighting – Zone 2'), description: t('action_item_3_desc', 'Evidence pending verification'), link_url: '/inspections' },
                { id: '4', title: t('action_item_4_title', 'Drinking Water Unit – Zone 4'), description: t('action_item_4_desc', 'Inspection due tomorrow'), link_url: '/inspections' },
              ]).map((item, idx) => {
                const iconColor = idx === 0 ? 'bg-red-50 text-red-600' : idx === 1 ? 'bg-amber-50 text-amber-600' : idx === 2 ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600';
                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(item.link_url || '/defects')}
                    className="p-3 hover:bg-amber-50/40 transition-colors cursor-pointer flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg ${iconColor} flex items-center justify-center shrink-0`}>
                        {idx === 0 || idx === 2 ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-stone-900 block truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-stone-500 block truncate">
                          {item.description}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 border-t border-[#EFE6DA] text-center bg-[#FDFBF7]">
            <button
              onClick={() => navigate('/my-tasks')}
              className="text-xs font-bold text-[#9A3412] hover:text-brand flex items-center justify-center gap-1 mx-auto transition-colors"
            >
              <span>{t('view_all_actions', 'View All Actions')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Project Readiness (Overall) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#EBDCC8] shadow-card p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={kalashIcon} alt="Kalash" className="w-5 h-5 object-contain" />
              <h3 className="text-xs font-bold text-stone-900 tracking-tight">{t('project_readiness_overall', 'Project Readiness (Overall)')}</h3>
            </div>

            {/* Semicircular Radial Gauge */}
            <div className="flex flex-col items-center justify-center my-2 relative">
              <svg className="w-44 h-24 overflow-visible" viewBox="0 0 160 85">
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#EA580C" />
                    <stop offset="50%" stopColor="#FBBF24" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
                {/* Background arc */}
                <path
                  d="M 15 80 A 65 65 0 0 1 145 80"
                  fill="none"
                  stroke="#F3EDE3"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                {/* Foreground value arc (72%) */}
                <path
                  d="M 15 80 A 65 65 0 0 1 145 80"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray="204.2"
                  strokeDashoffset={204.2 * (1 - 0.72)}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="text-center mt-[-10px]">
                <div className="text-3xl font-black text-stone-900 leading-none tracking-tight">72%</div>
                <div className="text-[11px] font-semibold text-stone-500 mt-0.5">{t('readiness_score', 'Readiness Score')}</div>
              </div>
            </div>

            {/* Status counts breakdown */}
            <div className="grid grid-cols-3 gap-1 pt-3 border-t border-[#EFE6DA] text-center my-2">
              <div className="p-1 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-[#15803D] mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-semibold text-stone-500 block leading-tight">{t('on_track', 'On Track')}</span>
                <span className="text-xs font-black text-stone-900">5 {t('projects_unit', 'Projects')}</span>
              </div>
              <div className="p-1 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-[#D97706] mb-0.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-semibold text-stone-500 block leading-tight">{t('at_risk', 'At Risk')}</span>
                <span className="text-xs font-black text-stone-900">2 {t('projects_unit', 'Projects')}</span>
              </div>
              <div className="p-1 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-[#DC2626] mb-0.5">
                  <AlertOctagon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-semibold text-stone-500 block leading-tight">{t('overdue', 'Overdue')}</span>
                <span className="text-xs font-black text-stone-900">1 {t('project_unit_single', 'Project')}</span>
              </div>
            </div>
          </div>

          <Button
            variant="saffron"
            size="md"
            onClick={() => navigate('/readiness')}
            className="w-full mt-2"
          >
            <span>{t('view_readiness_analysis', 'View Readiness Analysis')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* 5. Deep Analytics Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
        {/* Core Proof Mechanism: Reported vs Verified Progress Gap */}
        <div className="lg:col-span-8 bg-white p-4 md:p-5 rounded-2xl border border-[#EBDCC8] shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-saffron" /> Reported vs. Verified Progress Disparity
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Eliminates corruption by contrasting vendor claims (blue) against field-verified truth (green).
              </p>
            </div>
            <Badge variant="saffron" size="sm">
              Anti-Corruption Proof
            </Badge>
          </div>

          <div className="h-64 w-full">
            {visuals?.reported_vs_verified_progress && visuals.reported_vs_verified_progress.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={visuals.reported_vs_verified_progress}
                  margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5EFE6" />
                  <XAxis dataKey="work_id" tick={{ fontSize: 11, fill: '#786558' }} />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: '#786558' }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #EBDCC8',
                      boxShadow: '0 8px 16px rgba(74, 22, 14, 0.08)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar
                    dataKey="reported_progress"
                    name="Vendor Reported %"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="verified_progress"
                    name="Inspection Verified %"
                    fill="#15803D"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-stone-500">
                No progress data matching selected filters
              </div>
            )}
          </div>
        </div>

        {/* Project Status Distribution */}
        <div className="lg:col-span-4 bg-white p-4 md:p-5 rounded-2xl border border-[#EBDCC8] shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-brand" /> Work Status Breakdown
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">Distribution across audited 12-stage lifecycle.</p>

            <div className="h-48 w-full mt-2">
              {visuals?.project_status_distribution && visuals.project_status_distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={visuals.project_status_distribution}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {visuals.project_status_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #EBDCC8',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-stone-500">
                  No status data
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-[#EFE6DA] text-[11px]">
            {visuals?.project_status_distribution.map((item) => (
              <div key={item.status} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-stone-600 truncate">{item.status}:</span>
                <strong className="text-stone-900">{item.count}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Ghat Sector Readiness Overview */}
        <div className="lg:col-span-6 bg-white p-4 md:p-5 rounded-2xl border border-[#EBDCC8] shadow-card">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D97706]" /> Bathing Ghat Infrastructure Readiness
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">Audited verified readiness score by Pushkaralu riverfront zone.</p>
            </div>
            <button
              onClick={() => navigate('/map')}
              className="text-xs font-bold text-saffron hover:underline"
            >
              Open GIS Map
            </button>
          </div>

          <div className="space-y-3 mt-3">
            {visuals?.work_readiness_by_zone.map((z) => (
              <div key={z.zone_code} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-900">
                    {z.zone_name} <span className="font-mono text-[10px] text-stone-400">[{z.zone_code}]</span>
                  </span>
                  <span className="font-bold text-[#EA580C]">{z.readiness_percentage}% Verified</span>
                </div>
                <div className="w-full bg-[#F5EFE6] rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${z.readiness_percentage}%`,
                      backgroundColor:
                        z.readiness_percentage >= 80
                          ? '#15803D'
                          : z.readiness_percentage >= 50
                          ? '#EA580C'
                          : '#DC2626',
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-stone-500">
                  <span>{z.total_works} works deployed</span>
                  <span>{z.verified_works} certified complete</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explainable Risk Engine Triggers */}
        <div className="lg:col-span-6 bg-white p-4 md:p-5 rounded-2xl border border-[#EBDCC8] shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#EA580C]" /> Explainable Risk Triggers (Rules A–G)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Automated risk scoring based on failed checks and milestone breaches.
              </p>
            </div>
            <Badge variant="warning" size="sm">
              Live Audit
            </Badge>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {visuals?.highest_priority_risks.map((risk) => (
              <div key={risk.work_id} className="p-3 bg-[#FAF7F2] border border-[#EBDCC8] rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900">{risk.title}</span>
                  <Badge
                    variant={risk.risk_category === 'Critical' ? 'error' : 'warning'}
                    size="sm"
                  >
                    Risk: {risk.risk_score}/100
                  </Badge>
                </div>
                <p className="text-[11px] text-stone-600 leading-snug">{risk.risk_explanation}</p>
                <div className="pt-1.5 mt-1 border-t border-[#EFE6DA] flex items-center justify-between text-[11px]">
                  <span className="text-amber-900 font-medium">Recommended: {risk.suggested_action}</span>
                  <button
                    onClick={() => navigate('/readiness')}
                    className="text-saffron hover:underline font-bold flex items-center"
                  >
                    Inspect Chain <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
