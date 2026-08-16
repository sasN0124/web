# plan.md — Karaoke colaborativo con YouTube (React + Firebase RTDB + FastAPI)

## 1) Objectives
- App web responsive (desktop/móvil) en **español** para buscar videos de YouTube, armar **playlist compartida** y reproducir en **player compartido**.
- **Tiempo real** con **Firebase Realtime Database** (playlist + estado del player) por **salas con código**.
- **Roles**: usuario (default) y admin (código `admin123`). Solo admin controla el player; todos ven sincronizado.
- **Backend FastAPI** como proxy `/api/youtube/search` para ocultar la API key de YouTube.
- **NO** implementar aún evaluador de karaoke/IA ni precisión de letra.

## 2) Implementation Steps

### Phase 1 — POC del core (aislado) (no avanzar hasta que funcione)
**Core a probar:** Integración YouTube Search (proxy) + RTDB sync + IFrame Player control/sync.

**User stories (POC)**
1. Como usuario, quiero buscar videos por texto y ver resultados con thumbnail/título.
2. Como usuario, quiero crear o unirme a una sala con un código y ver que el código queda activo.
3. Como usuario, quiero añadir un video a la playlist compartida y ver que aparece en otra pestaña/dispositivo al instante.
4. Como admin, quiero reproducir/pausar y que todos los viewers en la sala se sincronicen.
5. Como viewer, quiero que mi player “siga” al admin (video/tiempo/volumen/pausa) sin poder controlar.

**Steps**
1. Websearch breve (best practices):
   - Sync YouTube IFrame + estado externo (drift, throttling, seek).
   - Patrones Firebase RTDB para presencia/salas y “updated_at” para resolución de conflictos.
2. Backend POC (FastAPI):
   - Endpoint `GET /api/youtube/search?q=&pageToken=` llama YouTube Data API v3 y retorna JSON normalizado: `{items:[{video_id,title,thumbnail,channel_title}], nextPageToken}`.
   - Test con `curl` (verificar CORS, errores de cuota, input vacío).
3. Frontend POC (React minimal):
   - Conectar a Firebase RTDB con la `firebaseConfig` dada.
   - Estructura RTDB por sala: `rooms/{roomCode}/shared_playlist/{videoId}` y `rooms/{roomCode}/player_state`.
   - Crear/join sala (solo setear roomCode local + validar acceso con un write de prueba).
4. Playlist sync POC:
   - Alta/baja de items en `shared_playlist` y suscripción `onValue`.
   - Verificación manual con 2 tabs (misma sala): cambios reflejan en <1s.
5. Player sync POC (YouTube IFrame):
   - Cargar player y permitir `play/pause/seekTo/setVolume`.
   - Admin escribe `player_state` (con `updated_at = serverTimestamp/Date.now`).
   - Viewers escuchan y aplican cambios (con throttle y protección anti-loop).
   - Probar auto-advance (mock: “siguiente” manual) y propagación de `current_time`.
6. “Fix until works”:
   - Resolver drift (p.ej., si diferencia > 1.5s, hacer seek; si no, solo play/pause).
   - Evitar bucles (ignorar eventos originados localmente con `last_update_by`).

**Nota reglas Firebase (requerido para salas)**
- Ajustar rules para soportar `rooms/{roomCode}/...` (mantener validaciones de campos). Se entregarán rules actualizadas en la implementación.

---

### Phase 2 — V1 App Development (MVP completo)

**User stories (V1)**
1. Como usuario, quiero buscar videos y previsualizarlos ~15s sin afectar a los demás.
2. Como usuario, quiero añadir/quitar videos de la playlist compartida de mi sala en tiempo real.
3. Como admin, quiero entrar al reproductor compartido y controlar play/pausa/siguiente/volumen/progreso para todos.
4. Como viewer, quiero ver el mismo video sincronizado y saber que no tengo permisos de control.
5. Como grupo, queremos que al terminar un video comience el siguiente y el anterior se elimine automáticamente tras 1s.

**Build**
1. Ruteo y páginas (SPA):
   - `/` (Buscar), `/playlist`, `/player` (admin-only), `/room` (crear/unirse).
2. UI/UX (español, responsive):
   - Layout móvil primero, barras sticky, estados vacíos, loaders, toasts.
   - Estilo “karaoke night” (tema oscuro + acentos), tarjetas para resultados.
3. Roles (sin auth real):
   - Botón “Ingresar” → modal código → `admin` en `localStorage`.
   - Guard de ruta para `/player`.
4. Funcionalidad Search:
   - Input + debounce; resultados desde backend; botón “Añadir a playlist”.
   - Preview local con IFrame embed mini (15s) sin escribir `player_state`.
5. Playlist compartida:
   - Listado con eliminar, preview local.
   - Orden: por `added_at`.
6. Player compartido:
   - Fullscreen al entrar (y botón salir).
   - Controles **fixed bottom**: play/pause, next, progress (seek), volumen.
   - Solo admin habilita controles; viewers ven disabled.
   - Sincronización: `player_state` (video, is_playing, time, volume, updated_at, last_update_by).
   - Auto-next al `ENDED`: seleccionar siguiente en playlist; actualizar `player_state`; remover el video reproducido tras 1s.
7. Hardening MVP:
   - Manejo de sala inexistente, playlist vacía, video no disponible.
   - Sanitizar inputs, rate limit básico del search (frontend debounce).
8. 1 ronda de testing E2E con agente de testing.

---

### Phase 3 — Mejoras post-V1 (sin IA aún)

**User stories (mejoras)**
1. Como usuario, quiero compartir un link directo a mi sala para invitar fácilmente.
2. Como admin, quiero reordenar la playlist (arriba/abajo) para gestionar el turno.
3. Como usuario, quiero ver quién está conectado a la sala (presencia simple).
4. Como viewer, quiero un modo “solo video” (fullscreen limpio) y volver sin perder sync.
5. Como admin, quiero un botón “limpiar playlist” para reiniciar la sesión.

**Additions**
- Presencia con RTDB (onDisconnect), lista de participantes.
- Reordenamiento (campo `position` o lista ordenada).
- Mejoras de sincronización: ajuste de drift, actualización periódica de `current_time` (cada N segundos solo admin).
- 1 ronda de testing E2E.

---

### Phase 4+ (LATER, solo si el usuario lo pide)
- Evaluador de karaoke (mic) + scoring (tono/ritmo/letra) y su UX.

## 3) Next Actions
- ✅ POC validado: búsqueda YouTube (proxy), Firebase RTDB en tiempo real, roles+guard, player carga videos (metadata OK).
- ✅ App completa construida (3 páginas, roles, tiempo real, player sincronizado, fullscreen, auto-next, auto-remove).
- ✅ Testing E2E: backend 5/5, frontend 24/24 (100%), sin bugs.
- ⚠️ Reproducción real de video NO verificable en este sandbox (el filtro de red/DNS del entorno bloquea dominios de YouTube → "This content isn't available"). No es bug de código. Verificar desde dispositivo real del usuario.
- Pendiente (futuro, a pedido del usuario): evaluador de karaoke con IA (micrófono, tono/ritmo/letra en %).

## 4) Success Criteria
- En una misma sala, 2+ dispositivos ven la **misma playlist** en tiempo real (add/delete < 1s).
- Admin controla play/pausa/seek/volumen y todos los viewers se sincronizan de forma consistente.
- Al terminar un video: inicia el siguiente y el anterior se elimina tras 1 segundo para todos.
- `/player` inaccesible para no-admin (guard + UI clara).
- Responsive, UI en español, preview local no afecta el estado compartido.
