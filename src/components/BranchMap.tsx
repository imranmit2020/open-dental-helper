import React, { useEffect, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useBranches } from "@/hooks/useBranches";

const BranchMap: React.FC = () => {
  const { branches, loading, error, mapboxToken } = useBranches();
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const geojson = useMemo(() => ({
    type: "FeatureCollection",
    features: branches
      .filter((b) => b.coordinates)
      .map((b) => ({
        type: "Feature",
        properties: {
          id: b.id,
          title: b.name,
          address: b.address || "",
          phone: b.phone || "",
          email: b.email || "",
          clinic_code: b.clinic_code,
        },
        geometry: {
          type: "Point",
          coordinates: [b.coordinates!.lng, b.coordinates!.lat],
        },
      })),
  }), [branches]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current || !mapboxToken) return;
    mapboxgl.accessToken = mapboxToken;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-98.5, 39.5],
      zoom: 3,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      map.addSource('branches', {
        type: 'geojson',
        data: geojson as any,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'branches',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#3b82f6',
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            18,
            10,
            22,
            25,
            28
          ],
          'circle-opacity': 0.85,
        }
      });

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'branches',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: { 'text-color': '#ffffff' }
      });

      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'branches',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#10b981',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties?.cluster_id;
        const source: any = map.getSource('branches');
        source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (err) return;
          map.easeTo({ center: (features[0].geometry as any).coordinates, zoom });
        });
      });

      map.on('click', 'unclustered-point', (e) => {
        const feature = e.features?.[0] as any;
        if (!feature) return;
        const { title, address, phone, email, clinic_code } = feature.properties;
        const coordinates = feature.geometry.coordinates.slice();
        new mapboxgl.Popup({ closeOnClick: true })
          .setLngLat(coordinates)
          .setHTML(`
            <div>
              <h3 style="font-weight:600;margin-bottom:4px">${title}</h3>
              ${address ? `<div style="font-size:12px;opacity:.8">${address}</div>` : ''}
              <div style="font-size:12px;margin-top:6px">Clinic code: ${clinic_code}</div>
              ${phone ? `<div style="font-size:12px">Phone: ${phone}</div>` : ''}
              ${email ? `<div style="font-size:12px">Email: ${email}</div>` : ''}
            </div>
          `)
          .addTo(map);
      });

      map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapboxToken]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const src = map.getSource('branches') as mapboxgl.GeoJSONSource | undefined;
    if (src) {
      (src as any).setData(geojson as any);
    }
  }, [geojson]);

  if (error) {
    return <div className="p-4 text-sm text-destructive">{error}</div>;
  }

  return (
    <div className="relative w-full h-full">
      {!mapboxToken && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          Loading map...
        </div>
      )}
      {loading && (
        <div className="absolute top-2 left-2 rounded-md bg-background/80 backdrop-blur px-2 py-1 text-xs border">
          Geocoding addresses...
        </div>
      )}
      <div ref={mapContainer} className="absolute inset-0 rounded-md" />
    </div>
  );
};

export default BranchMap;
