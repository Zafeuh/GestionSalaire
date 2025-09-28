import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const CustomTooltip = ({ active, payload, label, valuePrefix = '', valueSuffix = '' }) => {
  if (active && payload && payload.length) {
    return (
      <Card className="shadow-lg border-none bg-white/90 backdrop-blur-sm">
        <CardContent className="p-2">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm text-muted-foreground">
                {entry.name}: {valuePrefix}{entry.value.toLocaleString()}{valueSuffix}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
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
  colors = ['#0ea5e9', '#ef4444', '#10b981'], 
  title, 
  valuePrefix = '', 
  valueSuffix = '',
  height = 300
}) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-500">Aucune donnée disponible</p>
          <p className="text-xs text-gray-400">Les données seront affichées ici une fois disponibles</p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
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
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={colors[0]} 
              strokeWidth={2.5}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4, stroke: 'white' }}
              activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
            />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
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
              cursor={{ fill: '#f8fafc' }}
            />
            <Bar 
              dataKey="value" 
              fill={colors[0]}
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
              label={({ name, value, percent }) => 
                `${name} (${valuePrefix}${value.toLocaleString()}${valueSuffix})`
              }
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip valuePrefix={valuePrefix} valueSuffix={valueSuffix} />} />
          </PieChart>
        );
      default:
        return <div className="text-muted-foreground">Type de graphique non supporté</div>;
    }
  };

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartComponent;
