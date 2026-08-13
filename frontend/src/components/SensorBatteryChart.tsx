import { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Battery, 
  BatteryWarning, 
  Zap, 
  Activity, 
  Info, 
  TrendingDown, 
  Clock, 
  Settings2 
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Device {
  id: string;
  name: string;
  type: string;
  icon: any;
  status: string;
  value: string;
  color: string;
  group: string;
  health: number;
  connectionStrength?: string;
  isWireless?: boolean;
  battery?: number;
  usagePattern?: string;
}

interface SensorBatteryChartProps {
  devices: Device[];
  simulatedScenario?: 'nominal' | 'arctic' | 'solar' | 'eco_sentry';
}

export default function SensorBatteryChart({ devices, simulatedScenario = 'nominal' }: SensorBatteryChartProps) {
  // Only track wireless devices that have batteries
  const wirelessSensors = useMemo(() => {
    return devices.filter(d => d.isWireless);
  }, [devices]);

  // Keep track of which wireless sensors are toggled visible in this chart
  const [visibleSensorIds, setVisibleSensorIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    devices.forEach(d => {
      if (d.isWireless) {
        initial[d.id] = true;
      }
    });
    return initial;
  });

  // Toggle helper
  const toggleSensorVisibility = (id: string) => {
    setVisibleSensorIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Scenario drain scaling factor
  const scenarioMultiplier = useMemo(() => {
    switch (simulatedScenario) {
      case 'arctic': return 1.55;
      case 'solar': return 2.4;
      case 'eco_sentry': return 0.65;
      case 'nominal':
      default: return 1.0;
    }
  }, [simulatedScenario]);

  // Generate 24 hours of battery data ending AT the current live battery level
  const chartData = useMemo(() => {
    const points = [];
    const now = new Date();

    // Generate points for the last 24 hours (index 0 is 24 hours ago, index 24 is Now)
    for (let h = 24; h >= 0; h--) {
      const time = new Date(now.getTime() - h * 60 * 60 * 1000);
      
      // Label like "14:00" or simple hours ago
      const hoursAgoLabel = h === 0 ? "Now" : `${h}h ago`;
      const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const point: any = {
        name: hoursAgoLabel,
        timeLabel: timeString,
        rawTime: time,
      };

      wirelessSensors.forEach(sensor => {
        // Find baseline hourly drain rate
        let baseDrain = 0.25; // 6% daily baseline
        if (sensor.type === 'camera') {
          baseDrain = 0.55; // 13.2% daily baseline for heavy feeds
        } else if (sensor.type === 'sensor') {
          baseDrain = 0.15; // 3.6% daily baseline for low frequency sensors
        } else if (sensor.type === 'audio') {
          baseDrain = 0.35; // 8.4% daily speaker drain
        }

        // Pattern multiplier
        let patternMultiplier = 1.0;
        if (sensor.usagePattern === 'eco') {
          patternMultiplier = 0.5;
        } else if (sensor.usagePattern === 'intensive') {
          patternMultiplier = 2.0;
        }

        const hourlyDrain = baseDrain * patternMultiplier * scenarioMultiplier;
        
        // Match live state
        const currentBattery = sensor.battery !== undefined ? sensor.battery : 75;
        
        // Calculate historical level h hours ago
        // If we go backwards, battery level was HIGHER
        const historicalLevel = Math.min(100, Math.max(0, currentBattery + h * hourlyDrain));
        
        point[sensor.id] = parseFloat(historicalLevel.toFixed(1));
      });

      points.push(point);
    }
    return points;
  }, [wirelessSensors, scenarioMultiplier]);

  // Compute drain metrics/analytics for summary cards
  const summaryMetrics = useMemo(() => {
    if (wirelessSensors.length === 0) return null;

    let totalBattery = 0;
    let minBattery = 100;
    let maxBattery = 0;
    let activeDischargeSum = 0;

    wirelessSensors.forEach(sensor => {
      const b = sensor.battery !== undefined ? sensor.battery : 75;
      totalBattery += b;
      if (b < minBattery) minBattery = b;
      if (b > maxBattery) maxBattery = b;

      // Estimate hourly discharge rate
      let baseDrain = 0.25;
      if (sensor.type === 'camera') baseDrain = 0.55;
      else if (sensor.type === 'sensor') baseDrain = 0.15;
      else if (sensor.type === 'audio') baseDrain = 0.35;

      let patternMultiplier = 1.0;
      if (sensor.usagePattern === 'eco') patternMultiplier = 0.5;
      else if (sensor.usagePattern === 'intensive') patternMultiplier = 2.0;

      activeDischargeSum += baseDrain * patternMultiplier * scenarioMultiplier;
    });

    const avgCurrentBattery = Math.round(totalBattery / wirelessSensors.length);
    const avgDischargePerHour = parseFloat((activeDischargeSum / wirelessSensors.length).toFixed(2));
    const estimatedSurvivalHours = avgDischargePerHour > 0 ? Math.round(avgCurrentBattery / avgDischargePerHour) : 999;

    return {
      avgCurrentBattery,
      minBattery,
      maxBattery,
      avgDischargePerHour,
      estimatedSurvivalHours
    };
  }, [wirelessSensors, scenarioMultiplier]);

  if (wirelessSensors.length === 0) {
    return (
      <div className="glass-panel p-6 border-white/5 text-center">
        <BatteryWarning className="w-8 h-8 text-amber-500 mx-auto mb-2 animate-pulse" />
        <h4 className="text-sm font-semibold text-white">No Wireless Sensors Active</h4>
        <p className="text-xs text-gray-400 mt-1">Deploy wireless cells or trigger a network handshake scan to display live battery tracking profiles.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 relative overflow-hidden flex flex-col justify-between border-white/5 bg-black/25">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FF9D]/5 blur-[70px] rounded-full pointer-events-none" />

      {/* Grid title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-white/5 pb-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest font-bold px-2 py-0.5 rounded bg-[#00FF9D]/10 text-[#00FF9D] border border-[#00FF9D]/15 uppercase flex items-center gap-1.5 w-fit">
            <Battery className="w-3.5 h-3.5" />
            Sensor Battery Telemetry Node
          </span>
          <h3 className="text-base font-bold text-white mt-1.5 font-sans tracking-tight">
            Wireless Battery Drain Profiles (Last 24h)
          </h3>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            Hourly discharge curves adjusted for custom environmental variables and active radio patterns.
          </p>
        </div>

        {/* Legend Filtering checkboxes */}
        <div className="flex flex-wrap items-center gap-2">
          {wirelessSensors.map(sensor => {
            const isVisible = visibleSensorIds[sensor.id] ?? false;
            return (
              <button
                key={sensor.id}
                onClick={() => toggleSensorVisibility(sensor.id)}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all text-[11px] font-mono cursor-pointer select-none",
                  isVisible 
                    ? "bg-white/5 border-white/10 text-white" 
                    : "border-transparent bg-transparent text-gray-500 hover:text-gray-400"
                )}
              >
                <span 
                  className={cn("w-2 h-2 rounded-full", isVisible ? "" : "opacity-30")} 
                  style={{ backgroundColor: sensor.color }}
                />
                <span className="truncate max-w-[120px]">{sensor.name}</span>
                <span className="text-[9px] font-bold text-gray-400 px-1 rounded bg-black/30">
                  {sensor.battery !== undefined ? `${sensor.battery}%` : 'N/A'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Analytics mini bento cards */}
      {summaryMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/30 border border-white/5 rounded-xl p-3">
            <div className="text-[9px] text-gray-500 font-mono tracking-wider">AVG BATTERY INDEX</div>
            <div className="text-lg font-bold font-mono text-white mt-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#00FF9D]" />
              {summaryMetrics.avgCurrentBattery}%
            </div>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-xl p-3">
            <div className="text-[9px] text-gray-500 font-mono tracking-wider">MIN OPERATING LEVEL</div>
            <div className="text-lg font-bold font-mono text-rose-400 mt-1 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              {summaryMetrics.minBattery}%
            </div>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-xl p-3">
            <div className="text-[9px] text-gray-500 font-mono tracking-wider">AVG ACCELERATED DRAIN</div>
            <div className="text-lg font-bold font-mono text-amber-400 mt-1">
              -{summaryMetrics.avgDischargePerHour}%<span className="text-[10px] font-normal text-gray-500 font-sans">/hr</span>
            </div>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-xl p-3">
            <div className="text-[9px] text-gray-500 font-mono tracking-wider">EST. TIME TO SHUTDOWN</div>
            <div className="text-lg font-bold font-mono text-sky-400 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              ~{summaryMetrics.estimatedSurvivalHours} hrs
            </div>
          </div>
        </div>
      )}

      {/* Main Line Chart */}
      <div className="w-full h-[320px] relative mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
            <XAxis 
              dataKey="name" 
              stroke="rgba(255, 255, 255, 0.4)" 
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace' }}
            />
            <YAxis 
              domain={[0, 100]} 
              stroke="rgba(255, 255, 255, 0.4)" 
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              tickFormatter={(val) => `${val}%`}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const exactTime = payload[0].payload.timeLabel;
                  return (
                    <div className="glass-panel p-3 border-white/10 shadow-2xl backdrop-blur-md rounded-xl text-xs space-y-1.5 w-52 pointer-events-none bg-black/85">
                      <div className="flex items-center gap-1.5 pb-1 border-b border-white/5 mb-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#00FF9D]" />
                        <span className="font-mono font-bold text-white/90">{label} ({exactTime})</span>
                      </div>
                      <div className="space-y-1">
                        {payload.map((entry: any, i: number) => (
                          <div key={i} className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                              <span className="truncate max-w-[110px]">{entry.name}</span>
                            </div>
                            <span className="font-mono text-white font-bold">{entry.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            {/* Draw lines for visible wireless sensors */}
            {wirelessSensors.map(sensor => {
              const isVisible = visibleSensorIds[sensor.id] ?? false;
              if (!isVisible) return null;

              return (
                <Line
                  key={sensor.id}
                  name={sensor.name}
                  type="monotone"
                  dataKey={sensor.id}
                  stroke={sensor.color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 1.5 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-3 bg-white/5 border border-white/5 rounded-xl flex items-start gap-2">
        <Info className="w-4 h-4 text-[#00FF9D] mt-0.5 shrink-0" />
        <p className="text-[10px] text-gray-400 leading-relaxed font-mono">
          <span className="font-bold text-white">Dynamic Battery Handshake Analytics: </span>
          The simulation runs at an adjusted rate based on scenario stressors. 
          Current extreme level: <span className="text-[#00FF9D] font-bold uppercase">{simulatedScenario} ({scenarioMultiplier}x Drain)</span>.
          Toggling sensor modes (Eco/Intensive) or shifting stress contexts directly aligns the live discharge path.
        </p>
      </div>
    </div>
  );
}
