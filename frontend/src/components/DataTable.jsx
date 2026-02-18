import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Search, Download, FileText } from 'lucide-react';
import { getSales, getCollections } from '../services/api';

// Format number in BDT (Bangladeshi Taka) format
const formatBDT = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '৳ 0';
  return '৳ ' + Number(value).toLocaleString('en-BD');
};

const DataTable = ({ month = 11, year = 2025, regionFilter = null }) => {
  const [activeTab, setActiveTab] = useState('sales');
  const [salesData, setSalesData] = useState([]);
  const [collectionData, setCollectionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sales, collections] = await Promise.all([
          getSales(month, year),
          getCollections(month, year)
        ]);
        setSalesData(sales);
        setCollectionData(collections);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [month, year]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const filterData = (data) => {
    let filtered = data;
    
    // Apply region filter
    if (regionFilter) {
      filtered = filtered.filter(item => item.region_id === parseInt(regionFilter));
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.area_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.division?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getDisplayData = () => {
    const data = activeTab === 'sales' ? salesData : collectionData;
    return sortData(filterData(data));
  };

  // Export to CSV
  const exportToCSV = () => {
    const data = getDisplayData();
    if (data.length === 0) return;
    
    let headers, rows;
    if (activeTab === 'sales') {
      headers = ['Region', 'Division', 'Target', 'Gross Sales', 'Return', 'Net Sales', 'Achievement %'];
      rows = data.map(row => [
        row.area_name,
        row.division,
        row.sales_target,
        row.gross_sales,
        row.sales_return,
        row.net_sales,
        row.sales_ach_pct?.toFixed(1)
      ]);
    } else {
      headers = ['Region', 'Target', 'Total Collection', 'Achievement %', 'Cash', 'Credit', 'Seed'];
      rows = data.map(row => [
        row.area_name,
        row.coll_target,
        row.total_coll,
        row.coll_ach_pct?.toFixed(1),
        row.cash_coll,
        row.credit_coll,
        row.seed_coll
      ]);
    }
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTab}_report_${month}_${year}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const SortHeader = ({ label, sortKey }) => (
    <th
      onClick={() => handleSort(sortKey)}
      className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-gray-700"
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="w-4 h-4" />
      </div>
    </th>
  );

  // Calculate totals
  const calculateTotals = (data) => {
    if (activeTab === 'sales') {
      return {
        sales_target: data.reduce((sum, r) => sum + (r.sales_target || 0), 0),
        gross_sales: data.reduce((sum, r) => sum + (r.gross_sales || 0), 0),
        sales_return: data.reduce((sum, r) => sum + (r.sales_return || 0), 0),
        net_sales: data.reduce((sum, r) => sum + (r.net_sales || 0), 0)
      };
    } else {
      return {
        coll_target: data.reduce((sum, r) => sum + (r.coll_target || 0), 0),
        total_coll: data.reduce((sum, r) => sum + (r.total_coll || 0), 0),
        cash_coll: data.reduce((sum, r) => sum + (r.cash_coll || 0), 0),
        credit_coll: data.reduce((sum, r) => sum + (r.credit_coll || 0), 0),
        seed_coll: data.reduce((sum, r) => sum + (r.seed_coll || 0), 0)
      };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const displayData = getDisplayData();
  const totals = calculateTotals(displayData);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-gray-400">
      {/* Tabs & Search */}
      <div className="p-4 border-b-2 border-gray-300 flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              activeTab === 'sales'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Sales Data
          </button>
          <button
            onClick={() => setActiveTab('collection')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              activeTab === 'collection'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Collection Data
          </button>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            />
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm shadow-md"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {activeTab === 'sales' ? (
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-800">
              <tr>
                <SortHeader label="Region" sortKey="area_name" />
                <SortHeader label="Division" sortKey="division" />
                <SortHeader label="Target" sortKey="sales_target" />
                <SortHeader label="Gross Sales" sortKey="gross_sales" />
                <SortHeader label="Return" sortKey="sales_return" />
                <SortHeader label="Net Sales" sortKey="net_sales" />
                <SortHeader label="Ach. %" sortKey="sales_ach_pct" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayData.map((row, idx) => (
                <tr key={idx} className={`hover:bg-blue-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">{row.area_name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">{row.division}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900 font-medium">{formatBDT(row.sales_target)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900 font-medium">{formatBDT(row.gross_sales)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900 font-medium">{formatBDT(row.sales_return)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right font-bold text-gray-900">{formatBDT(row.net_sales)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <span className={`px-2 py-1 rounded text-sm font-bold ${
                      row.sales_ach_pct >= 100 ? 'bg-green-100 text-green-700' :
                      row.sales_ach_pct >= 80 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {row.sales_ach_pct?.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-blue-100 font-bold">
              <tr>
                <td className="px-4 py-3 whitespace-nowrap text-gray-900" colSpan="2">Total</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900">{formatBDT(totals.sales_target)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900">{formatBDT(totals.gross_sales)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900">{formatBDT(totals.sales_return)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900">{formatBDT(totals.net_sales)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <span className="px-2 py-1 rounded text-sm bg-blue-600 text-white font-bold">
                    {totals.sales_target > 0 ? ((totals.net_sales / totals.sales_target) * 100).toFixed(1) : 0}%
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-800">
              <tr>
                <SortHeader label="Region" sortKey="area_name" />
                <SortHeader label="Target" sortKey="coll_target" />
                <SortHeader label="Total Coll." sortKey="total_coll" />
                <SortHeader label="Coll. %" sortKey="coll_ach_pct" />
                <SortHeader label="Cash" sortKey="cash_coll" />
                <SortHeader label="Credit" sortKey="credit_coll" />
                <SortHeader label="Seed" sortKey="seed_coll" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayData.map((row, idx) => (
                <tr key={idx} className={`hover:bg-green-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">{row.area_name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900 font-medium">{formatBDT(row.coll_target)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right font-bold text-gray-900">{formatBDT(row.total_coll)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <span className={`px-2 py-1 rounded text-sm font-bold ${
                      row.coll_ach_pct >= 100 ? 'bg-green-100 text-green-700' :
                      row.coll_ach_pct >= 80 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {row.coll_ach_pct?.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900 font-medium">{formatBDT(row.cash_coll)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900 font-medium">{formatBDT(row.credit_coll)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900 font-medium">{formatBDT(row.seed_coll)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-green-100 font-bold">
              <tr>
                <td className="px-4 py-3 whitespace-nowrap text-gray-900">Total</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900">{formatBDT(totals.coll_target)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900">{formatBDT(totals.total_coll)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <span className="px-2 py-1 rounded text-sm bg-green-600 text-white font-bold">
                    {totals.coll_target > 0 ? ((totals.total_coll / totals.coll_target) * 100).toFixed(1) : 0}%
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900">{formatBDT(totals.cash_coll)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900">{formatBDT(totals.credit_coll)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900">{formatBDT(totals.seed_coll)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-100 border-t-2 border-gray-300 flex justify-between items-center text-sm text-gray-700 font-medium">
        <span>Showing {displayData.length} of {activeTab === 'sales' ? salesData.length : collectionData.length} records</span>
        <span className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          {activeTab === 'sales' ? 'Sales' : 'Collection'} Report - {month}/{year}
        </span>
      </div>
    </div>
  );
};

export default DataTable;
