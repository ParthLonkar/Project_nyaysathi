const SOLVED_STATUS_SET = new Set([
  'resolved',
  'solve',
  'solved',
  'closed',
  'complete',
  'completed',
  'done',
  'disposed',
  'fixed',
  'success',
  'successful',
]);

// ~130m grid to preserve local density and reduce tiny GPS noise.
const GRID_SIZE_DEGREES = 0.0012;

const toCleanString = (value) => String(value || '').trim();

const normalizeStatus = (status) => {
  const raw = toCleanString(status).toLowerCase();
  if (!raw) return 'unknown';

  const compact = raw.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (SOLVED_STATUS_SET.has(compact)) return 'resolved';
  if (compact.includes('resolve') || compact.includes('close') || compact.includes('complete')) return 'resolved';
  return compact;
};

const parseCoordinates = (coordsLike) => {
  if (!coordsLike) return null;

  let raw = coordsLike;
  if (typeof coordsLike === 'string') {
    try {
      raw = JSON.parse(coordsLike);
    } catch (error) {
      return null;
    }
  }

  const lat = Number.parseFloat(raw?.lat);
  const lng = Number.parseFloat(raw?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  return {
    lat: Number(lat.toFixed(7)),
    lng: Number(lng.toFixed(7)),
  };
};

const getComplaintCoordinates = (complaint = {}) => parseCoordinates(
  complaint.location_coordinates || complaint?.ai_analysis?.input?.location_coordinates,
);

const getClosureTime = (complaint = {}) => complaint.closed_at
  || complaint.resolved_at
  || complaint.updated_at
  || complaint.submitted_at
  || complaint.created_at
  || null;

const normalizeDepartment = (complaint = {}) => {
  const rawDepartment = complaint.department
    || complaint.routing_info?.departmentName
    || complaint.routing_info?.department_name
    || complaint.ai_analysis?.department
    || 'Unassigned';

  const department = toCleanString(rawDepartment);
  return department || 'Unassigned';
};

const toGridCell = (value) => Math.round(value / GRID_SIZE_DEGREES);

const clusterPoints = (points = [], statusType = 'unsolved') => {
  const bucket = new Map();

  points.forEach((point) => {
    const latCell = toGridCell(point.lat);
    const lngCell = toGridCell(point.lng);
    const key = `${latCell}:${lngCell}`;

    const existing = bucket.get(key);
    if (!existing) {
      bucket.set(key, {
        statusType,
        count: 1,
        latSum: point.lat,
        lngSum: point.lng,
      });
      return;
    }

    existing.count += 1;
    existing.latSum += point.lat;
    existing.lngSum += point.lng;
  });

  const clusters = [...bucket.values()].map((entry) => ({
    statusType: entry.statusType,
    count: entry.count,
    lat: Number((entry.latSum / entry.count).toFixed(7)),
    lng: Number((entry.lngSum / entry.count).toFixed(7)),
  }));

  const maxCount = clusters.reduce((max, item) => Math.max(max, item.count), 0) || 1;

  return clusters
    .map((item) => ({
      ...item,
      intensity: Number((item.count / maxCount).toFixed(4)),
    }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      if (a.lat !== b.lat) return a.lat - b.lat;
      return a.lng - b.lng;
    });
};

export const buildCivicResolutionInsights = (complaints = []) => {
  const normalizedCases = (Array.isArray(complaints) ? complaints : []).map((complaint) => {
    const normalizedStatus = normalizeStatus(complaint?.status);
    const statusType = normalizedStatus === 'resolved' ? 'solved' : 'unsolved';
    const coords = getComplaintCoordinates(complaint);

    return {
      ...complaint,
      normalizedStatus,
      statusType,
      coords,
      normalizedDepartment: normalizeDepartment(complaint),
      closedAt: getClosureTime(complaint),
    };
  });

  const solvedCases = normalizedCases.filter((item) => item.statusType === 'solved');
  const unsolvedCases = normalizedCases.filter((item) => item.statusType === 'unsolved');

  const solvedPoints = solvedCases.filter((item) => item.coords).map((item) => item.coords);
  const unsolvedPoints = unsolvedCases.filter((item) => item.coords).map((item) => item.coords);

  const solvedClusters = clusterPoints(solvedPoints, 'solved');
  const unsolvedClusters = clusterPoints(unsolvedPoints, 'unsolved');

  const solvedHeatPoints = solvedClusters.map((item) => [item.lat, item.lng, item.intensity]);
  const unsolvedHeatPoints = unsolvedClusters.map((item) => [item.lat, item.lng, item.intensity]);

  const departmentCounts = new Map();
  solvedCases.forEach((item) => {
    departmentCounts.set(item.normalizedDepartment, (departmentCounts.get(item.normalizedDepartment) || 0) + 1);
  });

  const mostActiveDepartment = [...departmentCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([department, count]) => ({ department, count }))[0] || null;

  const recentClosures = solvedCases
    .filter((item) => item.closedAt)
    .sort((a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime())
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      closedAt: item.closedAt,
      lat: item.coords?.lat ?? null,
      lng: item.coords?.lng ?? null,
      title: item.title || item.description || 'Closed complaint',
    }));

  return {
    totalSolvedCases: solvedCases.length,
    totalUnsolvedCases: unsolvedCases.length,
    plottedSolvedCases: solvedPoints.length,
    plottedUnsolvedCases: unsolvedPoints.length,
    solvedClusters,
    unsolvedClusters,
    solvedHeatPoints,
    unsolvedHeatPoints,
    clusterStats: {
      solved: solvedClusters.length,
      unsolved: unsolvedClusters.length,
    },
    mostActiveDepartment,
    recentClosures,
    missingCoordinateCount: normalizedCases.filter((item) => !item.coords).length,
  };
};
