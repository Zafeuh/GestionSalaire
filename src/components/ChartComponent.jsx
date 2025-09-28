import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const COLORS = [
  '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

const CustomTooltip = ({ active, payload, label, valuePrefix = '', valueSuffix = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }} 
            />
            <span className="text-sm text-gray-700">
              {entry.name}: <span className="font-medium">
                {valuePrefix}{typeof entry.value === 'number' ? entry.value.toLocaleString('fr-FR') : entry.value}{valueSuffix}
              </span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const formatLargeNumber = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toString();
};

const ChartComponent = ({ 
  type, 
  data, 
  colors = COLORS, 
  title, 
  valuePrefix = '', 
  valueSuffix = '',
  height = 350,
  showLegend = false,
  gradient = false
}) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card className="h-full">
        {title && (
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="h-[300px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Aucune donnée disponible</p>
              <p className="text-xs text-gray-400">Les données seront affichées ici une fois disponibles</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <defs>
              {gradient && (
                <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors[0]} stopOpacity={0.1}/>
                </linearGradient>
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeOpacity={0.6} />
            <XAxis 
              dataKey="name" 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b' }}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b' }}
              tickFormatter={(value) => {
                const formattedValue = formatLargeNumber(value);
                return `${valuePrefix}${formattedValue}${valueSuffix}`;
              }}
            />
            <Tooltip 
              content={<CustomTooltip valuePrefix={valuePrefix} valueSuffix={valueSuffix} />}
              cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
            />
            {showLegend && <Legend />}
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={colors[0]} 
              strokeWidth={3}
              dot={{ fill: colors[0], strokeWidth: 2, r: 5, stroke: 'white' }}
              activeDot={{ r: 7, stroke: 'white', strokeWidth: 3, fill: colors[0] }}
              fill={gradient ? "url(#colorLine)" : colors[0]}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colors[0]} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeOpacity={0.6} />
            <XAxis 
              dataKey="name" 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                const formattedValue = formatLargeNumber(value);
                return `${valuePrefix}${formattedValue}${valueSuffix}`;
              }}
            />
            <Tooltip 
              content={<CustomTooltip valuePrefix={valuePrefix} valueSuffix={valueSuffix} />}
              cursor={{ stroke: '#e2e8f0' }}
            />
            {showLegend && <Legend />}
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={colors[0]} 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorArea)"
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            <defs>
              {data.map((_, index) => (
                <linearGradient key={index} id={`colorBar${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.9}/>
                  <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.6}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} strokeOpacity={0.6} />
            <XAxis 
              dataKey="name" 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b' }}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b' }}
              tickFormatter={(value) => {
                const formattedValue = formatLargeNumber(value);
                return `${valuePrefix}${formattedValue}${valueSuffix}`;
              }}
            />
            <Tooltip 
              content={<CustomTooltip valuePrefix={valuePrefix} valueSuffix={valueSuffix} />}
              cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
            />
            {showLegend && <Legend />}
            <Bar 
              dataKey="value" 
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={gradient ? `url(#colorBar${index})` : colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <defs>
              {data.map((_, index) => (
                <linearGradient key={index} id={`colorPie${index}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={0.9}/>
                  <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0.6}/>
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={40}
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              label={({ name, value, percent }) => 
                `${name}: ${(percent * 100).toFixed(1)}%`
              }
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={gradient ? `url(#colorPie${index})` : colors[index % colors.length]}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip valuePrefix={valuePrefix} valueSuffix={valueSuffix} />} />
            {showLegend && <Legend />}
          </PieChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            Type de graphique non supporté: {type}
          </div>
        );
    }
  };

  return (
    <Card className="h-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      {title && (
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-sky-500 to-sky-600 rounded-full"></div>
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="pt-0">
        <div style={{ height: `${height}px` }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartComponent;