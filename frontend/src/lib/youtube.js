import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export async function searchYouTube(query, pageToken) {
  const params = { q: query };
  if (pageToken) params.pageToken = pageToken;
  const res = await axios.get(`${API}/youtube/search`, { params });
  return res.data; // { items, nextPageToken }
}

// ----- YouTube IFrame Player API loader (loads once) -----
let ytApiPromise = null;
export function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.reject("no window");
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve) => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === "function") prev();
      resolve(window.YT);
    };
    document.body.appendChild(tag);
  });
  return ytApiPromise;
}
