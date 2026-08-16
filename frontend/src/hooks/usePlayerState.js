import { useEffect, useState } from "react";
import { playerStateRef, onValue } from "@/lib/firebase";

export function usePlayerState() {
  const [state, setState] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsub = onValue(playerStateRef(), (snap) => {
      setState(snap.val());
      setLoaded(true);
    });
    return () => unsub();
  }, []);

  return { state, loaded };
}
