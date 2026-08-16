import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  onValue,
  set,
  remove,
} from "firebase/database";

// Firebase web config is safe to expose on the client (public by design).
const firebaseConfig = {
  apiKey: "AIzaSyCmxq-ybNvmdcyG3so5gZVPiexcZ2UUAD8",
  authDomain: "karaoke-9b318.firebaseapp.com",
  databaseURL: "https://karaoke-9b318-default-rtdb.firebaseio.com",
  projectId: "karaoke-9b318",
  storageBucket: "karaoke-9b318.firebasestorage.app",
  messagingSenderId: "657327287328",
  appId: "1:657327287328:web:869932c4618f244dada045",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// ----- Refs (global single room, per user's choice) -----
export const playlistRef = () => ref(db, "shared_playlist");
export const playlistItemRef = (videoId) => ref(db, `shared_playlist/${videoId}`);
export const playerStateRef = () => ref(db, "player_state");

// ----- Playlist ops -----
export async function addToPlaylist(video) {
  await set(playlistItemRef(video.video_id), {
    id: video.video_id,
    video_id: video.video_id,
    title: video.title || "",
    thumbnail: video.thumbnail || "",
    channel_title: video.channel_title || "",
    added_at: Date.now(),
  });
}

export async function removeFromPlaylist(videoId) {
  await remove(playlistItemRef(videoId));
}

// ----- Player state ops -----
// Always write ALL required children to satisfy Firebase validation rules.
export async function writePlayerState(state) {
  await set(playerStateRef(), {
    current_video_id: state.current_video_id ?? "",
    is_playing: !!state.is_playing,
    current_time: Number.isFinite(state.current_time) ? state.current_time : 0,
    volume: Number.isFinite(state.volume) ? state.volume : 80,
    updated_at: Date.now(),
  });
}

export { onValue };
