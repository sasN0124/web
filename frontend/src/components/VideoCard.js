import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Check, Trash2, Play } from "lucide-react";
import { decodeHtml } from "@/lib/format";

export const VideoCard = ({
  video,
  onAdd,
  onPreview,
  onRemove,
  onPlay,
  added = false,
  variant = "search", // search | playlist | queue
  isPlaying = false,
  index,
}) => {
  const title = decodeHtml(video.title);
  const channel = decodeHtml(video.channel_title);

  return (
    <Card
      data-testid={`video-card-${video.video_id}`}
      className={`group overflow-hidden rounded-xl border bg-card/80 transition-shadow duration-200 hover:shadow-[0_18px_60px_-40px_rgba(45,212,191,0.55)] ${
        isPlaying ? "ring-1 ring-primary/70 bg-[rgba(255,122,89,0.08)]" : ""
      }`}
    >
      <div className="flex gap-3 p-3 sm:block sm:p-0">
        <div className="relative w-36 shrink-0 overflow-hidden rounded-lg sm:w-full sm:rounded-none">
          <div className="aspect-video w-full">
            <img
              src={video.thumbnail}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          {typeof index === "number" && (
            <span className="absolute left-2 top-2 rounded-md bg-background/80 px-2 py-0.5 font-mono text-xs">
              {index + 1}
            </span>
          )}
          {isPlaying && (
            <Badge className="absolute right-2 top-2 bg-primary text-primary-foreground">
              Reproduciendo
            </Badge>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between sm:p-3">
          <div className="min-w-0">
            <h3
              className="line-clamp-2 text-sm font-semibold leading-snug"
              title={title}
            >
              {title}
            </h3>
            <p className="mt-1 truncate text-xs text-muted-foreground">{channel}</p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {variant === "search" && (
              <>
                <Button
                  size="sm"
                  onClick={() => onAdd?.(video)}
                  disabled={added}
                  data-testid="search-result-add-to-playlist-button"
                  className="gap-1"
                >
                  {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {added ? "Añadido" : "Añadir"}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onPreview?.(video)}
                  data-testid="search-result-preview-button"
                  className="gap-1"
                >
                  <Eye className="h-4 w-4" /> Vista previa
                </Button>
              </>
            )}

            {variant === "playlist" && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onPreview?.(video)}
                  data-testid="shared-playlist-preview-button"
                  className="gap-1"
                >
                  <Eye className="h-4 w-4" /> Vista previa
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onRemove?.(video)}
                  data-testid="shared-playlist-remove-button"
                  className="gap-1"
                >
                  <Trash2 className="h-4 w-4" /> Eliminar
                </Button>
              </>
            )}

            {variant === "queue" && (
              <>
                <Button
                  size="sm"
                  onClick={() => onPlay?.(video)}
                  data-testid="player-queue-play-button"
                  className="gap-1"
                >
                  <Play className="h-4 w-4" /> Reproducir
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onRemove?.(video)}
                  data-testid="player-queue-remove-button"
                  className="gap-1"
                >
                  <Trash2 className="h-4 w-4" /> Eliminar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
