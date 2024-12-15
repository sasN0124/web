// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Configuración de Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyCUzcdMv2b5GfEgt7ywmLAn-tZbaC1fuzM",
        authDomain: "karaoke-7e2d8.firebaseapp.com",
        projectId: "karaoke-7e2d8",
        storageBucket: "karaoke-7e2d8.firebasestorage.app",
        messagingSenderId: "1076503874544",
        appId: "1:1076503874544:web:22718fef4594db0db6ab35"
        // Tu configuración de Firebase aquí
    };

    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    // API Key de YouTube
    const YOUTUBE_API_KEY = 'AIzaSyD38YHugEqYgvEVKURc6sqz-K-ZodZuM5k';

    // Función para buscar videos
    window.searchVideos = async function() {
        const searchTerm = document.getElementById('searchInput').value;
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchTerm}&type=video&key=${YOUTUBE_API_KEY}&maxResults=12`);
        const data = await response.json();
        displayResults(data.items);
    }

    // Mostrar resultados de búsqueda
    function displayResults(videos) {
        const resultsDiv = document.getElementById('searchResults');
        resultsDiv.innerHTML = '';

        videos.forEach(video => {
            const videoCard = createVideoCard(video);
            resultsDiv.appendChild(videoCard);
        });
    }

    // Crear tarjeta de video
    function createVideoCard(video) {
        const card = document.createElement('div');
        card.className = 'video-card';
        
        card.innerHTML = `
            <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
            <div class="video-info">
                <h3>${video.snippet.title}</h3>
                <div class="video-actions">
                    <button class="preview-btn" onclick="previewVideo('${video.id.videoId}')">Vista Previa</button>
                    <button class="add-btn" onclick="addToPlaylist('${video.id.videoId}', '${video.snippet.title}')">Agregar a Lista</button>
                </div>
            </div>
        `;

        return card;
    }

    // Vista previa del video
    window.previewVideo = function(videoId) {
        const modal = document.getElementById('previewModal');
        const videoPreview = document.getElementById('videoPreview');
        
        videoPreview.innerHTML = `
            <iframe width="100%" height="450" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
        `;
        
        modal.style.display = 'block';
    }

    // Agregar a la lista de reproducción
    window.addToPlaylist = function(videoId, title) {
        const playlistRef = database.ref('playlist');
        const newVideo = {
            id: videoId,
            title: title,
            timestamp: Date.now()
        };
        
        playlistRef.push(newVideo);
        alert('Video agregado a la lista de reproducción');
    }

    // Cerrar modal
    const closeButton = document.querySelector('.close');
    if (closeButton) {
        closeButton.onclick = function() {
            document.getElementById('previewModal').style.display = 'none';
        }
    }

    // Cerrar modal al hacer clic fuera de él
    window.onclick = function(event) {
        const modal = document.getElementById('previewModal');
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
});