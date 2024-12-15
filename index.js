// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCUzcdMv2b5GfEgt7ywmLAn-tZbaC1fuzM",
    authDomain: "karaoke-7e2d8.firebaseapp.com",
    projectId: "karaoke-7e2d8",
    storageBucket: "karaoke-7e2d8.firebasestorage.app",
    messagingSenderId: "1076503874544",
    appId: "1:1076503874544:web:22718fef4594db0db6ab35"
    // Tu configuración aquí
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// API Key de YouTube
const YOUTUBE_API_KEY = 'AIzaSyD38YHugEqYgvEVKURc6sqz-K-ZodZuM5k';

// Función para buscar videos
async function searchVideos() {
    const searchInput = document.getElementById('searchInput').value;
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${searchInput}&type=video&key=${YOUTUBE_API_KEY}`);
    const data = await response.json();
    
    displayResults(data.items);
}

// Mostrar resultados de búsqueda
function displayResults(videos) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';

    videos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        videoCard.innerHTML = `
            <img src="${video.snippet.thumbnails.high.url}" alt="${video.snippet.title}" class="video-thumbnail">
            <div class="video-info">
                <div class="video-title">${video.snippet.title}</div>
                <div class="video-actions">
                    <button onclick="previewVideo('${video.id.videoId}')">Vista previa</button>
                    <button onclick="addToPlaylist('${video.id.videoId}', '${video.snippet.title}')">
                        Añadir a la lista
                    </button>
                </div>
            </div>
        `;
        resultsDiv.appendChild(videoCard);
    });
}

// Función para vista previa
function previewVideo(videoId) {
    const modal = document.getElementById('previewModal');
    const previewDiv = document.getElementById('videoPreview');
    
    previewDiv.innerHTML = `
        <iframe width="100%" height="400" 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                frameborder="0" 
                allow="autoplay; encrypted-media" 
                allowfullscreen>
        </iframe>
    `;
    
    modal.style.display = 'block';
}

// Cerrar modal
document.querySelector('.close').onclick = function() {
    document.getElementById('previewModal').style.display = 'none';
    document.getElementById('videoPreview').innerHTML = '';
}

// Añadir a la lista de reproducción
function addToPlaylist(videoId, title) {
    const playlistRef = database.ref('playlist');
    playlistRef.push({
        id: videoId,
        title: title
    });
}