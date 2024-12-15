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

let currentVideoIndex = 0;
let playlist = [];
let player;


// Cargar el API de YouTube
window.onYouTubeIframeAPIReady = function() {
    if (playlist.length > 0) {
        createPlayer(playlist[0].id);
    }
}

// Crear el reproductor de YouTube
function createPlayer(videoId) {
    player = new YT.Player('currentVideo', {
        height: '360',
        width: '640',
        videoId: videoId,
        playerVars: {
            'autoplay': 1,
            'controls': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}


// Cuando el reproductor está listo
function onPlayerReady(event) {
    event.target.playVideo();
}

// Cuando cambia el estado del reproductor
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        const currentVideo = playlist[currentVideoIndex];
        if (currentVideo && currentVideo.key) {
            setTimeout(() => {
                // Guardamos la referencia al siguiente video antes de eliminar el actual
                const nextVideo = playlist[currentVideoIndex + 1];
                
                // Eliminamos el video actual
                removeVideo(currentVideo.key);
                
                // Si hay un siguiente video, lo reproducimos
                if (nextVideo) {
                    // Buscamos el nuevo índice del siguiente video
                    const newIndex = playlist.findIndex(video => video.key === nextVideo.key);
                    if (newIndex !== -1) {
                        playVideo(newIndex);
                    }
                }
            }, 2000);
        }
    }
}

// Cargar lista de reproducción
function loadPlaylist() {
    const playlistRef = database.ref('playlist');
    
    playlistRef.on('value', (snapshot) => {
        playlist = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                playlist.push({
                    ...childSnapshot.val(),
                    key: childSnapshot.key
                });
            });
            
            displayPlaylist();
            if (playlist.length > 0 && !player) {
                createPlayer(playlist[0].id);
            }
        }
    });
}

// Mostrar lista de reproducción
function displayPlaylist() {
    const playlistDiv = document.getElementById('playlist');
    playlistDiv.innerHTML = '';

    playlist.forEach((video, index) => {
        const videoElement = document.createElement('div');
        videoElement.className = 'video-card';
        videoElement.innerHTML = `
            <div class="video-info">
                <h3>${video.title}</h3>
                <div class="video-actions">
                    <button onclick="playVideo(${index})">Reproducir</button>
                    <button onclick="removeVideo('${video.key}')">Eliminar</button>
                </div>
            </div>
        `;
        playlistDiv.appendChild(videoElement);
    });
}

// Reproducir video
function playVideo(index) {
    if (!playlist[index]) return;
    currentVideoIndex = index;
    
    if (player) {
        player.loadVideoById(playlist[index].id);
    } else {
        createPlayer(playlist[index].id);
    }
}

// Eliminar video
function removeVideo(key) {
    database.ref('playlist').child(key).remove();
}

// Iniciar la carga de la lista
loadPlaylist();