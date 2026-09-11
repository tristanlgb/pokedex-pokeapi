# Pokédex

Pokédex en React y TypeScript con catálogo nacional, favoritos, comparador, equipo de seis y un laboratorio interactivo. La interfaz está en español y consume datos de [PokéAPI](https://pokeapi.co/docs/v2).

## Ejecutar localmente

Requiere Node.js 22.12 o superior y conexión a Internet para descargar los datos e imágenes.

```bash
npm ci
npm run dev
```

Abre [la app local](http://127.0.0.1:5173). El servidor de desarrollo también implementa `/api/chat`; el laboratorio funciona sin claves de API.

En VS Code: **Terminal → Ejecutar tarea → Pokédex: iniciar servidor local**. Con el servidor iniciado, la configuración **Pokédex: abrir app local** abre Edge para depurar. No inicies otra instancia si el puerto 5173 ya está ocupado.

## Funciones

- Catálogo nacional de especies predeterminadas, sin duplicar formas alternativas.
- Búsqueda parcial por nombre y exacta por número, incluyendo `#025`.
- Filtros combinados de tipo y generación; paginación sin recorte de 36 resultados.
- Orden por número, nombre, estadísticas totales o velocidad.
- Favoritos, comparación de dos Pokémon y equipo de hasta seis, persistidos en localStorage.
- Comparación con diferencias numéricas y barras sobre una escala común.
- Balance defensivo: multiplica las debilidades, resistencias e inmunidades de los dos tipos. No incluye habilidades, objetos ni efectos de combate.
- Ficha accesible con teclado, Escape, retorno del foco, shiny, descripción y árbol evolutivo navegable.
- Enlaces compartibles mediante `?pokemon=25`; los filtros, búsqueda, orden, página y sección también se conservan en la URL.
- Laboratorio separado: investigación determinista y Poké Ball 3D con carga diferida.
- Esqueletos de carga, reintentos, mensajes de almacenamiento y diseño móvil de dos columnas.

Los nombres técnicos de habilidades se muestran como los entrega PokéAPI. Las descripciones utilizan la traducción española cuando existe. El aspecto shiny puede no estar disponible para todas las fichas.

## Estructura

- `src/api/pokeApi.ts`: acceso a datos, caché en memoria, timeout y cancelación.
- `src/hooks/usePokemonCatalog.ts`: carga centralizada del catálogo y ordenación global.
- `src/hooks/useCatalogLocation.ts`: lectura y escritura del estado en la URL.
- `src/hooks/useStoredIds.ts`: persistencia validada y límites de selección.
- `src/components/`: tarjetas, filtros, ficha, colecciones y laboratorio.
- `src/lib/pokemon.ts`: nombres de tipos, colores, estadísticas y utilidades compartidas.
- `src/styles/`: tokens y estilos separados por funcionalidad. Los estilos del laboratorio se cargan con sus componentes.
- `api/research.ts`: validación y protocolo de streaming compartido por desarrollo y Vercel.
- `api/chat.ts`: adaptador HTTP para Vercel.
- `e2e/`: pruebas funcionales con respuestas controladas de PokéAPI.

## Rendimiento y decisiones

Las respuestas de PokéAPI se reutilizan durante la sesión. Las búsquedas y cambios de filtros cancelan la carga anterior y descartan respuestas antiguas. Se permiten hasta ocho solicitudes simultáneas.

La ordenación por estadísticas es global dentro de los filtros, no solamente de la página visible. La primera consulta puede demorar porque debe descargar los perfiles del conjunto; el contador muestra el avance y cambiar un filtro cancela la operación. Para consultas más pequeñas se puede elegir primero una generación o tipo.

El laboratorio y la escena 3D están fuera del paquete inicial. El visor usa geometría procedural, DPR limitado y una vista estática para movimiento reducido o dispositivos que informan poca memoria.

La investigación es una demostración determinista, no un agente conectado a un modelo. Los fallos simulados están agrupados en “Pruebas de recuperación”. Se validan tanto el cuerpo de entrada como la salida de la herramienta.

## Verificaciones

```bash
npm run lint
npm run format:check
npm run test:unit
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm run test:all` ejecuta todas las verificaciones en orden. `npm run format` aplica Prettier.

Para usar Chrome instalado en Windows en lugar del navegador descargado por Playwright:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run test:e2e
```

Las pruebas automatizadas utilizan datos controlados para ser repetibles. La comprobación manual del catálogo y laboratorio también debe realizarse con PokéAPI real. CI ejecuta lint, formato, pruebas, build y E2E.

## Compilación y despliegue

`npm run build` genera el frontend en `dist/` y comprueba los tipos del servidor. `npm run preview` sirve ese frontend estático; para probar también el laboratorio utiliza `npm run dev` o despliega el proyecto completo con sus funciones en Vercel.

Los favoritos y el equipo se guardan por navegador y origen. Un enlace compartido incluye la ficha y filtros, pero no comparte las colecciones privadas del dispositivo.

Pokémon e imágenes pertenecen a sus respectivos titulares. Proyecto educativo.
