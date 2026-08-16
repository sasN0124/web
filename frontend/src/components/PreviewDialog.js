import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { decodeHtml } from "@/lib/format";

const PREVIEW_SECONDS = 15;

export const PreviewDialog = ({ video, open, onOpenChange }) => {
  const [remaining, setRemaining] = useState(PREVIEW_SECONDS);

  useEffect(() => {
    if (!open || !video) return;
    setRemaining(PREVIEW_SECONDS);
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const left = PREVIEW_SECONDS - elapsed;
      setRemaining(left > 0 ? left : 0);
      if (left <= 0) {
        clearInterval(tick);
        onOpenChange?.(false);
      }
    }, 250);
    return () => clearInterval(tick);
  }, [open, video, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[92vw] sm:max-w-2xl"
        data-testid="preview-dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3 pr-6 text-left">
            <span className="line-clamp-1 text-base">
              {video ? decodeHtml(video.title) : "Vista previa"}
            </span>
            <Badge variant="secondary" className="shrink-0 font-mono">
              {remaining}s
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="yt-frame aspect-video w-full overflow-hidden rounded-lg bg-black">
          {open && video && (
            <iframe
              title="preview"
              src={`https://www.youtube.com/embed/${video.video_id}?autoplay=1&rel=0&modestbranding=1`}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Vista previa local de {PREVIEW_SECONDS} segundos. No afecta al reproductor compartido.
        </p>
      </DialogContent>
    </Dialog>
  );
};
