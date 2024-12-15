document.addEventListener('DOMContentLoaded', function() {
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

    // Inicializar Firebase si no está inicializado
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
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
        // YT.PlayerState.ENDED = 0
        if (event.data === 0) {
            // El video terminó
            if (playlist[currentVideoIndex] && playlist[currentVideoIndex].key) {
                removeVideo(playlist[currentVideoIndex].key);
                if (currentVideoIndex < playlist.length - 1) {
                    currentVideoIndex++;
                    playVideo(currentVideoIndex);
                }
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
        if (!playlistDiv) return;

        playlistDiv.innerHTML = '';

        playlist.forEach((video, index) => {
            if (video && video.title) {
                const videoElement = document.createElement('div');
                videoElement.className = 'video-card';
                videoElement.innerHTML = `
                    <div class="video-info">
                        <h3>${video.title}</h3>
                        <div class="video-actions">
                            <button onclick="window.playVideo(${index})">Reproducir</button>
                            <button onclick="window.removeVideo('${video.key}')">Eliminar</button>
                        </div>
                    </div>
                `;
                playlistDiv.appendChild(videoElement);
            }
        });
    }

    // Reproducir video
    window.playVideo = function(index) {
        if (!playlist[index]) return;
        currentVideoIndex = index;

        if (player) {
            player.loadVideoById(playlist[index].id);
        } else {
            createPlayer(playlist[index].id);
        }
    }

    // Eliminar video
    window.removeVideo = function(key) {
        if (key) {
            database.ref('playlist').child(key).remove()
                .catch(error => {
                    console.error("Error removing video: ", error);
                });
        }
    }

    // Iniciar la carga de la lista
    loadPlaylist();
});    


    /*if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const database = firebase.database();

    let currentVideoIndex = 0;
    let playlist = [];

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
                if (playlist.length > 0 && !document.getElementById('currentVideo').innerHTML) {
                    playVideo(0);
                }
            }
        });
    }

    // Mostrar lista de reproducción
    function displayPlaylist() {
        const playlistDiv = document.getElementById('playlist');
        if (!playlistDiv) return;

        playlistDiv.innerHTML = '';

        playlist.forEach((video, index) => {
            if (video && video.title) {
                const videoElement = document.createElement('div');
                videoElement.className = 'video-card';
                videoElement.innerHTML = `
                    <div class="video-info">
                        <h3>${video.title}</h3>
                        <div class="video-actions">
                            <button onclick="window.playVideo(${index})">Reproducir</button>
                            <button onclick="window.removeVideo('${video.key}')">Eliminar</button>
                        </div>
                    </div>
                `;
                playlistDiv.appendChild(videoElement);
            }
        });
    }

    // Reproducir video
    window.playVideo = function(index) {
        if (!playlist[index]) return;

        const currentVideoDiv = document.getElementById('currentVideo');
        if (!currentVideoDiv) return;

        currentVideoIndex = index;
        
        currentVideoDiv.innerHTML = `
            <iframe width="100%" height="100%" 
                    src="https://www.youtube.com/embed/${playlist[index].id}?autoplay=1&enablejsapi=1" 
                    frameborder="0" 
                    allow="autoplay"
                    allowfullscreen>
            </iframe>
        `;

        // Configurar el siguiente video
        setTimeout(() => {
            if (playlist[currentVideoIndex] && playlist[currentVideoIndex].key) {
                removeVideo(playlist[currentVideoIndex].key);
                if (currentVideoIndex < playlist.length - 1) {
                    playVideo(currentVideoIndex + 1);
                }
            }
        }, 5); // Ajusta este tiempo según necesites
    }

    // Eliminar video
    window.removeVideo = function(key) {
        if (key) {
            database.ref('playlist').child(key).remove()
                .catch(error => {
                    console.error("Error removing video: ", error);
                });
        }
    }

    // Iniciar la carga de la lista
    loadPlaylist();
});*/