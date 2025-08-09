import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Branch = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  clinic_code: string;
  coordinates?: { lng: number; lat: number } | null;
};

const LOCAL_CACHE_PREFIX = "geocode:";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function readCache(key: string) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
    return parsed.value;
  } catch {
    return null;
  }
}

function writeCache(key: string, value: any) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({ timestamp: Date.now(), value })
    );
  } catch {}
}

export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchMapboxToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("mapbox-token", { body: {} });
      if (error) throw error;
      if (!data?.token) throw new Error("No token returned");
      setMapboxToken(data.token);
      return data.token as string;
    } catch (e: any) {
      // Silently fall back to dummy mode when token cannot be fetched
      return null;
    }
  };

  const geocode = async (address: string, token: string) => {
    const cacheKey = `${LOCAL_CACHE_PREFIX}${address}`;
    const cached = readCache(cacheKey);
    if (cached) return cached as { lng: number; lat: number };

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address
    )}.json?access_token=${token}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Geocoding failed");
    const json = await res.json();
    const feature = json.features?.[0];
    if (feature?.center?.length === 2) {
      const coords = { lng: feature.center[0], lat: feature.center[1] };
      writeCache(cacheKey, coords);
      return coords;
    }
    throw new Error("No results for address");
  };

  const loadBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = mapboxToken ?? (await fetchMapboxToken());
      const { data, error } = await supabase
        .from("tenants")
        .select("id,name,address,phone,email,clinic_code");
      if (error) throw error;

      const base: Branch[] = (data || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        address: t.address,
        phone: t.phone,
        email: t.email,
        clinic_code: t.clinic_code,
        coordinates: null,
      }));

      if (!token) {
        setBranches(base);
        setLoading(false);
        return;
      }

      const withCoords = await Promise.all(
        base.map(async (b) => {
          if (!b.address) return b;
          try {
            const coords = await geocode(b.address, token);
            return { ...b, coordinates: coords } as Branch;
          } catch {
            return b;
          }
        })
      );

      setBranches(withCoords);
    } catch (e: any) {
      setError(e.message || "Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
    // Realtime updates: refresh on tenant changes
    const channel = supabase
      .channel("tenants-live")
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tenants' },
        () => {
          loadBranches();
        }
      )
      .subscribe();
    channelRef.current = channel;

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { branches, loading, error, refresh: loadBranches, mapboxToken };
}
