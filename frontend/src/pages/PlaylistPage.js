import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { VideoCard } from "@/components/VideoCard";
import { PreviewDialog } from "@/components/PreviewDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { usePlaylist } from "@/hooks/usePlaylist";
import { removeFromPlaylist } from "@/lib/firebase";
import { ListMusic, Radio, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PlaylistPage() {
  const { items, loading } = usePlaylist();
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const handleRemove = async (video) => {
    try {
      await removeFromPlaylist(video.video_id);
      toast("Video eliminado de la lista");
    } catch (err) {
      toast.error("No se pudo eliminar el video");
    }
  };

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              <ListMusic className="h-7 w-7 text-primary" /> Lista compartida
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? "video" : "videos"} en la lista · se actualiza para todos en tiempo real.
            </p>
          </div>
          <Badge className="gap-1 bg-accent text-accent-foreground" data-testid="live-badge">
            <Radio className="h-3.5 w-3.5" /> EN VIVO
          </Badge>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando lista...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border bg-card p-10 text-center" data-testid="playlist-empty">
              <p className="font-display text-lg">Todavía no hay videos</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Vuelve a Buscar y añade el primero.
              </p>
              <Button className="mt-4" onClick={() => navigate("/")}>
                Ir a Buscar
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2" data-testid="shared-playlist-list">
              {items.map((v, i) => (
                <VideoCard
                  key={v.video_id}
                  video={v}
                  variant="playlist"
                  index={i}
                  onPreview={setPreview}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <PreviewDialog video={preview} open={!!preview} onOpenChange={(o) => !o && setPreview(null)} />
    </Layout>
  );
}
