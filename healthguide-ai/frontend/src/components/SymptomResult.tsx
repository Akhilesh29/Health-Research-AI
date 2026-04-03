import {
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Heart,
  Stethoscope,
  Shield,
  MapPin,
  Navigation,
  Phone,
  Mail,
  Globe,
} from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AIAnalysis } from '../types';
import { symptomsApi } from '../api/symptoms';

interface Props {
  analysis: AIAnalysis;
  symptoms: string[];
}

const urgencyConfig = {
  low: {
    label: 'Low Urgency',
    icon: CheckCircle,
    classes: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    iconClass: 'text-emerald-500',
    badgeClass: 'badge-low',
  },
  moderate: {
    label: 'Moderate Urgency',
    icon: Info,
    classes: 'bg-amber-50 border-amber-200 text-amber-800',
    iconClass: 'text-amber-500',
    badgeClass: 'badge-moderate',
  },
  high: {
    label: 'High Urgency',
    icon: AlertTriangle,
    classes: 'bg-orange-50 border-orange-200 text-orange-800',
    iconClass: 'text-orange-500',
    badgeClass: 'badge-high',
  },
  emergency: {
    label: '⚠️ Emergency',
    icon: Zap,
    classes: 'bg-red-50 border-red-300 text-red-900',
    iconClass: 'text-red-600',
    badgeClass: 'badge-emergency',
  },
};

const likelihoodColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

export default function SymptomResult({ analysis, symptoms }: Props) {
  const urgency = urgencyConfig[analysis.urgencyLevel] ?? urgencyConfig.low;
  const UrgencyIcon = urgency.icon;
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [locationMode, setLocationMode] = useState<'auto' | 'manual'>('auto');
  const [manualLocation, setManualLocation] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [selectedCareType, setSelectedCareType] = useState<'doctor' | 'hospital' | 'emergency' | 'auto'>(
    'auto'
  );

  const urgencyBasedCareType: 'doctor' | 'hospital' | 'emergency' =
    analysis.urgencyLevel === 'emergency' ? 'emergency' : analysis.urgencyLevel === 'high' ? 'hospital' : 'doctor';
  const careType = selectedCareType === 'auto' ? urgencyBasedCareType : selectedCareType;

  const nearbyQuery = useQuery({
    queryKey: ['nearby-care', coords?.lat, coords?.lng, careType],
    queryFn: () =>
      symptomsApi.nearbyCare({
        lat: coords!.lat,
        lng: coords!.lng,
        careType,
        radiusMeters: careType === 'doctor' ? 7000 : 12000,
      }),
    enabled: Boolean(coords),
    staleTime: 1000 * 60 * 5,
  });

  const requestLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setLocationError('Location permission denied. Enable location to find nearby care.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleManualLocationSearch = async () => {
    const query = manualLocation.trim();
    if (!query) {
      setLocationError('Please enter a location first.');
      return;
    }

    try {
      setManualLoading(true);
      setLocationError('');
      const endpoint = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
      const res = await fetch(endpoint, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Location search failed');
      }

      const data = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (!data.length) {
        setLocationError('No matching location found. Try city, area, or full address.');
        return;
      }

      setCoords({
        lat: Number(data[0].lat),
        lng: Number(data[0].lon),
      });
    } catch {
      setLocationError('Could not resolve this location right now. Please try again.');
    } finally {
      setManualLoading(false);
    }
  };

  const handleChangeLocation = () => {
    setCoords(null);
    setLocationError('');
  };

  const handleRefreshNearby = async () => {
    setLocationError('');
    if (locationMode === 'auto') {
      requestLocation();
      return;
    }
    await handleManualLocationSearch();
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Urgency banner */}
      <div className={`flex items-start gap-3 rounded-2xl border p-4 ${urgency.classes}`}>
        <UrgencyIcon size={20} className={`mt-0.5 flex-shrink-0 ${urgency.iconClass}`} />
        <div>
          <p className="font-semibold text-sm">{urgency.label}</p>
          <p className="text-sm mt-0.5 opacity-90">{analysis.urgencyExplanation}</p>
        </div>
      </div>

      {/* Symptoms reported */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Reported Symptoms
        </h3>
        <div className="flex flex-wrap gap-2">
          {symptoms.map((s) => (
            <span key={s} className="badge bg-gray-100 text-gray-700">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Stethoscope size={16} className="text-brand-500" />
          <h3 className="text-sm font-semibold text-gray-700">Analysis Summary</h3>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Possible conditions */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-brand-500" />
          <h3 className="text-sm font-semibold text-gray-700">Possible Conditions</h3>
        </div>
        <div className="space-y-3">
          {analysis.possibleConditions.map((c, i) => (
            <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
              <span className={`badge flex-shrink-0 mt-0.5 ${likelihoodColors[c.likelihood]}`}>
                {c.likelihood}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column: when to see doctor + self-care */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-gray-700">See a Doctor If…</h3>
          </div>
          <ul className="space-y-2">
            {analysis.whenToSeeDoctor.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Heart size={15} className="text-emerald-500" />
            <h3 className="text-sm font-semibold text-gray-700">Self-Care Tips</h3>
          </div>
          <ul className="space-y-2">
            {analysis.selfCareTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Recommendations</h3>
        <ul className="space-y-2">
          {analysis.recommendations.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <CheckCircle size={14} className="mt-0.5 text-brand-400 flex-shrink-0" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-semibold">Disclaimer: </span>
          {analysis.disclaimer}
        </p>
      </div>

      {/* Nearby care */}
      <div className="card p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-brand-500" />
            <h3 className="text-sm font-semibold text-gray-700">Nearby Care</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedCareType}
              onChange={(e) =>
                setSelectedCareType(e.target.value as 'doctor' | 'hospital' | 'emergency' | 'auto')
              }
              className="input !h-8 !py-1 !px-2 text-xs min-w-[180px] sm:min-w-0"
            >
              <option value="auto">Auto (from urgency)</option>
              <option value="doctor">Doctor/Clinic</option>
              <option value="hospital">Hospital</option>
              <option value="emergency">Emergency Hospital</option>
            </select>
            <span className="badge bg-gray-100 text-gray-700 capitalize">{careType}</span>
          </div>
        </div>

        {!coords ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <button
                type="button"
                onClick={() => setLocationMode('auto')}
                className={`text-xs rounded-md px-2 py-1 border ${locationMode === 'auto' ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600'}`}
              >
                Auto location
              </button>
              <button
                type="button"
                onClick={() => setLocationMode('manual')}
                className={`text-xs rounded-md px-2 py-1 border ${locationMode === 'manual' ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600'}`}
              >
                Manual location
              </button>
            </div>

            {locationMode === 'auto' ? (
              <>
                <p className="text-xs text-gray-500">
                  Use your location to find nearby {careType === 'doctor' ? 'doctors/clinics' : 'hospitals'}.
                </p>
                <button type="button" onClick={requestLocation} className="btn-secondary text-xs w-full sm:w-auto">
                  <Navigation size={14} />
                  Find nearby care
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">
                  Enter city/area/address to search nearby care for someone else.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    placeholder="e.g. Connaught Place, Delhi"
                    className="input !h-9 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleManualLocationSearch}
                    disabled={manualLoading}
                    className="btn-secondary text-xs w-full sm:w-auto"
                  >
                    {manualLoading ? 'Searching...' : 'Use location'}
                  </button>
                </div>
              </div>
            )}
            {locationError && <p className="text-xs text-red-500">{locationError}</p>}
          </div>
        ) : nearbyQuery.isLoading ? (
          <p className="text-xs text-gray-500">Loading nearby options...</p>
        ) : nearbyQuery.isError ? (
          <div className="space-y-2">
            <p className="text-xs text-red-500">Could not fetch nearby care right now.</p>
            <button type="button" onClick={() => nearbyQuery.refetch()} className="btn-secondary text-xs">
              Retry
            </button>
          </div>
        ) : nearbyQuery.data?.places?.length ? (
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
              <button type="button" onClick={handleChangeLocation} className="btn-ghost text-xs w-full sm:w-auto">
                Change location
              </button>
              <button
                type="button"
                onClick={handleRefreshNearby}
                disabled={manualLoading || nearbyQuery.isFetching}
                className="btn-secondary text-xs w-full sm:w-auto"
              >
                {manualLoading || nearbyQuery.isFetching ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            {nearbyQuery.data.places.slice(0, 5).map((p, idx) => (
              <div
                key={`${p.name}-${idx}`}
                className="rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
              >
                <a href={p.openInMapsUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {p.address ?? p.type} · {p.distanceKm} km
                    </p>
                  </div>
                  <span className="text-xs text-brand-600 font-semibold">Open map</span>
                </a>
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.phone && (
                    <a href={`tel:${p.phone}`} className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-white">
                      <Phone size={12} />
                      Call
                    </a>
                  )}
                  {p.email && (
                    <a href={`mailto:${p.email}`} className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-white">
                      <Mail size={12} />
                      Email
                    </a>
                  )}
                  {p.website && (
                    <a
                      href={p.website.startsWith('http') ? p.website : `https://${p.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-white"
                    >
                      <Globe size={12} />
                      Website
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No nearby results found for your current location.</p>
        )}
      </div>
    </div>
  );
}
