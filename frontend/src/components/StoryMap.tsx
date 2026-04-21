"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl, { type GeoJSONSource, type Map as MapboxMap } from "mapbox-gl";
import { demoArchive } from "@/lib/demo-data";
import { Pill } from "@/components/Pill";
import type { PublicStory } from "@/lib/types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const typeColorExpression = [
  "match",
  ["get", "type"],
  "craft",  "#c6653a",
  "ritual", "#4c7b73",
  "person", "#264653",
  "#b55d34",
] as mapboxgl.Expression;

// Preset regions for the region selector
const REGIONS = [
  { label: "All", center: [80, 30] as [number, number], zoom: 0.95 },
  { label: "Guizhou", center: [107.1, 27.0] as [number, number], zoom: 6.5 },
  { label: "Guangdong", center: [113.26, 23.13] as [number, number], zoom: 6.5 },
  { label: "New York", center: [-74.006, 40.713] as [number, number], zoom: 9 },
];

function buildGeoJson(stories: PublicStory[]) {
  return {
    type: "FeatureCollection" as const,
    features: stories.map((story) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [story.coordinates.x, story.coordinates.y],
      },
      properties: {
        id: story.id,
        memoryId: story.memoryId,
        title: story.title,
        summary: story.summary,
        region: story.region,
        dialect: story.dialect,
        type: story.type,
        sourceFamily: story.sourceFamily,
        tags: story.tags.join(" · "),
      },
    })),
  };
}

interface StoryMapProps {
  compact?: boolean;
  stories?: PublicStory[];
}

export function StoryMap({ compact = false, stories }: StoryMapProps) {
  const visibleStories = stories ?? demoArchive.publicStories;

  const mapRef = useRef<MapboxMap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState(visibleStories[0]?.id ?? "");
  const [loaded, setLoaded] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedStory = useMemo(
    () => visibleStories.find((s) => s.id === selectedId) ?? visibleStories[0],
    [selectedId, visibleStories],
  );

  // Keep selected id valid when stories filter changes
  useEffect(() => {
    if (visibleStories.length > 0 && !visibleStories.find((s) => s.id === selectedId)) {
      setSelectedId(visibleStories[0].id);
    }
  }, [visibleStories, selectedId]);

  // Update GeoJSON source when visible stories change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    const source = map.getSource("public-stories") as GeoJSONSource | undefined;
    if (source) {
      source.setData(buildGeoJson(visibleStories));
    }
  }, [visibleStories, loaded]);

  // Initialise map once
  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [80, 30],
      zoom: compact ? 0.65 : 0.95,
      attributionControl: false,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      map.addSource("public-stories", {
        type: "geojson",
        data: buildGeoJson(visibleStories),
        cluster: true,
        clusterMaxZoom: 10,
        clusterRadius: 40,
      });

      map.addLayer({
        id: "story-clusters",
        type: "circle",
        source: "public-stories",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#1f3a3d",
          "circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 25, 32],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#f7f3ea",
        },
      });

      map.addLayer({
        id: "story-cluster-count",
        type: "symbol",
        source: "public-stories",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 12,
        },
        paint: { "text-color": "#f7f3ea" },
      });

      map.addLayer({
        id: "story-points",
        type: "circle",
        source: "public-stories",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": typeColorExpression,
          "circle-radius": 9,
          "circle-stroke-width": 3,
          "circle-stroke-color": "#f7f3ea",
        },
      });

      map.on("click", "story-clusters", (event) => {
        const feature = map.queryRenderedFeatures(event.point, { layers: ["story-clusters"] })[0];
        if (!feature) return;
        const clusterId = feature.properties?.cluster_id;
        const source = map.getSource("public-stories") as GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (error, zoom) => {
          if (error || zoom == null || feature.geometry?.type !== "Point") return;
          map.easeTo({ center: feature.geometry.coordinates as [number, number], zoom, duration: 500 });
        });
      });

      map.on("click", "story-points", (event) => {
        const feature = event.features?.[0];
        if (!feature || feature.geometry.type !== "Point") return;
        setSelectedId(String(feature.properties?.id ?? ""));
        map.easeTo({ center: feature.geometry.coordinates as [number, number], zoom: Math.max(map.getZoom(), 4.5), duration: 600 });
      });

      for (const layer of ["story-clusters", "story-points"]) {
        map.on("mouseenter", layer, () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", layer, () => { map.getCanvas().style.cursor = ""; });
      }

      setLoaded(true);
    });

    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact]);

  // Pan to selected story
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded || !selectedStory) return;
    map.easeTo({ center: [selectedStory.coordinates.x, selectedStory.coordinates.y], zoom: Math.max(map.getZoom(), 4.5), duration: 500 });
  }, [loaded, selectedStory]);

  const handlePlay = (id: string) => {
    if (playingId === id) {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
      setPlayingId(null);
      return;
    }
    setPlayingId(id);
    playTimerRef.current = setTimeout(() => setPlayingId(null), 4000);
  };

  // ── No token fallback ────────────────────────────────────────────────────
  if (!MAPBOX_TOKEN) {
    return (
      <div className="glass-panel-strong overflow-hidden rounded-[32px] p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">Mapbox Required</p>
        <h3 className="mt-3 font-display text-3xl text-[var(--ink)]">
          Set `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` to render the live map.
        </h3>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {visibleStories.map((story) => (
            <Link key={story.id} href={`/memories/${story.memoryId}`} className="glass-chip rounded-[24px] p-4 transition hover:-translate-y-0.5">
              <div className="mb-3 flex items-center justify-between">
                <Pill tone="light">{story.region}</Pill>
                <Pill>{story.type}</Pill>
              </div>
              <h3 className="font-display text-2xl text-[var(--ink)]">{story.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      {/* Map */}
      <div className={`overflow-hidden rounded-[32px] border border-white/50 shadow-[0_24px_80px_rgba(38,70,83,0.16)] ${compact ? "min-h-[380px]" : "min-h-[560px]"}`}>
        <div ref={containerRef} className={`h-full w-full ${compact ? "min-h-[380px]" : "min-h-[560px]"}`} />
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-3">
        {/* Region selector */}
        {!compact && (
          <div className="glass-panel rounded-[24px] px-4 py-3 flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <button
                key={r.label}
                type="button"
                onClick={() => mapRef.current?.flyTo({ center: r.center, zoom: r.zoom, duration: 800 })}
                className="glass-chip rounded-full px-4 py-1.5 text-xs font-medium text-[var(--ink)] transition hover:bg-white/30"
              >
                {r.label}
              </button>
            ))}
          </div>
        )}

        {/* Story cards */}
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[520px] pr-0.5">
          {visibleStories.length === 0 ? (
            <div className="glass-panel rounded-[24px] p-6 text-center text-sm text-[var(--muted)]">
              No stories match the current filters.
            </div>
          ) : (
            visibleStories.map((story) => {
              const active = story.id === selectedStory?.id;
              const isPlaying = playingId === story.id;
              return (
                <div
                  key={story.id}
                  className={`rounded-[24px] border p-5 transition ${active ? "glass-panel-strong border-white/40 shadow-lg" : "glass-panel border-white/15"}`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <Pill tone="light">{story.region}</Pill>
                    <Pill>{story.type}</Pill>
                  </div>
                  <h3 className="font-display text-2xl text-[var(--ink)]">{story.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{story.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {story.tags.map((tag) => (
                      <Pill key={tag} tone="light">{tag}</Pill>
                    ))}
                  </div>

                  {/* Audio mock */}
                  {isPlaying && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-[var(--muted)]">
                      <div className="flex gap-0.5 items-end h-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="w-1 rounded-full bg-[var(--accent)]" style={{ height: `${8 + i * 2}px`, animation: "pulse 0.6s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <span>Playing...</span>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setSelectedId(story.id); }}
                        className="text-xs font-medium text-[var(--ink)]"
                      >
                        Focus map
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePlay(story.id)}
                        className={`text-xs font-medium ${isPlaying ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}
                      >
                        {isPlaying ? "⏹ Stop" : "▶ Play"}
                      </button>
                    </div>
                    <Link href={`/memories/${story.memoryId}`} className="text-xs font-medium text-[var(--accent)]">
                      View source memory
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
