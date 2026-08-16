import React, { useEffect, useRef, useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { VideoCard } from "@/components/VideoCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { usePlaylist } from "@/hooks/usePlaylist";
import { usePlayerState } from "@/hooks/usePlayerState";
import {
  writePlayerState,
  removeFromPlaylist,
} from "@/lib/firebase";
import { loadYouTubeApi } from "@/lib/youtube";
import { formatTime, decodeHtml } from "@/lib/format";
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ListMusic,
  MonitorPlay,
} from "lucide-react";
import { toast } from "sonner";

export default function PlayerPage() {
  const { items } = usePlaylist();
  const { state } = usePlayerState();

  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  const remoteRef = useRef(null);
  const itemsRef = useRef([]);
  const loadedVideoRef = useRef("");
  const applyingRemoteRef = useRef(false);
  const endedGuardRef = useRef(false);
  const errorCooldownRef = useRef(false);
  const failedRef = useRef(new Set());
  const volumeRef = useRef(80);
  const localMutedRef = useRef(false);

  const [localTime, setLocalTime] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [fullscreen, setFullscreen] = useState(false);
  const [localMuted, setLocalMuted] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);

  useEffect(() => {
    localMutedRef.current = localMuted;
  }, [localMuted]);

  // ---- Real browser Fullscreen API sync ----
  useEffect(() => {
    const onFsChange = () => {
      const fsEl =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;
      setFullscreen(!!fsEl);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    document.addEventListener("MSFullscreenChange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
      document.removeEventListener("MSFullscreenChange", onFsChange);
    };
  }, []);

  const requestFullscreen = () => {
    const el = containerRef.current;
    if (!el) {
      setFullscreen(true);
      return;
    }
    const req =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.msRequestFullscreen;
    if (req) {
      try {
        const p = req.call(el);
        if (p && p.catch) p.catch(() => setFullscreen(true));
      } catch (e) {
        setFullscreen(true);
      }
    } else {
      // fallback: CSS overlay
      setFullscreen(true);
    }
  };

  const exitFullscreen = () => {
    const fsEl =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement;
    if (fsEl) {
      const ex =
        document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.msExitFullscreen;
      try {
        ex.call(document);
      } catch (e) {}
    } else {
      setFullscreen(false);
    }
  };

  const toggleMuteLocal = () => {
    const yt = playerRef.current;
    const next = !localMuted;
    setLocalMuted(next);
    try {
      if (next) yt?.mute?.();
      else yt?.unMute?.();
    } catch (e) {}
  };

  useEffect(() => {
    remoteRef.current = state;
  }, [state]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const isPlaying = !!state?.is_playing;
  const currentId = state?.current_video_id || "";
  const currentItem = items.find((v) => v.video_id === currentId) || null;

  // ---- Build + push full state ----
  const buildBase = useCallback(() => {
    const yt = playerRef.current;
    let t = remoteRef.current?.current_time || 0;
    try {
      if (yt && yt.getCurrentTime) t = yt.getCurrentTime();
    } catch (e) {}
    return {
      current_video_id: loadedVideoRef.current || remoteRef.current?.current_video_id || "",
      is_playing: remoteRef.current?.is_playing || false,
      current_time: t,
      volume: volumeRef.current,
    };
  }, []);

  const push = useCallback(
    (partial) => {
      writePlayerState({ ...buildBase(), ...partial });
    },
    [buildBase]
  );

  // ---- Create YT player once ----
  useEffect(() => {
    let mounted = true;
    loadYouTubeApi().then((YT) => {
      if (!mounted || !YT) return;
      if (playerRef.current) return;
      playerRef.current = new YT.Player("yt-player", {
        width: "100%",
        height: "100%",
        playerVars: {
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: () => {
            setReady(true);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              handleEnded();
            }
          },
          onError: (event) => {
            // 2: invalid param, 5: HTML5 error, 100: removed, 101/150: embedding disabled
            handlePlayerError(event?.data);
          },
        },
      });
    });
    return () => {
      mounted = false;
      try {
        playerRef.current?.destroy?.();
      } catch (e) {}
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Auto next when a video ends ----
  const advance = useCallback(
    (removeCurrent) => {
      const list = itemsRef.current;
      const curId = loadedVideoRef.current;
      const idx = list.findIndex((v) => v.video_id === curId);
      const next = idx >= 0 ? list[idx + 1] : list[0];
      if (next) {
        push({ current_video_id: next.video_id, current_time: 0, is_playing: true });
      } else {
        push({ current_video_id: "", current_time: 0, is_playing: false });
        toast("Fin de la lista", { description: "No hay m\u00e1s videos en la cola." });
      }
      if (removeCurrent && curId) {
        setTimeout(() => removeFromPlaylist(curId), 1000);
      }
    },
    [push]
  );

  const handleEnded = useCallback(() => {
    if (endedGuardRef.current) return;
    endedGuardRef.current = true;
    advance(true);
    setTimeout(() => {
      endedGuardRef.current = false;
    }, 1500);
  }, [advance]);

  // ---- Handle unavailable / non-embeddable videos: skip WITHOUT deleting ----
  const handlePlayerError = useCallback((code) => {
    const badId = loadedVideoRef.current;
    if (!badId) return;
    if (errorCooldownRef.current) return;
    errorCooldownRef.current = true;
    setTimeout(() => {
      errorCooldownRef.current = false;
    }, 1500);

    setTimeout(() => {
      const yt = playerRef.current;
      // false alarm: the video actually started playing
      try {
        if (yt && yt.getCurrentTime && yt.getCurrentTime() > 0.5) return;
      } catch (e) {}
      // we already moved on
      if (loadedVideoRef.current !== badId) return;

      failedRef.current.add(badId);
      const list = itemsRef.current;
      const idx = list.findIndex((v) => v.video_id === badId);
      let next = null;
      for (let i = 1; i <= list.length; i++) {
        const cand = list[(idx + i) % list.length];
        if (cand && !failedRef.current.has(cand.video_id)) {
          next = cand;
          break;
        }
      }
      const badItem = list.find((v) => v.video_id === badId);
      if (next) {
        toast.error("Video no disponible", {
          description: badItem
            ? `${decodeHtml(badItem.title).slice(0, 45)} no permite reproducci\u00f3n. Pasando al siguiente.`
            : "Pasando al siguiente.",
        });
        push({ current_video_id: next.video_id, current_time: 0, is_playing: true });
      } else {
        toast.error("Sin videos reproducibles", {
          description: "Ninguno de los videos permite reproducci\u00f3n incrustada.",
        });
        push({ current_video_id: "", current_time: 0, is_playing: false });
      }
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push]);

  // ---- Apply remote state to local player ----
  useEffect(() => {
    if (!ready || !state) return;
    const yt = playerRef.current;
    if (!yt) return;
    applyingRemoteRef.current = true;

    if (Number.isFinite(state.volume)) {
      try {
        yt.setVolume(state.volume);
      } catch (e) {}
      volumeRef.current = state.volume;
      setVolume(state.volume);
    }

    // keep LOCAL mute independent of shared volume/state
    try {
      if (localMutedRef.current) yt.mute();
      else yt.unMute();
    } catch (e) {}

    const desired = state.current_video_id || "";

    if (desired && loadedVideoRef.current !== desired) {
      loadedVideoRef.current = desired;
      endedGuardRef.current = false;
      try {
        if (state.is_playing) yt.loadVideoById(desired, state.current_time || 0);
        else yt.cueVideoById(desired, state.current_time || 0);
      } catch (e) {}
    } else if (!desired) {
      loadedVideoRef.current = "";
      try {
        yt.stopVideo();
      } catch (e) {}
    } else {
      // same video already loaded -> reconcile seek + play/pause
      try {
        const t = yt.getCurrentTime ? yt.getCurrentTime() : 0;
        if (Math.abs(t - (state.current_time || 0)) > 2) {
          yt.seekTo(state.current_time || 0, true);
        }
      } catch (e) {}
      try {
        const ps = yt.getPlayerState ? yt.getPlayerState() : -1;
        if (state.is_playing && ps !== 1) yt.playVideo();
        if (!state.is_playing && ps === 1) yt.pauseVideo();
      } catch (e) {}
    }

    const to = setTimeout(() => {
      applyingRemoteRef.current = false;
    }, 500);
    return () => clearTimeout(to);
  }, [state, ready]);

  // ---- Local progress ticker (display only) ----
  useEffect(() => {
    const id = setInterval(() => {
      const yt = playerRef.current;
      if (!yt || !ready) return;
      try {
        const t = yt.getCurrentTime ? yt.getCurrentTime() : 0;
        const d = yt.getDuration ? yt.getDuration() : 0;
        setLocalTime(t);
        setLocalDuration(d);
        // a video that plays past 1s is definitely available
        if (t > 1 && loadedVideoRef.current) {
          failedRef.current.delete(loadedVideoRef.current);
        }
        // enforce local mute (survives new video loads)
        if (localMutedRef.current && yt.isMuted && !yt.isMuted()) {
          yt.mute();
        }
      } catch (e) {}
    }, 500);
    return () => clearInterval(id);
  }, [ready]);

  // ---- Periodic time sync so late joiners stay in sync ----
  useEffect(() => {
    const id = setInterval(() => {
      const yt = playerRef.current;
      if (!yt || !ready) return;
      if (applyingRemoteRef.current) return;
      if (!remoteRef.current?.is_playing) return;
      if (!loadedVideoRef.current) return;
      try {
        const ps = yt.getPlayerState ? yt.getPlayerState() : -1;
        if (ps !== 1) return;
        const t = yt.getCurrentTime ? yt.getCurrentTime() : 0;
        writePlayerState({
          current_video_id: loadedVideoRef.current,
          is_playing: true,
          current_time: t,
          volume: volumeRef.current,
        });
      } catch (e) {}
    }, 4000);
    return () => clearInterval(id);
  }, [ready]);

  // ---- Control handlers (actuate local player synchronously to keep the
  // user-gesture context so the browser allows playback with sound) ----
  const togglePlay = () => {
    const yt = playerRef.current;
    if (!loadedVideoRef.current && items.length > 0) {
      const first = items[0];
      failedRef.current.delete(first.video_id);
      loadedVideoRef.current = first.video_id;
      try {
        yt?.loadVideoById?.(first.video_id, 0);
      } catch (e) {}
      push({ current_video_id: first.video_id, current_time: 0, is_playing: true });
      return;
    }
    const nextPlaying = !isPlaying;
    try {
      if (nextPlaying) yt?.playVideo?.();
      else yt?.pauseVideo?.();
    } catch (e) {}
    push({ is_playing: nextPlaying });
  };

  const handleNext = () => {
    if (items.length === 0) return;
    advance(true);
  };

  const handleSeek = (vals) => {
    const v = Array.isArray(vals) ? vals[0] : vals;
    setLocalTime(v);
    const yt = playerRef.current;
    try {
      yt?.seekTo?.(v, true);
    } catch (e) {}
    push({ current_time: v });
  };

  const handleVolume = (vals) => {
    const v = Array.isArray(vals) ? vals[0] : vals;
    volumeRef.current = v;
    setVolume(v);
    const yt = playerRef.current;
    try {
      yt?.setVolume?.(v);
    } catch (e) {}
    push({ volume: v });
  };

  const playFromQueue = (video) => {
    failedRef.current.delete(video.video_id);
    const yt = playerRef.current;
    loadedVideoRef.current = video.video_id;
    try {
      yt?.loadVideoById?.(video.video_id, 0);
    } catch (e) {}
    push({ current_video_id: video.video_id, current_time: 0, is_playing: true });
    setQueueOpen(false);
  };

  const removeFromQueue = async (video) => {
    try {
      await removeFromPlaylist(video.video_id);
      toast("Video eliminado de la lista");
    } catch (e) {
      toast.error("No se pudo eliminar");
    }
  };

  const enterPlayer = () => {
    const yt = playerRef.current;
    if (!loadedVideoRef.current && !currentId && items.length > 0) {
      const first = items[0];
      loadedVideoRef.current = first.video_id;
      try {
        yt?.loadVideoById?.(first.video_id, 0);
      } catch (e) {}
      push({ current_video_id: first.video_id, current_time: 0, is_playing: true });
    } else if (loadedVideoRef.current) {
      try {
        yt?.playVideo?.();
      } catch (e) {}
      push({ is_playing: true });
    }
    requestFullscreen();
  };

  const QueueList = () => (
    <div className="space-y-3" data-testid="player-queue-list">
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          La lista est\u00e1 vac\u00eda. A\u00f1ade videos desde Buscar.
        </p>
      ) : (
        items.map((v, i) => (
          <VideoCard
            key={v.video_id}
            video={v}
            variant="queue"
            index={i}
            isPlaying={v.video_id === currentId}
            onPlay={playFromQueue}
            onRemove={removeFromQueue}
          />
        ))
      )}
    </div>
  );

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-6 pb-32 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              <MonitorPlay className="h-7 w-7 text-primary" /> Reproductor compartido
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sincronizado en tiempo real para todos los administradores conectados.
            </p>
          </div>
          <Button onClick={enterPlayer} className="gap-2" data-testid="player-enter-button">
            <Maximize className="h-4 w-4" /> Entrar al reproductor
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          {/* Video area */}
          <div>
            <div
              ref={containerRef}
              className={
                fullscreen
                  ? "fixed inset-0 z-[60] bg-black"
                  : "relative"
              }
            >
              <div
                className={
                  fullscreen
                    ? "yt-frame h-full w-full"
                    : "yt-frame aspect-video w-full overflow-hidden rounded-xl border bg-black"
                }
              >
                <div id="yt-player" />
              </div>

              {fullscreen ? (
                <div className="absolute left-4 top-4 z-[61] flex gap-2">
                  <Button
                    onClick={exitFullscreen}
                    className="gap-2"
                    variant="secondary"
                    data-testid="player-fullscreen-exit-button"
                  >
                    <Minimize className="h-4 w-4" /> Salir
                  </Button>
                  <Button
                    onClick={toggleMuteLocal}
                    size="icon"
                    variant="secondary"
                    aria-label={localMuted ? "Quitar silencio (local)" : "Silenciar (local)"}
                    data-testid="player-fullscreen-mute-button"
                  >
                    {localMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={requestFullscreen}
                  size="icon"
                  variant="secondary"
                  className="absolute right-3 top-3"
                  aria-label="Pantalla completa"
                  data-testid="player-fullscreen-enter-button"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              )}
            </div>

            {!fullscreen && (
              <div className="mt-4">
                {currentItem ? (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary text-primary-foreground">Reproduciendo</Badge>
                    <p className="line-clamp-1 text-sm font-medium">
                      {decodeHtml(currentItem.title)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nada en reproducci\u00f3n. Pulsa play o elige un video de la cola.
                  </p>
                )}

                {/* Mobile queue trigger */}
                <div className="mt-4 lg:hidden">
                  <Sheet open={queueOpen} onOpenChange={setQueueOpen}>
                    <SheetTrigger asChild>
                      <Button variant="secondary" className="w-full gap-2" data-testid="mobile-queue-button">
                        <ListMusic className="h-4 w-4" /> Ver cola ({items.length})
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[80vh]">
                      <SheetHeader>
                        <SheetTitle className="font-display">Cola compartida</SheetTitle>
                      </SheetHeader>
                      <ScrollArea className="mt-4 h-[calc(80vh-6rem)] pr-2">
                        <QueueList />
                      </ScrollArea>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            )}
          </div>

          {/* Queue (desktop) */}
          <aside className="hidden lg:block">
            <div className="rounded-xl border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-lg">
                  <ListMusic className="h-5 w-5 text-accent" /> Cola
                </h2>
                <Badge variant="secondary">{items.length}</Badge>
              </div>
              <ScrollArea className="h-[520px] pr-2">
                <QueueList />
              </ScrollArea>
            </div>
          </aside>
        </div>
      </section>

      {/* Fixed control bar (hidden in fullscreen) */}
      {!fullscreen && (
        <div
          className="fixed bottom-0 left-0 z-50 w-full border-t bg-background/90 backdrop-blur pb-[env(safe-area-inset-bottom)] supports-[backdrop-filter]:bg-background/70"
          data-testid="player-controls-bar"
        >
          <div className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pausar" : "Reproducir"}
                data-testid="player-controls-playpause-button"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={handleNext}
                aria-label="Siguiente"
                data-testid="player-controls-next-button"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden w-12 text-right font-mono text-xs tabular-nums text-muted-foreground sm:inline">
                {formatTime(localTime)}
              </span>
              <Slider
                min={0}
                max={localDuration || 100}
                step={1}
                value={[Math.min(localTime, localDuration || 100)]}
                onValueChange={handleSeek}
                className="flex-1"
                aria-label="Progreso"
                data-testid="player-controls-progress-slider"
              />
              <span className="w-12 font-mono text-xs tabular-nums text-muted-foreground">
                {formatTime(localDuration)}
              </span>
            </div>

            <div className="flex w-32 items-center gap-2 sm:w-48">
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleMuteLocal}
                aria-label={localMuted ? "Quitar silencio (local)" : "Silenciar (local)"}
                title={localMuted ? "Silenciado solo en tu dispositivo" : "Silenciar solo en tu dispositivo"}
                data-testid="player-controls-mute-button"
                className="shrink-0"
              >
                {localMuted || volume === 0 ? (
                  <VolumeX className={`h-4 w-4 ${localMuted ? "text-primary" : "text-muted-foreground"}`} />
                ) : (
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[volume]}
                onValueChange={handleVolume}
                aria-label="Volumen"
                data-testid="player-controls-volume-slider"
              />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
