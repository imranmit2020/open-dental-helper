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
        const content = document.createElement('div');
        const h3 = document.createElement('h3');
        h3.style.fontWeight = '600';
        h3.style.marginBottom = '4px';
        h3.textContent = String(title || '');
        content.appendChild(h3);
        if (address) {
          const addr = document.createElement('div');
          addr.style.fontSize = '12px';
          addr.style.opacity = '0.8';
          addr.textContent = String(address);
          content.appendChild(addr);
        }
        const code = document.createElement('div');
        code.style.fontSize = '12px';
        code.style.marginTop = '6px';
        code.textContent = `Clinic code: ${String(clinic_code || '')}`;
        content.appendChild(code);
        if (phone) {
          const ph = document.createElement('div');
          ph.style.fontSize = '12px';
          ph.textContent = `Phone: ${String(phone)}`;
          content.appendChild(ph);
        }
        if (email) {
          const em = document.createElement('div');
          em.style.fontSize = '12px';
          em.textContent = `Email: ${String(email)}`;
          content.appendChild(em);
        }
        new mapboxgl.Popup({ closeOnClick: true })
          .setLngLat(coordinates)
          .setDOMContent(content)
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

  if (error && mapboxToken) {
    return <div className="p-4 text-sm text-destructive">{error}</div>;
  }

  // Fallback: render a simple dummy map with sample markers when no Mapbox token
  if (!mapboxToken) {
    const markers = [
      { name: "Default Clinic", status: "above" as const, top: "32%", left: "26%" },
      { name: "Downtown Dental", status: "risk" as const, top: "48%", left: "62%" },
      { name: "Smile Care East", status: "attention" as const, top: "68%", left: "36%" },
      { name: "Northside Ortho", status: "above" as const, top: "22%", left: "72%" },
    ];

    const statusClass = (s: "above" | "risk" | "attention") =>
      s === "above" ? "bg-primary" : s === "risk" ? "bg-accent" : "bg-destructive";

    return (
      <div className="relative w-full h-full rounded-md border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background to-muted" />
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "linear-gradient(hsl(var(--muted-foreground)/0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--muted-foreground)/0.15) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

        {/* Sample markers */}
        {markers.map((m, i) => (
          <div
            key={i}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border border-background shadow ${statusClass(m.status)}`}
            style={{ top: m.top, left: m.left }}
            title={`${m.name}`}
          />
        ))}

        {/* Legend */}
        <div className="absolute bottom-2 left-2 rounded-md bg-background/85 backdrop-blur px-3 py-2 text-xs border flex gap-4">
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-primary border border-background" /> Above target</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-accent border border-background" /> At risk</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-destructive border border-background" /> Needs attention</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
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
