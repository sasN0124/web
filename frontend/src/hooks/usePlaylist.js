import { useEffect, useState } from "react";
import { playlistRef, onValue } from "@/lib/firebase";

export function usePlaylist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onValue(playlistRef(), (snap) => {
      const val = snap.val() || {};
      const arr = Object.values(val).sort(
        (a, b) => (a.added_at || 0) - (b.added_at || 0)
      );
      setItems(arr);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { items, loading };
}
