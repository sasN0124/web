import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { VideoCard } from "@/components/VideoCard";
import { PreviewDialog } from "@/components/PreviewDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { searchYouTube } from "@/lib/youtube";
import { addToPlaylist } from "@/lib/firebase";
import { usePlaylist } from "@/hooks/usePlaylist";
import { Search as SearchIcon, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [nextToken, setNextToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const { items: playlist } = usePlaylist();
  const playlistIds = new Set(playlist.map((v) => v.video_id));

  const doSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await searchYouTube(query.trim());
      setResults(data.items || []);
      setNextToken(data.nextPageToken || null);
    } catch (err) {
      const msg = err?.response?.data?.detail || "No se pudo buscar. Intenta de nuevo.";
      setError(msg);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!nextToken) return;
    setLoadingMore(true);
    try {
      const data = await searchYouTube(query.trim(), nextToken);
      setResults((prev) => [...prev, ...(data.items || [])]);
      setNextToken(data.nextPageToken || null);
    } catch (err) {
      toast.error("No se pudieron cargar más resultados");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleAdd = async (video) => {
    try {
      await addToPlaylist(video);
      toast.success("Añadido a la lista compartida", {
        description: video.title.slice(0, 60),
      });
    } catch (err) {
      toast.error("No se pudo añadir el video");
    }
  };

  return (
    <Layout>
      <section className="app-gradient border-b">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="flex items-center gap-2 text-accent">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-widest">
              Karaoke en tiempo real
            </span>
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Encuentra el video
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Busca en YouTube, añade a la lista compartida y prueba una vista previa rápida.
            Todos ven la lista actualizada al instante.
          </p>

          <form onSubmit={doSearch} className="mt-6 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ej: karaoke pop en español"
                className="h-11 pl-9"
                data-testid="youtube-search-input"
              />
            </div>
            <Button
              type="submit"
              className="h-11 gap-2 sm:w-40"
              disabled={loading}
              data-testid="youtube-search-submit-button"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchIcon className="h-4 w-4" />}
              Buscar
            </Button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-center" data-testid="search-error">
            <p className="text-sm text-red-200">{error}</p>
            <Button variant="secondary" className="mt-3" onClick={doSearch}>
              Reintentar
            </Button>
          </div>
        )}

        {!loading && !error && searched && results.length === 0 && (
          <div className="rounded-xl border bg-card p-10 text-center">
            <p className="font-display text-lg">Sin resultados</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Prueba con otras palabras, por ejemplo el nombre del artista o la canción.
            </p>
          </div>
        )}

        {!loading && !searched && (
          <div className="rounded-xl border bg-card p-10 text-center">
            <p className="font-display text-lg">Empieza a buscar</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Escribe el nombre de una canción o artista y presiona Buscar.
            </p>
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="search-results-grid">
              {results.map((v) => (
                <VideoCard
                  key={v.video_id}
                  video={v}
                  variant="search"
                  added={playlistIds.has(v.video_id)}
                  onAdd={handleAdd}
                  onPreview={setPreview}
                />
              ))}
            </div>
            {nextToken && (
              <div className="mt-8 flex justify-center">
                <Button variant="secondary" onClick={loadMore} disabled={loadingMore} className="gap-2">
                  {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                  Cargar más
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      <PreviewDialog video={preview} open={!!preview} onOpenChange={(o) => !o && setPreview(null)} />
    </Layout>
  );
}
