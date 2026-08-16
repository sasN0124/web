{
  "design_system_name": "Karaoke Night Compartido — Neon Zen (oscuro, festivo, legible)",
  "brand_attributes": [
    "festivo pero elegante",
    "alta legibilidad en ambientes oscuros",
    "colaborativo / en tiempo real",
    "energía de escenario (luces, brillo controlado)",
    "confiable (roles claros: usuario vs admin)"
  ],
  "inspiration_refs": {
    "visual_direction": [
      {
        "name": "Encore Neon Karaoke Bar template (Neo-Retro Japanese Zen)",
        "url": "https://www.rocket.new/templates/encore-neon-karaoke-bar-landing-page-template",
        "takeaways": [
          "Fondo tinta profundo + acentos neón (usar acento con moderación)",
          "Mosaico/imagen de ambiente como textura de hero (pero en nuestra app: solo en header/hero, no en áreas de lectura)",
          "CTA sticky inferior como patrón (nosotros: barra de controles fija inferior)",
          "Tarjetas tipo ‘polaroid’/carta para items (adaptar a cards de resultados/playlist)"
        ]
      },
      {
        "name": "Spotify-like layout with fixed NowPlayingBar (responsive grid guidance)",
        "url": "https://www.rapidevelopers.com/v0-template/spotify-ui",
        "takeaways": [
          "Barra inferior fija: fixed bottom-0 left-0 w-full",
          "Sliders accesibles con shadcn/ui Slider",
          "Grid responsive: 1 col móvil, 2 col md, 3 col lg",
          "Animaciones sutiles (slide-up mount, hover overlays)"
        ]
      },
      {
        "name": "shadcn block: Music Karaoke Queue",
        "url": "https://www.shadcn.io/blocks/music-karaoke-queue",
        "takeaways": [
          "Lista numerada + estado ‘en vivo’/‘en reproducción’",
          "Badges para estados (LIVE, En cola, Reproduciendo)",
          "Estructura mobile-first para colas"
        ]
      }
    ]
  },
  "typography": {
    "google_fonts": {
      "display": {
        "family": "Fraunces",
        "weights": ["600", "700"],
        "usage": "H1/H2, nombre de app, títulos de secciones"
      },
      "body": {
        "family": "DM Sans",
        "weights": ["400", "500", "600"],
        "usage": "UI general, labels, botones, listas"
      },
      "mono_optional": {
        "family": "IBM Plex Mono",
        "weights": ["400", "500"],
        "usage": "tiempos 0:00 / 3:22, códigos, debug"
      }
    },
    "tailwind_font_setup": {
      "note": "El agente principal debe añadir las fuentes en index.html (Google Fonts) y extender tailwind.config.js con fontFamily: { display: ['Fraunces', 'serif'], sans: ['DM Sans', 'ui-sans-serif', 'system-ui'], mono: ['IBM Plex Mono', 'ui-monospace'] }",
      "classes": {
        "display": "font-display",
        "body": "font-sans",
        "mono": "font-mono"
      }
    },
    "type_scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-display tracking-tight",
      "h2": "text-base md:text-lg font-sans text-muted-foreground",
      "section_title": "text-xl sm:text-2xl font-display",
      "card_title": "text-base font-sans font-semibold leading-snug",
      "body": "text-sm sm:text-base font-sans",
      "small": "text-xs sm:text-sm text-muted-foreground",
      "timecode": "text-xs font-mono tabular-nums"
    }
  },
  "color_system": {
    "mode": "dark-first",
    "palette_intent": "Oscuro tinta + acento neón coral (sin morado). Complemento: teal/menta para estados y enfoque.",
    "tokens_hsl_for_index_css": {
      "note": "Reemplazar los tokens de :root y .dark en /app/frontend/src/index.css. Mantener contraste AA.",
      "dark": {
        "--background": "230 22% 8%",
        "--foreground": "210 20% 96%",
        "--card": "230 22% 10%",
        "--card-foreground": "210 20% 96%",
        "--popover": "230 22% 10%",
        "--popover-foreground": "210 20% 96%",
        "--primary": "18 92% 62%",
        "--primary-foreground": "230 22% 10%",
        "--secondary": "230 18% 16%",
        "--secondary-foreground": "210 20% 96%",
        "--muted": "230 16% 14%",
        "--muted-foreground": "215 14% 70%",
        "--accent": "174 72% 42%",
        "--accent-foreground": "230 22% 10%",
        "--destructive": "0 78% 56%",
        "--destructive-foreground": "210 20% 96%",
        "--border": "230 16% 18%",
        "--input": "230 16% 18%",
        "--ring": "18 92% 62%",
        "--radius": "0.75rem"
      },
      "light_optional": {
        "note": "No es requerido; la app puede ser solo dark. Si se agrega toggle, usar neutrales cálidos y mantener acento coral/teal."
      }
    },
    "semantic_states": {
      "success": {
        "bg": "bg-emerald-500/15",
        "text": "text-emerald-200",
        "border": "border-emerald-500/30"
      },
      "info": {
        "bg": "bg-cyan-500/15",
        "text": "text-cyan-200",
        "border": "border-cyan-500/30"
      },
      "warning": {
        "bg": "bg-amber-500/15",
        "text": "text-amber-200",
        "border": "border-amber-500/30"
      },
      "danger": {
        "bg": "bg-red-500/15",
        "text": "text-red-200",
        "border": "border-red-500/30"
      }
    },
    "gradients_and_texture": {
      "rule": "Gradientes solo decorativos y máximo ~20% del viewport (hero/header). No usar gradientes oscuros saturados ni morado/rosa.",
      "allowed_background_gradient": "bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(255,122,89,0.18),transparent_55%),radial-gradient(900px_circle_at_90%_10%,rgba(45,212,191,0.14),transparent_50%)]",
      "noise_overlay_css": "background-image: url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"160\"%3E%3Cfilter id=\"n\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"160\" height=\"160\" filter=\"url(%23n)\" opacity=\"0.08\"/%3E%3C/svg%3E');",
      "usage": [
        "Aplicar el gradient solo en el header/hero de Buscar y en el fondo del Reproductor detrás del video (no sobre texto)",
        "Aplicar noise overlay como pseudo-elemento en el layout root: after:absolute after:inset-0 after:pointer-events-none after:opacity-60"
      ]
    }
  },
  "layout_and_grid": {
    "app_shell": {
      "pattern": "Header fijo + contenido scroll + (en Reproductor) barra de controles fija inferior",
      "max_width": "max-w-6xl para páginas 1/2; Reproductor usa full-bleed para video",
      "page_padding": "px-4 sm:px-6 lg:px-8 py-6",
      "responsive_grid": {
        "search_results": "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
        "playlist_page": "grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 (lista + panel de estado/ayuda)",
        "player_page": "grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 (video + cola)"
      }
    },
    "header": {
      "height": "h-14 sm:h-16",
      "classes": "sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "content": [
        "Izquierda: logo + nombre (Fraunces)",
        "Centro (desktop): tabs/nav Buscar | Lista compartida | Reproductor (solo admin)",
        "Derecha: Badge rol + botón Ingresar/Salir"
      ]
    }
  },
  "components": {
    "component_path": {
      "button": "/app/frontend/src/components/ui/button.jsx",
      "input": "/app/frontend/src/components/ui/input.jsx",
      "card": "/app/frontend/src/components/ui/card.jsx",
      "badge": "/app/frontend/src/components/ui/badge.jsx",
      "dialog": "/app/frontend/src/components/ui/dialog.jsx",
      "sheet": "/app/frontend/src/components/ui/sheet.jsx",
      "tabs": "/app/frontend/src/components/ui/tabs.jsx",
      "scroll_area": "/app/frontend/src/components/ui/scroll-area.jsx",
      "separator": "/app/frontend/src/components/ui/separator.jsx",
      "skeleton": "/app/frontend/src/components/ui/skeleton.jsx",
      "slider": "/app/frontend/src/components/ui/slider.jsx",
      "progress": "/app/frontend/src/components/ui/progress.jsx",
      "tooltip": "/app/frontend/src/components/ui/tooltip.jsx",
      "sonner": "/app/frontend/src/components/ui/sonner.jsx"
    },
    "buttons": {
      "shape": "Rounded (10–12px) — elegante pero amigable",
      "variants": {
        "primary": {
          "use": "CTA principal (Añadir, Ingresar como admin, Reproducir)",
          "classes": "bg-primary text-primary-foreground hover:brightness-110 active:brightness-95 shadow-[0_10px_30px_-12px_rgba(255,122,89,0.55)]",
          "focus": "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        },
        "secondary": {
          "use": "Acciones secundarias (Vista previa)",
          "classes": "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
        },
        "ghost": {
          "use": "Icon buttons (eliminar, fullscreen)",
          "classes": "hover:bg-muted/60"
        },
        "destructive": {
          "use": "Eliminar",
          "classes": "bg-destructive text-destructive-foreground hover:brightness-110"
        }
      },
      "micro_interaction": "hover: translateY(-1px) solo en botones grandes (no en toda la app). active:scale-[0.98]. No usar transition-all; usar transition-colors y transition-shadow."
    },
    "cards": {
      "video_result_card": {
        "structure": [
          "Thumbnail 16:9 (AspectRatio)",
          "Título + canal",
          "Fila de acciones: Añadir + Vista previa"
        ],
        "classes": "group rounded-xl border bg-card/70 backdrop-blur-sm shadow-[0_1px_0_rgba(255,255,255,0.04)] hover:shadow-[0_18px_60px_-40px_rgba(45,212,191,0.45)]",
        "thumbnail_hover": "overlay sutil: after:absolute after:inset-0 after:bg-black/20 group-hover:after:bg-black/10"
      },
      "playlist_item": {
        "classes": "rounded-xl border bg-card p-3 flex gap-3",
        "states": {
          "playing": "ring-1 ring-primary/60 bg-[rgba(255,122,89,0.08)]",
          "queued": "bg-card",
          "removing": "opacity-60"
        }
      }
    },
    "dialogs_and_sheets": {
      "preview": {
        "component": "Dialog",
        "behavior": "Vista previa local ~15s. Mostrar contador y botón ‘Cerrar’.",
        "classes": "max-w-[92vw] sm:max-w-2xl",
        "accessibility": "trap focus, ESC cierra"
      },
      "mobile_queue": {
        "component": "Sheet",
        "behavior": "En Reproductor móvil, la cola va en Sheet desde abajo para no competir con el video.",
        "trigger": "Botón ‘Lista’ junto a controles"
      }
    },
    "navigation": {
      "desktop": "Tabs o NavigationMenu",
      "mobile": "Menú en Sheet (hamburger) + links",
      "role_guard": "Ocultar link Reproductor si no es admin; si se intenta entrar, mostrar toast de permiso"
    },
    "player_controls_bar": {
      "position": "fixed bottom-0 left-0 w-full z-50",
      "safe_area": "pb-[env(safe-area-inset-bottom)]",
      "classes": "border-t bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "layout": {
        "mobile": "grid grid-cols-[auto_1fr_auto] gap-3 items-center px-4 py-3",
        "desktop": "grid grid-cols-[320px_1fr_320px] gap-4 items-center px-6 py-3"
      },
      "controls": {
        "play_pause": "Button size=icon (lucide Play/Pause)",
        "next": "Button size=icon (lucide SkipForward)",
        "progress": "Slider + timecodes (font-mono tabular-nums)",
        "volume": "Slider + icon Volume2"
      },
      "admin_only": {
        "note": "Solo admin puede interactuar con controles. Para usuarios: mostrar controles deshabilitados + tooltip ‘Solo el admin controla’.",
        "disabled_style": "opacity-60 cursor-not-allowed"
      }
    }
  },
  "page_blueprints": {
    "page_1_buscar": {
      "hero_header": {
        "title": "Encuentra el video",
        "subtitle": "Agrega a la lista compartida y prueba una vista previa rápida.",
        "background": "usar allowed_background_gradient + noise overlay (solo en header)"
      },
      "search_bar": {
        "components": ["Input", "Button"],
        "pattern": "Input ancho + botón Buscar; en móvil botón full-width debajo",
        "data_testids": {
          "input": "youtube-search-input",
          "submit": "youtube-search-submit-button"
        }
      },
      "results": {
        "loading": "Skeleton cards (3–6) con shimmer",
        "empty": "Card con mensaje + tips de búsqueda",
        "error": "Alert destructiva con retry"
      },
      "result_card_actions": {
        "add": {"label": "Añadir", "data-testid": "search-result-add-to-playlist-button"},
        "preview": {"label": "Vista previa", "data-testid": "search-result-preview-button"}
      }
    },
    "page_2_lista_compartida": {
      "header": {
        "title": "Lista compartida",
        "meta": "contador de videos + estado en tiempo real (Badge ‘EN VIVO’)"
      },
      "list": {
        "component": "ScrollArea",
        "item": "playlist_item card",
        "actions": {
          "remove": "Button variant=destructive size=sm",
          "preview": "Button variant=secondary size=sm"
        },
        "data_testids": {
          "list": "shared-playlist-list",
          "remove": "shared-playlist-remove-button",
          "preview": "shared-playlist-preview-button"
        }
      },
      "empty_state": {
        "title": "Todavía no hay videos",
        "body": "Vuelve a Buscar y añade el primero.",
        "cta": "Ir a Buscar"
      }
    },
    "page_3_reproductor_admin": {
      "guard": "Solo admin (código admin123).",
      "video_area": {
        "default": "16:9 grande con bordes redondeados en desktop; en móvil full width",
        "full_screen_mode": "solo video + botón ‘Salir’ flotante arriba-izquierda",
        "data_testids": {
          "player": "shared-player-iframe",
          "fullscreen_enter": "player-fullscreen-enter-button",
          "fullscreen_exit": "player-fullscreen-exit-button"
        }
      },
      "queue": {
        "desktop": "panel derecho con ScrollArea",
        "mobile": "Sheet desde abajo",
        "item_actions": {
          "play": "Button variant=primary size=sm",
          "remove": "Button variant=destructive size=sm"
        },
        "data_testids": {
          "queue": "player-queue-list",
          "play": "player-queue-play-button",
          "remove": "player-queue-remove-button"
        }
      },
      "controls_bar": {
        "note": "Siempre visible. Debe reservar espacio en el layout: pb-[92px] aprox para que el contenido no quede debajo.",
        "data_testids": {
          "playpause": "player-controls-playpause-button",
          "next": "player-controls-next-button",
          "progress": "player-controls-progress-slider",
          "volume": "player-controls-volume-slider"
        }
      }
    }
  },
  "motion_and_microinteractions": {
    "library": {
      "recommended": "framer-motion",
      "install": "npm i framer-motion",
      "usage": [
        "Entrada de cards: fade+slide (y: 8 -> 0) con stagger",
        "Barra de controles: slide-up al montar",
        "Hover en cards: overlay suave + shadow"
      ]
    },
    "css_transitions": {
      "rule": "No usar transition-all.",
      "allowed": [
        "transition-colors",
        "transition-shadow",
        "transition-opacity"
      ],
      "durations": {
        "default": "duration-200",
        "slow": "duration-300"
      },
      "easing": "ease-out"
    },
    "scroll": {
      "pattern": "Header con backdrop-blur; listas con ScrollArea; mantener barras visibles en hover (desktop)."
    }
  },
  "accessibility": {
    "contrast": "Texto principal siempre sobre bg sólido oscuro; evitar texto sobre thumbnails.",
    "focus": "focus-visible:ring-2 ring-primary + ring-offset-background",
    "reduced_motion": "Respetar prefers-reduced-motion: desactivar stagger y pulses.",
    "touch_targets": "mínimo 44px en controles del reproductor",
    "aria": [
      "Botones icon-only con aria-label en español",
      "Sliders con aria-label (Progreso, Volumen)"
    ]
  },
  "data_testid_convention": {
    "rule": "Todos los elementos interactivos y textos críticos deben tener data-testid en kebab-case.",
    "examples": [
      "header-login-button",
      "role-badge",
      "search-result-add-to-playlist-button",
      "shared-playlist-list",
      "player-controls-volume-slider",
      "toast-permission-denied"
    ]
  },
  "image_urls": {
    "hero_background_optional": [
      {
        "url": "https://images.unsplash.com/photo-1575672923798-34510f46aae6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwY3Jvd2QlMjBuZW9uJTIwbGlnaHRzfGVufDB8fHx0ZWFsfDE3ODY5MTI1MTV8MA&ixlib=rb-4.1.0&q=85",
        "category": "header/hero",
        "description": "Fondo ambiente (con overlay oscuro) para header de Buscar o Reproductor (decorativo, no lectura)."
      }
    ],
    "empty_state_illustration_optional": [
      {
        "url": "https://images.unsplash.com/photo-1585347110520-7a8a5c77af09?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxtaWNyb3Bob25lJTIwc3RhZ2UlMjBsaWdodHMlMjBjbG9zZSUyMHVwfGVufDB8fHxvcmFuZ2V8MTc4NjkxMjUyMXww&ixlib=rb-4.1.0&q=85",
        "category": "empty states",
        "description": "Imagen simple para estado vacío (usar muy pequeña o como thumbnail con blur)."
      }
    ]
  },
  "instructions_to_main_agent": [
    "Actualizar /app/frontend/src/index.css: definir tokens dark-first (ver tokens_hsl_for_index_css.dark) y activar class 'dark' en html/body por defecto.",
    "No usar morado. Acento principal coral (primary) + teal (accent).",
    "Implementar layout mobile-first: resultados en 1 col móvil, 2 col sm, 3 col lg. En Reproductor: cola en Sheet en móvil.",
    "Barra de controles del reproductor: fixed bottom-0 left-0 w-full + pb safe-area. Reservar padding-bottom en la página para que no tape contenido.",
    "Usar shadcn/ui Slider para progreso y volumen; Dialog para vista previa; ScrollArea para listas.",
    "Todos los botones/inputs/links y textos críticos deben incluir data-testid (kebab-case).",
    "Micro-interacciones: usar framer-motion para entrada de cards y slide-up de la barra; evitar transition-all.",
    "UI en español: labels, tooltips, toasts, estados (Cargando…, Sin resultados, En vivo, Reproduciendo)."
  ]
}

<General UI UX Design Guidelines>  
    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms
    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text
   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json

 **GRADIENT RESTRICTION RULE**
NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc
NEVER use dark gradients for logo, testimonial, footer etc
NEVER let gradients cover more than 20% of the viewport.
NEVER apply gradients to text-heavy content or reading areas.
NEVER use gradients on small UI elements (<100px width).
NEVER stack multiple gradient layers in the same viewport.

**ENFORCEMENT RULE:**
    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors

**How and where to use:**
   • Section backgrounds (not content backgrounds)
   • Hero section header content. Eg: dark to light to dark color
   • Decorative overlays and accent elements only
   • Hero section with 2-3 mild color
   • Gradients creation can be done for any angle say horizontal, vertical or diagonal

- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**

</Font Guidelines>

- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. 
   
- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.

- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.
   
- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly
    Eg: - if it implies playful/energetic, choose a colorful scheme
           - if it implies monochrome/minimal, choose a black–white/neutral scheme

**Component Reuse:**
	- Prioritize using pre-existing components from src/components/ui when applicable
	- Create new components that match the style and conventions of existing components when needed
	- Examine existing components to understand the project's component patterns before creating new ones

**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component

**Best Practices:**
	- Use Shadcn/UI as the primary component library for consistency and accessibility
	- Import path: ./components/[component-name]

**Export Conventions:**
	- Components MUST use named exports (export const ComponentName = ...)
	- Pages MUST use default exports (export default function PageName() {...})

**Toasts:**
  - Use `sonner` for toasts"
  - Sonner component are located in `/app/src/components/ui/sonner.tsx`

Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.
</General UI UX Design Guidelines>
