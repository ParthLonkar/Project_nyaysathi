import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { complaintService } from '../services/complaint.service';
import { buildCivicResolutionInsights } from '../utils/solvedCasesMap';

const NAGPUR_CENTER = [21.1458, 79.0882];

const formatDate = (value) => {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const HeatLayer = React.memo(function HeatLayer({ points, options }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map) return undefined;

    const layer = L.heatLayer(points, options).addTo(map);
    layerRef.current = layer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map]);

  useEffect(() => {
    if (layerRef.current) {
      layerRef.current.setLatLngs(points);
    }
  }, [points]);

  return null;
});

export default function SolvedCasesMapSection() {
  const [rawComplaints, setRawComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadCases = async () => {
      try {
        setError('');
        const payload = await complaintService.getPublicSolvedCasesMapData();
        const complaints = Array.isArray(payload?.complaints) ? payload.complaints : [];
        if (mounted) setRawComplaints(complaints);
      } catch (err) {
        if (mounted) {
          setRawComplaints([]);
          setError('Live complaint heat data is temporarily unavailable.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCases();
    return () => {
      mounted = false;
    };
  }, []);

  const insights = useMemo(() => buildCivicResolutionInsights(rawComplaints), [rawComplaints]);

  const solvedHeatPoints = useMemo(() => insights.solvedHeatPoints, [insights.solvedHeatPoints]);
  const unsolvedHeatPoints = useMemo(() => insights.unsolvedHeatPoints, [insights.unsolvedHeatPoints]);

  const solvedHeatOptions = useMemo(() => ({
    radius: 24,
    blur: 26,
    maxZoom: 18,
    minOpacity: 0.24,
    gradient: {
      0.2: '#34d399',
      0.5: '#10b981',
      1.0: '#065f46',
    },
  }), []);

  const unsolvedHeatOptions = useMemo(() => ({
    radius: 24,
    blur: 26,
    maxZoom: 18,
    minOpacity: 0.28,
    gradient: {
      0.2: '#fca5a5',
      0.5: '#ef4444',
      1.0: '#991b1b',
    },
  }), []);

  const hasAnyHeatPoints = solvedHeatPoints.length > 0 || unsolvedHeatPoints.length > 0;

  return (
    <section className="relative py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -top-20 -left-20 h-72 w-72 bg-red-500/30 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 bg-emerald-500/30 blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <p className="inline-flex items-center px-4 py-1 rounded-full bg-white/10 text-cyan-100 text-xs font-bold tracking-[0.2em] uppercase">
              Geo-Bound Interactive Heatmap
            </p>
            <h2 className="mt-4 text-3xl lg:text-5xl font-black text-white tracking-tight">
              Solved Cases Map / Civic Resolution Heatmap
            </h2>
            <p className="mt-3 text-slate-200 max-w-3xl">
              Fully interactive map with complaint hotspots rendered as geographic heat layers bound to exact latitude/longitude coordinates.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 min-w-[280px]">
            <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-300">Solved cases</p>
              <p className="text-3xl font-black text-emerald-300 mt-2">{insights.totalSolvedCases}</p>
              <p className="text-[11px] text-slate-300 mt-1">Plotted: {insights.plottedSolvedCases}</p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-300">Unsolved cases</p>
              <p className="text-3xl font-black text-red-300 mt-2">{insights.totalUnsolvedCases}</p>
              <p className="text-[11px] text-slate-300 mt-1">Plotted: {insights.plottedUnsolvedCases}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-amber-400/40 bg-amber-500/15 px-4 py-3 text-amber-100 text-sm">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-white/15 bg-slate-900/70 p-4 sm:p-5 shadow-2xl">
              <div className="relative rounded-2xl overflow-hidden border border-white/10">
                <MapContainer
                  center={NAGPUR_CENTER}
                  zoom={12}
                  minZoom={10}
                  maxZoom={18}
                  scrollWheelZoom
                  dragging
                  zoomControl
                  className="w-full h-[420px] sm:h-[500px]"
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <HeatLayer points={unsolvedHeatPoints} options={unsolvedHeatOptions} />
                  <HeatLayer points={solvedHeatPoints} options={solvedHeatOptions} />

                  {insights.unsolvedClusters.slice(0, 12).map((cluster) => (
                    <CircleMarker
                      key={`u-${cluster.lat}-${cluster.lng}-${cluster.count}`}
                      center={[cluster.lat, cluster.lng]}
                      radius={Math.min(18, 5 + cluster.count)}
                      pathOptions={{ color: '#ef4444', weight: 1.5, fillColor: '#ef4444', fillOpacity: 0.35 }}
                    >
                      <Popup>Unsolved cluster: {cluster.count} complaint(s)</Popup>
                    </CircleMarker>
                  ))}

                  {insights.solvedClusters.slice(0, 12).map((cluster) => (
                    <CircleMarker
                      key={`s-${cluster.lat}-${cluster.lng}-${cluster.count}`}
                      center={[cluster.lat, cluster.lng]}
                      radius={Math.min(18, 5 + cluster.count)}
                      pathOptions={{ color: '#10b981', weight: 1.5, fillColor: '#10b981', fillOpacity: 0.32 }}
                    >
                      <Popup>Solved cluster: {cluster.count} complaint(s)</Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>

                {!loading && !hasAnyHeatPoints && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/65 text-slate-200 text-sm text-center px-6">
                    Exact coordinate data is not available yet for map rendering.
                  </div>
                )}
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p className="text-xs text-slate-300 uppercase tracking-wide">Solved geo-clusters</p>
                  <p className="text-2xl font-black text-emerald-300 mt-1">{insights.clusterStats.solved}</p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p className="text-xs text-slate-300 uppercase tracking-wide">Unsolved geo-clusters</p>
                  <p className="text-2xl font-black text-red-300 mt-1">{insights.clusterStats.unsolved}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3 text-xs text-slate-200">
                <span className="font-semibold tracking-wide uppercase text-slate-300">Legend</span>
                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-500" />Unsolved heat layer</span>
                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Solved heat layer</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <h3 className="text-white font-bold text-lg">Most Active Department</h3>
              <p className="text-sm text-slate-100 mt-3">
                {insights.mostActiveDepartment?.department || 'No solved department activity yet'}
              </p>
              {insights.mostActiveDepartment && (
                <p className="text-xs text-emerald-200 mt-1">{insights.mostActiveDepartment.count} closures</p>
              )}
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <h3 className="text-white font-bold text-lg">Recent Closures</h3>
              <div className="mt-4 space-y-3">
                {insights.recentClosures.length > 0 ? insights.recentClosures.map((item) => (
                  <div key={item.id} className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <p className="text-xs text-emerald-200">Closed on {formatDate(item.closedAt)}</p>
                    <p className="text-xs text-slate-200 mt-1">
                      {item.lat !== null && item.lng !== null
                        ? `Lat ${item.lat.toFixed(5)}, Lng ${item.lng.toFixed(5)}`
                        : 'Coordinates unavailable'}
                    </p>
                  </div>
                )) : (
                  <p className="text-sm text-slate-300">Recent solved cases will appear here.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <h3 className="text-white font-bold text-lg">Coordinate Coverage</h3>
              <p className="text-sm text-slate-300 mt-2">
                {insights.missingCoordinateCount > 0
                  ? `${insights.missingCoordinateCount} case(s) do not have valid coordinates and were not plotted.`
                  : 'All fetched cases have valid coordinates and are geo-plotted.'}
              </p>
              {loading && <p className="text-xs text-slate-400 mt-2">Loading map data...</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
