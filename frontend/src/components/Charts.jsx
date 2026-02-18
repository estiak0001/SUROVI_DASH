import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { getSales, getCollections, getProductComparison } from '../services/api';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

// Format number in BDT (Bangladeshi Taka) format
const formatBDT = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '৳ 0';
  const num = Number(value);
  if (num >= 10000000) {
    return '৳ ' + (num / 10000000).toFixed(2) + ' Cr';
  } else if (num >= 100000) {
    return '৳ ' + (num / 100000).toFixed(2) + ' Lac';
  } else if (num >= 1000) {
    return '৳ ' + (num / 1000).toFixed(2) + ' K';
  }
  return '৳ ' + num.toLocaleString('en-BD');
};

const SalesChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const chartData = data.map(item => ({
    name: item.area_name,
    target: item.sales_target,
    actual: item.net_sales,
    achievement: item.sales_ach_pct
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales by Region</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
          <YAxis tickFormatter={(value) => formatBDT(value)} />
          <Tooltip formatter={(value) => formatBDT(value)} />
          <Legend />
          <Bar dataKey="target" fill="#94A3B8" name="Target" />
          <Bar dataKey="actual" fill="#3B82F6" name="Net Sales" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Collection Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatBDT(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const ProductGrowthChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Get top 10 products by value
  const top10 = [...data]
    .filter(p => p.value_2025 > 0)
    .sort((a, b) => b.value_2025 - a.value_2025)
    .slice(0, 10)
    .map(item => ({
      name: item.product_name.length > 12 ? item.product_name.substring(0, 12) + '...' : item.product_name,
      value_2024: item.value_2024,
      value_2025: item.value_2025,
      growth: item.value_growth_pct
    }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 10 Products by Value</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={top10} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={(value) => formatBDT(value)} />
          <YAxis dataKey="name" type="category" width={100} fontSize={11} />
          <Tooltip formatter={(value) => formatBDT(value)} />
          <Legend />
          <Bar dataKey="value_2024" fill="#94A3B8" name="2024" />
          <Bar dataKey="value_2025" fill="#10B981" name="2025" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const AchievementChart = ({ salesData, collectionData }) => {
  if (!salesData || salesData.length === 0) return null;

  const chartData = salesData.map(sale => {
    const collection = collectionData?.find(c => c.region_id === sale.region_id);
    return {
      name: sale.area_name,
      sales_ach: sale.sales_ach_pct,
      coll_ach: collection?.coll_ach_pct || 0
    };
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Achievement % by Region</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="sales_ach" stroke="#3B82F6" name="Sales %" strokeWidth={2} />
          <Line type="monotone" dataKey="coll_ach" stroke="#10B981" name="Collection %" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const Charts = ({ month = 11, year = 2025, compact = false }) => {
  const [salesData, setSalesData] = useState([]);
  const [collectionData, setCollectionData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sales, collections, products] = await Promise.all([
          getSales(month, year),
          getCollections(month, year),
          getProductComparison()
        ]);
        setSalesData(sales);
        setCollectionData(collections);
        setProductData(products);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [month, year]);

  if (loading) {
    return (
      <div className={`grid grid-cols-1 ${compact ? '' : 'lg:grid-cols-2'} gap-6`}>
        {[...Array(compact ? 2 : 4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 h-80 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // Compact mode: show only Sales and Collection charts
  if (compact) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={salesData} />
        <AchievementChart salesData={salesData} collectionData={collectionData} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SalesChart data={salesData} />
      <CollectionPieChart data={collectionData} />
      <ProductGrowthChart data={productData} />
      <AchievementChart salesData={salesData} collectionData={collectionData} />
    </div>
  );
};

export default Charts;
