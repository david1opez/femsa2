"use client"
import { useEffect, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

export default function HeatmapLayer({ heatmapData }: { heatmapData: { lat: number; lng: number; weight: number; }[] }) {
  const map = useMap();
  const visualizationLibrary = useMapsLibrary('visualization');
  const [zoom, setZoom] = useState<number | null>(null);

  useEffect(() => {
    if (!map) return;

    const listener = map.addListener('zoom_changed', () => {
      const zoomValue = map.getZoom();

      setZoom(typeof zoomValue === 'number' ? zoomValue : null);
    });

    const zoomValue = map.getZoom();

    setZoom(typeof zoomValue === 'number' ? zoomValue : null);
    return () => {
      if (listener) listener.remove();
    };
  }, [map]);

  useEffect(() => {
    if (!visualizationLibrary || !map || zoom === null) {
      console.error('Google Maps visualization library, map instance, or zoom not available.');
      return;
    }

    const scale = Math.min(Math.max(zoom*0.6, 0), 15) / 15;

    const adjustedData = heatmapData.map(point => ({
      location: new google.maps.LatLng(point.lat, point.lng),
      weight: 100-point.weight,
    }));

    const heatmap = new visualizationLibrary.HeatmapLayer({
      data: adjustedData,
      radius: 40 * scale,
      opacity: 0.8,
      maxIntensity: 100,
      dissipating: true,
      gradient: [
      "rgba(255,0,0,0)",      // transparent red (start)
      "rgba(255,255,0,1)",     // yellow (end)
      "rgba(255,165,0,1)",    // orange
      "rgba(255,0,0,1)",      // red
      ]
    });

    heatmap.setMap(map);

    return () => {
      heatmap.setMap(null);
    };
  }, [visualizationLibrary, map, heatmapData, zoom]);

  return null;
}
