import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Package, CreditCard } from 'lucide-react';

// Format number in BDT (Bangladeshi Taka) format
const formatBDT = (value, showSymbol = true) => {
  if (value === null || value === undefined || isNaN(value)) return '৳ 0';
  
  const num = Number(value);
  
  // Format with Bangladeshi numbering system (lakhs, crores)
  const formatIndian = (n) => {
    const abs = Math.abs(n);
    if (abs >= 10000000) {
      return (n / 10000000).toFixed(2) + ' Cr';
    } else if (abs >= 100000) {
      return (n / 100000).toFixed(2) + ' Lac';
    } else if (abs >= 1000) {
      return (n / 1000).toFixed(2) + ' K';
    }
    return n.toLocaleString('en-BD');
  };
  
  return showSymbol ? '৳ ' + formatIndian(num) : formatIndian(num);
};

// Format number with full BDT format (no abbreviation)
const formatBDTFull = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '৳ 0';
  return '৳ ' + Number(value).toLocaleString('en-BD');
};

const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'blue', isCurrency = false }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    teal: 'bg-teal-500'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {isCurrency ? formatBDT(value) : (typeof value === 'number' ? value.toLocaleString() : value)}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center">
          {trend >= 0 ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`ml-1 text-sm font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(trend).toFixed(2)}%
          </span>
          <span className="ml-2 text-sm text-gray-500">{trendValue || 'vs target'}</span>
        </div>
      )}
    </div>
  );
};

const DashboardSummary = ({ summary }) => {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const { sales, collection, products } = summary;

  return (
    <div className="space-y-6">
      {/* Sales & Collection Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales Target"
          value={sales.total_sales_target}
          subtitle="November 2025"
          icon={DollarSign}
          color="blue"
          isCurrency={true}
        />
        <StatCard
          title="Net Sales"
          value={sales.total_net_sales}
          subtitle={`${sales.total_regions} Regions`}
          icon={TrendingUp}
          trend={sales.overall_achievement_pct - 100}
          trendValue="achievement"
          color="green"
          isCurrency={true}
        />
        <StatCard
          title="Total Collection"
          value={collection.total_collection}
          subtitle={`Target: ${formatBDT(collection.total_coll_target)}`}
          icon={CreditCard}
          trend={collection.overall_coll_ach_pct - 100}
          trendValue="achievement"
          color="purple"
          isCurrency={true}
        />
        <StatCard
          title="Products"
          value={products.total_products}
          subtitle={`Growth: ${products.overall_growth_pct.toFixed(1)}%`}
          icon={Package}
          trend={products.overall_growth_pct}
          trendValue="YoY"
          color="orange"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Achievement</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Target</span>
              <span className="font-medium">{formatBDTFull(sales.total_sales_target)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gross Sales</span>
              <span className="font-medium">{formatBDTFull(sales.total_gross_sales)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Net Sales</span>
              <span className="font-medium">{formatBDTFull(sales.total_net_sales)}</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Achievement</span>
                <span className={`font-bold text-lg ${sales.overall_achievement_pct >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                  {sales.overall_achievement_pct.toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${sales.overall_achievement_pct >= 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                  style={{ width: `${Math.min(sales.overall_achievement_pct, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Collection Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Cash Collection</span>
              <span className="font-medium">{formatBDTFull(collection.cash_collection)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Credit Collection</span>
              <span className="font-medium">{formatBDTFull(collection.credit_collection)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Seed Collection</span>
              <span className="font-medium">{formatBDTFull(collection.seed_collection)}</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Achievement</span>
                <span className={`font-bold text-lg ${collection.overall_coll_ach_pct >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                  {collection.overall_coll_ach_pct.toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${collection.overall_coll_ach_pct >= 100 ? 'bg-green-500' : 'bg-purple-500'}`}
                  style={{ width: `${Math.min(collection.overall_coll_ach_pct, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Products</span>
              <span className="font-medium">{products.total_products}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Value 2024</span>
              <span className="font-medium">{formatBDTFull(products.total_value_previous)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Value 2025</span>
              <span className="font-medium">{formatBDTFull(products.total_value_current)}</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">YoY Growth</span>
                <span className={`font-bold text-lg ${products.overall_growth_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {products.overall_growth_pct >= 0 ? '+' : ''}{products.overall_growth_pct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
