import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Upload, BarChart3, Table, Menu, X, Filter, Calendar, MapPin, 
  RefreshCw, TrendingUp, Building2, Globe, Package, Target, 
  ArrowUpRight, ArrowDownRight, Percent, Layers, PieChart as PieChartIcon
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import FileUpload from './components/FileUpload';
import DataTable from './components/DataTable';
import { getDashboardSummary, getRegions, getSales, getCollections, getProductComparison, getProducts } from './services/api';

// Constants
const MONTHS = [
  { value: 1, label: 'January', short: 'Jan' },
  { value: 2, label: 'February', short: 'Feb' },
  { value: 3, label: 'March', short: 'Mar' },
  { value: 4, label: 'April', short: 'Apr' },
  { value: 5, label: 'May', short: 'May' },
  { value: 6, label: 'June', short: 'Jun' },
  { value: 7, label: 'July', short: 'Jul' },
  { value: 8, label: 'August', short: 'Aug' },
  { value: 9, label: 'September', short: 'Sep' },
  { value: 10, label: 'October', short: 'Oct' },
  { value: 11, label: 'November', short: 'Nov' },
  { value: 12, label: 'December', short: 'Dec' }
];

const YEARS = [2023, 2024, 2025, 2026];
const QUARTERS = [
  { value: 'all', label: 'All Quarters' },
  { value: 1, label: 'Q1 (Jan-Mar)' },
  { value: 2, label: 'Q2 (Apr-Jun)' },
  { value: 3, label: 'Q3 (Jul-Sep)' },
  { value: 4, label: 'Q4 (Oct-Dec)' }
];
const ZONES = ['All Zones', 'North', 'South', 'Central', 'East'];

// Chart colors
const CHART_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#4f93de'];

// Utility functions
const formatBDT = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '৳ 0';
  const num = Number(value);
  if (num >= 10000000) return '৳ ' + (num / 10000000).toFixed(2) + ' Cr';
  if (num >= 100000) return '৳ ' + (num / 100000).toFixed(2) + ' Lac';
  if (num >= 1000) return '৳ ' + (num / 1000).toFixed(1) + ' K';
  return '৳ ' + num.toLocaleString('en-BD');
};

const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return Number(value).toLocaleString('en-BD');
};

const formatPercent = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return Number(value).toFixed(1) + '%';
};

// Custom BDT (Taka) Icon Component
const BDTIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <text x="6" y="17" fontSize="16" fontWeight="bold" fill="currentColor" stroke="none">৳</text>
  </svg>
);

// Enhanced Filter Component - Better Visibility Design
const FilterBar = ({ filters, setFilters, regions = [], zones = [], products = [], showAllFilters = false }) => {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-400 p-3 mb-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-gray-900 border-r-2 border-gray-400 pr-3">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-sm">Filters</span>
        </div>
        
        {/* Month Filter */}
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-600" />
          <select
            value={filters.month}
            onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
            className="border-2 border-gray-400 rounded px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value={0}>All Months</option>
            {MONTHS.map(m => (
              <option key={m.value} value={m.value}>{m.short}</option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <select
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
          className="border-2 border-gray-400 rounded px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          {YEARS.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {/* Quarter Filter */}
        {showAllFilters && (
          <select
            value={filters.quarter || 'all'}
            onChange={(e) => setFilters({ ...filters, quarter: e.target.value === 'all' ? null : parseInt(e.target.value) })}
            className="border-2 border-gray-400 rounded px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {QUARTERS.map(q => (
              <option key={q.value} value={q.value}>{q.label}</option>
            ))}
          </select>
        )}

        {/* Zone Filter - Skipped for now
        {showAllFilters && (
          <div className="flex items-center gap-1">
            <Globe className="w-4 h-4 text-gray-600" />
            <select
              value={filters.zone || 'All Zones'}
              onChange={(e) => setFilters({ ...filters, zone: e.target.value === 'All Zones' ? null : e.target.value })}
              className="border-2 border-gray-400 rounded px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {ZONES.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>
        )}
        */}

        {/* Region Filter */}
        {regions.length > 0 && (
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-gray-600" />
            <select
              value={filters.region || 'all'}
              onChange={(e) => setFilters({ ...filters, region: e.target.value === 'all' ? null : e.target.value })}
              className="border-2 border-gray-400 rounded px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">All Regions</option>
              {regions.map(r => (
                <option key={r.region_id} value={r.region_id}>{r.area_name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Product Category Filter - Skipped for now
        {showAllFilters && products.length > 0 && (
          <div className="flex items-center gap-1">
            <Package className="w-4 h-4 text-gray-600" />
            <select
              value={filters.category || 'all'}
              onChange={(e) => setFilters({ ...filters, category: e.target.value === 'all' ? null : e.target.value })}
              className="border-2 border-gray-400 rounded px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">All Categories</option>
              {[...new Set(products.map(p => p.product_category))].filter(Boolean).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
        */}

        {/* Reset Button */}
        <button
          onClick={() => setFilters({ month: 11, year: 2025, region: null, zone: null, quarter: null, category: null })}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-white hover:bg-blue-600 border-2 border-gray-400 hover:border-blue-600 rounded transition-colors ml-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
};

// KPI Card Component - Better Visibility Design
const KPICard = ({ title, value, subtitle, icon: Icon, trend, trendValue }) => (
  <div className="bg-white rounded-lg border-2 border-gray-400 p-4 hover:border-blue-500 hover:shadow-md transition-all">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{title}</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
      </div>
      <div className="p-2 rounded-lg bg-blue-100">
        <Icon className="w-5 h-5 text-blue-700" />
      </div>
    </div>
    {trend !== undefined && (
      <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-green-700' : 'text-red-600'}`}>
        {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        <span>{Math.abs(trendValue || trend).toFixed(1)}%</span>
        <span className="text-gray-500">vs target</span>
      </div>
    )}
  </div>
);

// Header Component - Better Visibility Design
const Header = ({ title, subtitle }) => (
  <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-lg p-5 mb-4 shadow-lg">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
      <div className="text-white">
        <div className="flex items-center gap-3 mb-1">
          <Building2 className="w-7 h-7 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && <p className="text-blue-200 text-sm mt-1">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="mt-3 md:mt-0 text-right text-white">
        <p className="text-sm text-gray-300">Last Updated</p>
        <p className="text-sm font-semibold">{new Date().toLocaleString('en-BD')}</p>
      </div>
    </div>
  </div>
);

// Navigation Component - Black/White Design
const Navigation = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard & Analytics' },
    { path: '/reports', icon: Table, label: 'Reports' },
    { path: '/upload', icon: Upload, label: 'Upload Data' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-white border-2 border-gray-400 rounded-lg shadow-md"
      >
        {isOpen ? <X className="w-5 h-5 text-gray-800" /> : <Menu className="w-5 h-5 text-gray-800" />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col items-center justify-center h-24 border-b-2 border-gray-700 px-4 bg-black/30">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <h1 className="text-base font-bold text-white tracking-wide">SUROVI AGRO</h1>
          </div>
          <p className="text-xs text-gray-300 font-medium">Industries Ltd.</p>
          <p className="text-xs text-blue-300 mt-1">Business Intelligence</p>
        </div>
        <nav className="mt-4 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm rounded-lg mb-2 transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white font-bold shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-5 border-t-2 border-gray-700 bg-black/30">
          <p className="text-xs text-gray-400 text-center font-medium">© 2025 Surovi Agro Industries</p>
        </div>
      </aside>
    </>
  );
};

// ============================================================================
// ECHART COMPONENTS
// ============================================================================

// Sales vs Target Bar Chart
const SalesTargetChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  
  const chartData = data.map(item => ({
    name: item.area_name,
    target: item.sales_target,
    actual: item.net_sales,
    achievement: item.sales_ach_pct
  }));

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        let result = params[0].name + '<br/>';
        params.forEach(p => {
          result += `${p.marker} ${p.seriesName}: ${formatBDT(p.value)}<br/>`;
        });
        return result;
      }
    },
    legend: { top: 5, textStyle: { fontSize: 10 } },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: chartData.map(d => d.name),
      axisLabel: { rotate: 45, fontSize: 9 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (v) => formatBDT(v), fontSize: 9 }
    },
    series: [
      { name: 'Target', type: 'bar', data: chartData.map(d => d.target), itemStyle: { color: '#94a3b8' } },
      { name: 'Net Sales', type: 'bar', data: chartData.map(d => d.actual), itemStyle: { color: '#5470c6' } }
    ]
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-400 p-4 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1">
        <Target className="w-3.5 h-3.5" />
        Sales vs Target by Region
      </h3>
      <ReactECharts option={option} style={{ height: '280px' }} />
    </div>
  );
};

// Collection Pie Chart
const CollectionPieChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const totals = data.reduce((acc, item) => ({
    cash: acc.cash + (item.cash_coll || 0),
    credit: acc.credit + (item.credit_coll || 0),
    seed: acc.seed + (item.seed_coll || 0)
  }), { cash: 0, credit: 0, seed: 0 });

  const pieData = [
    { name: 'Cash', value: totals.cash },
    { name: 'Credit', value: totals.credit },
    { name: 'Seed', value: totals.seed }
  ];

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (p) => `${p.name}: ${formatBDT(p.value)} (${p.percent}%)`
    },
    legend: { bottom: 5, textStyle: { fontSize: 10 } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      data: pieData,
      label: { formatter: '{b}: {d}%', fontSize: 9 },
      itemStyle: { borderRadius: 4 },
      color: CHART_COLORS
    }]
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-400 p-4 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1">
        <PieChartIcon className="w-3.5 h-3.5" />
        Collection Distribution
      </h3>
      <ReactECharts option={option} style={{ height: '280px' }} />
    </div>
  );
};

// Achievement Comparison Chart
const AchievementChart = ({ salesData, collectionData }) => {
  if (!salesData || salesData.length === 0) return null;

  const chartData = salesData.map(sale => {
    const collection = collectionData?.find(c => c.region_id === sale.region_id);
    return {
      name: sale.area_name,
      sales: sale.sales_ach_pct || 0,
      collection: collection?.coll_ach_pct || 0
    };
  });

  const option = {
    tooltip: { trigger: 'axis' },
    legend: { top: 5, textStyle: { fontSize: 10 } },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: chartData.map(d => d.name),
      axisLabel: { rotate: 45, fontSize: 9 }
    },
    yAxis: {
      type: 'value',
      max: 150,
      axisLabel: { formatter: '{value}%', fontSize: 9 }
    },
    series: [
      { name: 'Sales %', type: 'bar', data: chartData.map(d => d.sales), itemStyle: { color: '#5470c6' } },
      { name: 'Collection %', type: 'line', data: chartData.map(d => d.collection), smooth: true, lineStyle: { width: 3 }, itemStyle: { color: '#91cc75' } }
    ]
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-400 p-4 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1">
        <Percent className="w-3.5 h-3.5" />
        Achievement % by Region
      </h3>
      <ReactECharts option={option} style={{ height: '280px' }} />
    </div>
  );
};

// Zone Performance Chart
const ZonePerformanceChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const zoneData = data.reduce((acc, item) => {
    const zone = item.zone || 'Unknown';
    if (!acc[zone]) acc[zone] = { zone, sales: 0, collection: 0, target: 0 };
    acc[zone].sales += item.net_sales || 0;
    acc[zone].collection += item.total_coll || 0;
    acc[zone].target += item.sales_target || 0;
    return acc;
  }, {});

  const chartData = Object.values(zoneData);

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let result = params[0].name + '<br/>';
        params.forEach(p => {
          result += `${p.marker} ${p.seriesName}: ${formatBDT(p.value)}<br/>`;
        });
        return result;
      }
    },
    legend: { top: 5, textStyle: { fontSize: 10 } },
    grid: { left: '3%', right: '4%', bottom: '5%', containLabel: true },
    yAxis: {
      type: 'category',
      data: chartData.map(d => d.zone),
      axisLabel: { fontSize: 9 }
    },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: (v) => formatBDT(v), fontSize: 9 }
    },
    series: [
      { name: 'Sales', type: 'bar', data: chartData.map(d => d.sales), itemStyle: { color: '#5470c6' } },
      { name: 'Collection', type: 'bar', data: chartData.map(d => d.collection), itemStyle: { color: '#91cc75' } }
    ]
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-400 p-4 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1">
        <Globe className="w-3.5 h-3.5" />
        Zone-wise Performance
      </h3>
      <ReactECharts option={option} style={{ height: '280px' }} />
    </div>
  );
};

// Product Performance Chart
const ProductPerformanceChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const top10 = [...data]
    .filter(p => p.value_2025 > 0)
    .sort((a, b) => b.value_2025 - a.value_2025)
    .slice(0, 10);

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let result = params[0].name + '<br/>';
        params.forEach(p => {
          result += `${p.marker} ${p.seriesName}: ${formatBDT(p.value)}<br/>`;
        });
        return result;
      }
    },
    legend: { top: 5, textStyle: { fontSize: 10 } },
    grid: { left: '3%', right: '4%', bottom: '5%', containLabel: true },
    yAxis: {
      type: 'category',
      data: top10.map(d => d.product_name.length > 18 ? d.product_name.substring(0, 18) + '...' : d.product_name),
      axisLabel: { fontSize: 8 }
    },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: (v) => formatBDT(v), fontSize: 9 }
    },
    series: [
      { name: '2024', type: 'bar', data: top10.map(d => d.value_2024 || 0), itemStyle: { color: '#94a3b8' } },
      { name: '2025', type: 'bar', data: top10.map(d => d.value_2025 || 0), itemStyle: { color: '#91cc75' } }
    ]
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-400 p-4 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1">
        <Package className="w-3.5 h-3.5" />
        Top 10 Products - YoY Comparison
      </h3>
      <ReactECharts option={option} style={{ height: '320px' }} />
    </div>
  );
};

// Product Growth Chart
const ProductGrowthChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const growthData = [...data]
    .filter(p => p.value_2025 > 0 && p.value_growth_pct !== 0)
    .sort((a, b) => b.value_growth_pct - a.value_growth_pct)
    .slice(0, 15);

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (p) => `${p[0].name}: ${p[0].value.toFixed(1)}%`
    },
    grid: { left: '3%', right: '4%', bottom: '20%', containLabel: true },
    xAxis: {
      type: 'category',
      data: growthData.map(d => d.product_name.length > 10 ? d.product_name.substring(0, 10) + '..' : d.product_name),
      axisLabel: { rotate: 45, fontSize: 8 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '{value}%', fontSize: 9 }
    },
    series: [{
      type: 'bar',
      data: growthData.map(d => ({
        value: d.value_growth_pct || 0,
        itemStyle: { color: (d.value_growth_pct || 0) >= 0 ? '#91cc75' : '#ee6666' }
      }))
    }]
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-400 p-4 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1">
        <TrendingUp className="w-3.5 h-3.5" />
        Product Growth Rate (YoY %)
      </h3>
      <ReactECharts option={option} style={{ height: '320px' }} />
    </div>
  );
};

// Radar Chart for Region Analysis
const RegionRadarChart = ({ salesData, collectionData }) => {
  if (!salesData || salesData.length === 0) return null;

  const radarData = salesData.slice(0, 6).map(sale => {
    const collection = collectionData?.find(c => c.region_id === sale.region_id);
    return {
      region: sale.area_name,
      salesAch: Math.min(sale.sales_ach_pct || 0, 150),
      collAch: Math.min(collection?.coll_ach_pct || 0, 150)
    };
  });

  const option = {
    tooltip: {},
    legend: { bottom: 5, textStyle: { fontSize: 10 } },
    radar: {
      indicator: radarData.map(d => ({ name: d.region, max: 150 })),
      radius: '60%',
      axisName: { fontSize: 8 }
    },
    series: [{
      type: 'radar',
      data: [
        { value: radarData.map(d => d.salesAch), name: 'Sales Ach %', areaStyle: { opacity: 0.3 }, itemStyle: { color: '#5470c6' } },
        { value: radarData.map(d => d.collAch), name: 'Coll Ach %', areaStyle: { opacity: 0.2 }, itemStyle: { color: '#91cc75' } }
      ]
    }]
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-400 p-4 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1">
        <Layers className="w-3.5 h-3.5" />
        Regional Performance Radar
      </h3>
      <ReactECharts option={option} style={{ height: '280px' }} />
    </div>
  );
};

// Outstanding Analysis Chart
const OutstandingChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const chartData = data.map(item => ({
    name: item.area_name,
    outstanding: item.outstanding || 0
  })).sort((a, b) => b.outstanding - a.outstanding);

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (p) => `${p[0].name}: ${formatBDT(p[0].value)}`
    },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: chartData.map(d => d.name),
      axisLabel: { rotate: 45, fontSize: 9 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (v) => formatBDT(v), fontSize: 9 }
    },
    series: [{
      type: 'bar',
      data: chartData.map(d => ({
        value: d.outstanding,
        itemStyle: { color: d.outstanding > 0 ? '#ee6666' : '#91cc75' }
      }))
    }]
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-400 p-4 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1">
        <BDTIcon className="w-3.5 h-3.5" />
        Outstanding by Region
      </h3>
      <ReactECharts option={option} style={{ height: '280px' }} />
    </div>
  );
};

// Sales Trend Area Chart
const SalesTrendChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let result = params[0].name + '<br/>';
        params.forEach(p => {
          result += `${p.marker} ${p.seriesName}: ${formatBDT(p.value)}<br/>`;
        });
        return result;
      }
    },
    legend: { top: 5, textStyle: { fontSize: 10 } },
    grid: { left: '3%', right: '4%', bottom: '5%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLabel: { fontSize: 9 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (v) => formatBDT(v), fontSize: 9 }
    },
    series: [
      {
        name: 'Net Sales',
        type: 'line',
        data: data.map(d => d.sales),
        smooth: true,
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#5470c6' }
      },
      {
        name: 'Collection',
        type: 'line',
        data: data.map(d => d.collection),
        smooth: true,
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#91cc75' }
      }
    ]
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-400 p-4 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1">
        <BarChart3 className="w-3.5 h-3.5" />
        Sales & Collection Trend
      </h3>
      <ReactECharts option={option} style={{ height: '280px' }} />
    </div>
  );
};

// ============================================================================
// MAIN DASHBOARD PAGE (Combined Dashboard + Analytics)
// ============================================================================

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [collectionData, setCollectionData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [regions, setRegions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ month: 11, year: 2025, region: null, zone: null, quarter: null, category: null });

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiMonth = filters.month === 0 ? null : filters.month;
      
      const [summaryRes, salesRes, collectionRes, productRes, regionsRes, productsRes] = await Promise.all([
        getDashboardSummary(apiMonth || 11, filters.year),
        getSales(apiMonth, filters.year),
        getCollections(apiMonth, filters.year),
        getProductComparison(),
        getRegions(),
        getProducts()
      ]);
      
      setSummary(summaryRes);
      setSalesData(salesRes);
      setCollectionData(collectionRes);
      setProductData(productRes);
      setRegions(regionsRes);
      setProducts(productsRes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.month, filters.year]);

  // Apply client-side filters
  const filteredSalesData = useMemo(() => {
    let data = [...salesData];
    if (filters.zone && filters.zone !== 'All Zones') data = data.filter(d => d.zone === filters.zone);
    if (filters.region && filters.region !== 'all') {
      const regionId = parseInt(filters.region);
      data = data.filter(d => d.region_id === regionId);
    }
    if (filters.quarter && filters.quarter !== 'all') {
      const quarterMonths = { 1: [1,2,3], 2: [4,5,6], 3: [7,8,9], 4: [10,11,12] };
      const months = quarterMonths[filters.quarter] || [];
      if (months.length > 0 && data[0]?.month) data = data.filter(d => months.includes(d.month));
    }
    return data;
  }, [salesData, filters.zone, filters.region, filters.quarter]);

  const filteredCollectionData = useMemo(() => {
    let data = [...collectionData];
    if (filters.zone && filters.zone !== 'All Zones') data = data.filter(d => d.zone === filters.zone);
    if (filters.region && filters.region !== 'all') {
      const regionId = parseInt(filters.region);
      data = data.filter(d => d.region_id === regionId);
    }
    if (filters.quarter && filters.quarter !== 'all') {
      const quarterMonths = { 1: [1,2,3], 2: [4,5,6], 3: [7,8,9], 4: [10,11,12] };
      const months = quarterMonths[filters.quarter] || [];
      if (months.length > 0 && data[0]?.month) data = data.filter(d => months.includes(d.month));
    }
    return data;
  }, [collectionData, filters.zone, filters.region, filters.quarter]);

  const filteredProductData = useMemo(() => {
    let data = [...productData];
    if (filters.category && filters.category !== 'all') data = data.filter(d => d.product_category === filters.category);
    return data;
  }, [productData, filters.category]);

  // Aggregated metrics
  const aggregatedMetrics = useMemo(() => {
    const totalSales = filteredSalesData.reduce((sum, d) => sum + (d.net_sales || 0), 0);
    const totalTarget = filteredSalesData.reduce((sum, d) => sum + (d.sales_target || 0), 0);
    const totalCollection = filteredCollectionData.reduce((sum, d) => sum + (d.total_coll || 0), 0);
    const totalCollTarget = filteredCollectionData.reduce((sum, d) => sum + (d.coll_target || 0), 0);
    const totalOutstanding = filteredCollectionData.reduce((sum, d) => sum + (d.outstanding || 0), 0);
    return {
      totalSales, totalTarget, totalCollection, totalCollTarget, totalOutstanding,
      salesAchPct: totalTarget > 0 ? (totalSales / totalTarget * 100) : 0,
      collAchPct: totalCollTarget > 0 ? (totalCollection / totalCollTarget * 100) : 0
    };
  }, [filteredSalesData, filteredCollectionData]);

  // Trend data
  const trendData = useMemo(() => {
    return filteredSalesData.map(sale => {
      const coll = filteredCollectionData.find(c => c.region_id === sale.region_id);
      return { name: sale.area_name, sales: sale.net_sales || 0, collection: coll?.total_coll || 0 };
    });
  }, [filteredSalesData, filteredCollectionData]);

  const monthName = filters.month === 0 ? 'All Months' : (MONTHS.find(m => m.value === filters.month)?.label || 'All Months');
  const quarterName = filters.quarter ? `Q${filters.quarter}` : '';
  const zoneName = filters.zone && filters.zone !== 'All Zones' ? filters.zone : '';
  const filterSummary = [monthName, quarterName, zoneName, filters.year].filter(Boolean).join(' - ');

  if (loading) {
    return (
      <div className="space-y-4">
        <Header title="Loading Dashboard..." subtitle="Please wait" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Header 
        title="SUROVI AGRO Business Intelligence" 
        subtitle={`Sales & Collection Analysis - ${filterSummary}`}
      />
      
      <FilterBar 
        filters={filters} 
        setFilters={setFilters} 
        regions={regions}
        products={products}
        showAllFilters={true}
      />

      {/* Active Filters Display */}
      {(filters.zone || filters.region || filters.quarter || filters.category) && (
        <div className="flex flex-wrap items-center gap-1 text-[10px]">
          <span className="text-gray-500">Active:</span>
          {filters.zone && filters.zone !== 'All Zones' && (
            <span className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded text-[9px] font-medium">Zone: {filters.zone}</span>
          )}
          {filters.region && filters.region !== 'all' && (
            <span className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded text-[9px] font-medium">
              Region: {regions.find(r => r.region_id === parseInt(filters.region))?.area_name || filters.region}
            </span>
          )}
          {filters.quarter && filters.quarter !== 'all' && (
            <span className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded text-[9px] font-medium">Q{filters.quarter}</span>
          )}
          {filters.category && filters.category !== 'all' && (
            <span className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded text-[9px] font-medium">Cat: {filters.category}</span>
          )}
          <span className="text-gray-400 ml-1">
            ({filteredSalesData.length} regions, {filteredProductData.filter(p => p.value_2025 > 0).length} products)
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          title="Total Net Sales"
          value={formatBDT(aggregatedMetrics.totalSales)}
          subtitle={`Target: ${formatBDT(aggregatedMetrics.totalTarget)}`}
          icon={BDTIcon}
          trend={aggregatedMetrics.salesAchPct - 100}
          trendValue={aggregatedMetrics.salesAchPct}
        />
        <KPICard
          title="Total Collection"
          value={formatBDT(aggregatedMetrics.totalCollection)}
          subtitle={`Target: ${formatBDT(aggregatedMetrics.totalCollTarget)}`}
          icon={TrendingUp}
          trend={aggregatedMetrics.collAchPct - 100}
          trendValue={aggregatedMetrics.collAchPct}
        />
        <KPICard
          title="Outstanding"
          value={formatBDT(aggregatedMetrics.totalOutstanding)}
          subtitle="Sales - Collection"
          icon={Target}
        />
        <KPICard
          title="Active Products"
          value={filteredProductData.filter(p => p.value_2025 > 0).length}
          subtitle={`Total: ${productData.length} products`}
          icon={Package}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 text-white shadow-lg border border-gray-700">
          <p className="text-gray-400 text-xs font-medium uppercase">Sales Achievement</p>
          <p className="text-2xl font-bold mt-1">{aggregatedMetrics.salesAchPct.toFixed(1)}%</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-white shadow-lg border border-gray-700">
          <p className="text-gray-400 text-xs font-medium uppercase">Collection Achievement</p>
          <p className="text-2xl font-bold mt-1">{aggregatedMetrics.collAchPct.toFixed(1)}%</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-white shadow-lg border border-gray-700">
          <p className="text-gray-400 text-xs font-medium uppercase">Regions Analyzed</p>
          <p className="text-2xl font-bold mt-1">{filteredSalesData.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-white shadow-lg border border-gray-700">
          <p className="text-gray-400 text-xs font-medium uppercase">YoY Growth</p>
          <p className="text-2xl font-bold mt-1">{summary?.products?.overall_growth_pct?.toFixed(1) || 0}%</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SalesTargetChart data={filteredSalesData} />
        <CollectionPieChart data={filteredCollectionData} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AchievementChart salesData={filteredSalesData} collectionData={filteredCollectionData} />
        <ZonePerformanceChart data={filteredCollectionData} />
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RegionRadarChart salesData={filteredSalesData} collectionData={filteredCollectionData} />
        <OutstandingChart data={filteredCollectionData} />
      </div>

      {/* Charts Row 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProductPerformanceChart data={filteredProductData} />
        <ProductGrowthChart data={filteredProductData} />
      </div>

      {/* Area Trend Chart */}
      <SalesTrendChart data={trendData} />

      {/* Summary Table */}
      <div className="bg-white rounded-lg border-2 border-gray-400 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Regional Performance Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-white uppercase tracking-wide">Region</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-white uppercase tracking-wide">Zone</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-white uppercase tracking-wide">Target</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-white uppercase tracking-wide">Net Sales</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-white uppercase tracking-wide">Sales Ach%</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-white uppercase tracking-wide">Collection</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-white uppercase tracking-wide">Outstanding</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSalesData.map((sale, idx) => {
                const coll = filteredCollectionData.find(c => c.region_id === sale.region_id);
                return (
                  <tr key={idx} className={`hover:bg-blue-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-3 py-2.5 text-xs font-semibold text-gray-900">{sale.area_name}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-700">{sale.zone}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-900 text-right font-medium">{formatBDT(sale.sales_target)}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-900 text-right font-medium">{formatBDT(sale.net_sales)}</td>
                    <td className={`px-3 py-2.5 text-xs font-bold text-right ${sale.sales_ach_pct >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(sale.sales_ach_pct)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-900 text-right font-medium">{formatBDT(coll?.total_coll)}</td>
                    <td className={`px-3 py-2.5 text-xs font-bold text-right ${(coll?.outstanding || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {formatBDT(coll?.outstanding)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// REPORTS PAGE
// ============================================================================

const ReportsPage = () => {
  const [filters, setFilters] = useState({ month: 11, year: 2025, region: null });
  const [regions, setRegions] = useState([]);
  const monthName = MONTHS.find(m => m.value === filters.month)?.label;

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const data = await getRegions();
        setRegions(data);
      } catch (error) {
        console.error('Error fetching regions:', error);
      }
    };
    fetchRegions();
  }, []);

  return (
    <div className="space-y-4">
      <Header 
        title="Tabular Reports" 
        subtitle={`Detailed Data for ${monthName} ${filters.year}`}
      />
      
      <FilterBar filters={filters} setFilters={setFilters} regions={regions} showAllFilters={false} />
      
      <DataTable month={filters.month} year={filters.year} regionFilter={filters.region} />
    </div>
  );
};

// ============================================================================
// UPLOAD PAGE
// ============================================================================

const UploadPage = () => {
  const handleUploadSuccess = (result) => {
    console.log('Upload successful:', result);
  };

  return (
    <div className="space-y-4">
      <Header 
        title="Data Upload" 
        subtitle="Upload Excel files to update dashboard data"
      />
      
      <FileUpload onUploadSuccess={handleUploadSuccess} />
      
      <div className="bg-white rounded-lg border-2 border-gray-400 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-3">📁 Supported File Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h4 className="font-semibold text-gray-900 text-sm">📊 Sales & Collection File</h4>
            <p className="text-xs text-gray-700 mt-2">
              Contains region-wise sales targets, gross sales, returns, and collection data.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <h4 className="font-semibold text-gray-900 text-sm">📈 Product Comparison File</h4>
            <p className="text-xs text-gray-700 mt-2">
              Contains product-wise sales value and volume comparison between years.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// APP
// ============================================================================

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Use basename for /surovidash deployment
  const basename = import.meta.env.BASE_URL || '/';

  return (
    <Router basename={basename}>
      <div className="min-h-screen bg-gray-100">
        <Navigation isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="lg:ml-60 min-h-screen">
          <div className="p-3 lg:p-4 pt-12 lg:pt-4">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/upload" element={<UploadPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
