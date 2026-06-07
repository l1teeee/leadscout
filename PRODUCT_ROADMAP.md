# LeadScout AI - Product Roadmap

## Estado Actual del Producto (fecha: 2026-06-07)

---

### Modulos Implementados

#### 1. Autenticacion (COMPLETO)
- Login, registro, logout con JWT via Supabase Auth
- Flujo de recuperacion de contrasena completo (forgot + reset + OTP)
- Onboarding de workspace (nombre, industria, pais, ciudad, telefono, sitio web)
- Ubicacion aproximada guardada en perfil (lat/lng con redondeo a 2 decimales)
- Firma HMAC por usuario para verificacion de integridad de tokens
- Rate limiting en endpoints sensibles (5/min login, 3/min registro)
- Cookie `ls_token` con 7 dias, SameSite=Strict

**Limitaciones reales:**
- El registro no confirma el email antes de permitir onboarding en todos los flujos
- No hay 2FA real implementado (el toggle en Settings es decorativo, sin backend)
- No hay endpoint para cambiar contrasena autenticado (solo el flujo de reset por email)
- `UserProfileUpdate` en settings solo acepta `full_name` y `role` - campos como telefono y titulo no se persisten en el perfil individual

#### 2. Explorer (COMPLETO - con limitaciones importantes)
- Busqueda real via Google Places API v1 (textSearch + detalles por place_id)
- Filtracion de marcas/franquicias con lista negra hardcodeada de ~80 cadenas conocidas en El Salvador + clasificacion IA con OpenAI
- Scoring de leads: 6 criterios (sitio web, telefono, rating, SSL, PageSpeed, Google Business completo) con pesos definidos
- Mapa MapLibre GL con marcadores por cluster coloreados por score
- Area de busqueda draggable con radio ajustable (0.5-50 km)
- Geocoding via Nominatim (OpenStreetMap)
- Sub-zonas: busqueda en 4 cuadrantes del area seleccionada para mayor cobertura
- Cache de resultados de Places (TTL configurable), clasificaciones de IA (7 dias)
- Guardado automatico de leads nuevos en Supabase al hacer busqueda
- Detalle de lead: score bar, badges estado/prioridad, brechas, telefono, sitio web, link a Google Maps, analisis IA bajo demanda
- Preferencias de busqueda persistidas en `localStorage`

**Limitaciones reales:**
- `pagespeed_service.py` existe y funciona pero `scoring_service.py` recibe `pagespeed_score=None` en el flujo actual del Explorer - el servicio de PageSpeed nunca se llama durante la busqueda, por lo que el criterio "Rendimiento web bajo" nunca se activa
- `website_has_ssl` siempre es `False` en el flujo actual - el scoring aplica -15 a cualquier negocio con sitio web que no sea HTTPS, pero no hay verificacion real de SSL en el pipeline
- La busqueda generica usa `_GENERIC_QUERY_GROUPS[0]` como base fija y rota los grupos B/C solo para sub-zonas, creando sesgo hacia categorias del grupo A en busquedas generales
- `UNDISCOVERED_POINTS` en `lib/explorer-data.ts` aun contiene coordenadas de Buenos Aires como placeholder - no afecta la funcionalidad real pero es deuda de datos
- El modal de analisis IA en `ExplorerAnalysisModal` y en `LeadDetail` dentro de `leads.tsx` son implementaciones separadas; el analisis no se guarda en la base de datos

#### 3. Leads (COMPLETO)
- Tabla con filtros en tiempo real: busqueda por texto (con debounce 400ms), status, prioridad
- Ordenamiento por columna (nombre, score, status, prioridad, created_at) con direccion
- Paginacion server-side con PAGE_SIZE=10
- KPIs derivados del cliente: total visible, alta prioridad, sin contacto, score promedio
- Panel de detalle lateral al seleccionar un lead
- Analisis IA bajo demanda en el panel de detalle
- PATCH /api/leads/{id} funcional para actualizacion de status y otros campos

**Limitaciones reales:**
- `last_contact` no es editable desde la UI de Leads - el campo existe en el schema y en la DB pero no hay forma de actualizar la fecha de ultimo contacto desde este modulo
- No hay forma de editar directamente un lead (nombre, telefono, sitio web, categoria) desde la interfaz
- La busqueda por texto se hace en Python post-query (`ql in r["name"].lower()`) en lugar de con filtro SQL, lo que puede ser lento con volumenes grandes y devuelve un `total` incorrecto (el count de Supabase incluye registros antes del filtro de texto)
- No hay exportacion a CSV/Excel
- Los KPIs (`highPriorityCount`, `noContactCount`, `avgScore`) se calculan sobre la pagina actual, no sobre todos los leads del workspace

#### 4. Oportunidades / Kanban (COMPLETO)
- Tablero Kanban con 4 columnas: nuevo, contactado, calificado, perdido
- Drag-and-drop funcional con @dnd-kit, con `activationConstraint: { distance: 8 }` para evitar drags accidentales
- DragOverlay con rotacion y escala para feedback visual
- Actualizacion optimista: el estado local cambia inmediatamente y se revierte si el PATCH falla
- Ordenamiento por columna: mayor score, menor score, prioridad, A-Z
- Panel de detalle al hacer click en el titulo de la tarjeta
- `desvinculado` existe como LeadStatus en el enum pero no se muestra como columna en el Kanban

**Limitaciones reales:**
- No hay notas ni historial de actividad por lead
- No hay campo para registrar la fecha de ultimo contacto desde el Kanban
- Al arrastrar un lead a "calificado" no hay flujo de calificacion (formulario, notas, valor estimado del deal)
- Los leads se cargan todos de una vez con `limit: 200` - si el workspace supera ese numero, los leads mas antiguos no aparecen en el Kanban
- No hay columna de "cerrado/ganado" - el pipeline termina en "calificado" sin indicar conversion real
- No hay busqueda ni filtro dentro del Kanban

#### 5. Reportes (COMPLETO - read-only)
- Server Component que hace fetch en paralelo de leads y summary
- KPIs: total leads, contactados, tasa de conversion (calificados/total), leads criticos (score <= 20)
- Grafico de actividad semanal (7 dias)
- Funnel de conversion por status con barras de porcentaje
- Listas compactas: distribucion por prioridad y por categoria
- Panel de "salud comercial" con insights textuales
- Cache del summary en Redis con invalidacion al crear/actualizar/eliminar leads

**Limitaciones reales:**
- No hay rango de fechas seleccionable - siempre muestra el estado actual total
- No hay exportacion de reportes (PDF, CSV)
- `weekly_activity` cuenta leads por `created_at`, no por fecha de ultimo contacto - un lead descubierto el lunes cuenta esa semana aunque no se haya contactado nunca
- `conversion` se calcula como `calificados / total_leads`, no como `calificados / contactados` - la metrica puede ser enganosa
- No hay comparacion periodo vs periodo anterior
- El endpoint solo tiene `GET /api/reports/summary` - no hay breakdowns por zona, por agente, ni por semana especifica

#### 6. Configuracion / Settings (PARCIAL - mitad real, mitad placeholder)
- **Real:** Workspace editable (nombre, industria, pais, ciudad, telefono, sitio web) con PATCH /api/settings/workspace
- **Real:** Perfil de usuario mostrado (nombre completo, email, rol) cargado desde GET /api/auth/me
- **Real:** Miembros del equipo via GET /api/settings/team (devuelve datos de la tabla `profiles`)
- **Real:** Usage via GET /api/settings/usage (leads_used real, el resto hardcodeado en 0)
- **Placeholder decorativo:** Preferencias operacionales (assignmentMode, followUpWindowHours, etc.) - los toggles no llaman al backend, se leen de `lib/settings-data.ts`
- **Placeholder decorativo:** Zonas de trabajo - datos hardcodeados en `SETTINGS_WORK_ZONES`
- **Placeholder decorativo:** Plan/facturacion - datos hardcodeados en `SETTINGS_PLAN_USAGE`
- **Placeholder decorativo:** Seguridad (2FA, rotacion de contrasena, dominios permitidos) - sin backend
- **Placeholder decorativo:** Actividad reciente / audit log - strings estaticos generados con nombre del usuario

**Limitaciones reales:**
- Los limites en `UsageSettings` estan hardcodeados en el backend: `leads_limit=500, searches_limit=100` sin relacion a un plan real
- `searches_used=0, api_calls_used=0` siempre - el `search_audit_repository` existe pero no se usa para calcular usage
- No hay funcionalidad de invitar nuevos miembros al equipo
- No hay gestion de roles de usuario

#### 7. Campanas (NO IMPLEMENTADO)
- Ruta `app/(app)/campaigns/page.tsx` devuelve `<ModulePlaceholder view="campaigns" />`
- Sin backend, sin hook, sin logica de negocio
- Solo pantalla de "proximo modulo" con texto descriptivo y cola de features planeadas

#### 8. Integraciones (NO IMPLEMENTADO)
- Ruta `app/(app)/integrations/page.tsx` devuelve `<ModulePlaceholder view="integrations" />`
- Sin backend, sin conexiones reales
- Solo pantalla de placeholder

---

### Stack Tecnico Confirmado

**Frontend:**
- Next.js 16 App Router con grupos de rutas `(app)` y `(auth)`
- React con Server Components para paginas con datos (dashboard, reportes, oportunidades)
- Client Components para interactividad (explorer, leads, kanban, settings)
- TypeScript, Tailwind CSS
- @dnd-kit/core para drag-and-drop en Kanban
- MapLibre GL + Carto Positron tiles para el mapa del Explorer
- Nominatim (OpenStreetMap) para geocoding de sugerencias
- Radix Dialog para modales
- pnpm como package manager

**Backend:**
- FastAPI (Python) con estructura de capas: routes > services > repositories
- Supabase como base de datos (PostgreSQL) y auth provider
- Redis opcional para cache (con fallback a cache en memoria si REDIS_URL vacio)
- OpenAI API (GPT-4o-mini por defecto) para clasificacion de negocios y analisis de leads
- Google Places API v1 (textSearch + place details) para descubrimiento
- PageSpeed Insights API (configurada pero no usada activamente en el pipeline)
- slowapi para rate limiting
- pydantic-settings para configuracion via .env
- httpx para llamadas HTTP async

**Infraestructura:**
- Variables de entorno: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_PLACES_API_KEY, OPENAI_API_KEY, REDIS_URL, SIGNING_SECRET, PAGESPEED_API_KEY
- Proxy `/backend/*` en Next.js hacia FastAPI en `http://127.0.0.1:8000`
- CORS + OriginGuardMiddleware configurable por entorno

---

## Analisis de Brechas (Gap Analysis)

### Critico - Sin esto el producto no es vendible

**1. Sin gestion de contacto - el pipeline esta incompleto**
El status "calificado" en el Kanban no lleva a ninguna accion concreta. No hay forma de registrar una llamada, enviar un mensaje, anotar el resultado de un contacto, ni definir un seguimiento. Un usuario no puede usar LeadScout para gestionar el ciclo comercial completo, solo para descubrir leads.

**2. Sin exportacion de datos**
No hay CSV, Excel ni PDF. El usuario no puede llevarse sus leads a su CRM, a una hoja de calculo, ni compartirlos con un cliente. Para agencias que venden el servicio de prospección, esto es bloqueante.

**3. Limite de 200 leads en el Kanban**
`getLeads({ limit: 200 })` en `oportunidades.tsx`. Un workspace activo con varios meses de uso supera facilmente ese limite y pierde visibilidad en el Kanban.

**4. Notas y actividad por lead ausentes**
No hay historial de interacciones. El campo `last_contact` existe en la DB pero no es editable desde ningun modulo. No se puede escribir que "llame el lunes y me dijeron que llame en agosto" - informacion critica para el trabajo comercial.

**5. El scoring de sitios web es incorrecto**
`website_has_ssl` siempre es `False` y `pagespeed_score` siempre es `None` en el pipeline del Explorer. Esto significa que todos los negocios con sitio web reciben una penalizacion de -15 puntos incorrecta (por "sin SSL"), y el score no refleja la calidad real del sitio. Un negocio con sitio rapido y HTTPS recibe el mismo score que uno con sitio roto.

**6. Busqueda de texto en Leads es incorrecta a escala**
El filtro `q` se aplica en Python post-query, no en SQL. El `total` devuelto por la API es el total antes del filtro de texto, lo que rompe la paginacion cuando hay busqueda activa.

---

### Alto Impacto - Mejoran retencion y valor percibido

**7. Sin columna "Ganado/Cerrado" en el Kanban**
El pipeline termina en "calificado". No hay estado final de "deal cerrado". Esto impide calcular conversion real y hace que el producto parezca incompleto para cualquier equipo de ventas.

**8. Plan y usage son completamente falsos en Settings**
Los limites mostrados (`leads_limit=500`, etc.) no corresponden a ningun plan real. El campo `searches_used` siempre muestra 0 aunque `search_audit_repository` guarda cada busqueda. Mostrar datos falsos destruye la confianza.

**9. Las preferencias operacionales no persisten**
Los 4 toggles de preferencias (auto-asignar, notas requeridas, archivar perdidos, reporte semanal) son decorativos. Si el usuario los cambia, el cambio no se guarda. Mismo problema con notificaciones y configuracion de seguridad.

**10. Campanas sin implementar bloquea el pitch de agencias**
Para agencias de marketing digital en El Salvador, la funcionalidad de campanas (sequencias de mensajes, templates de WhatsApp, seguimiento automatizado) es el diferenciador clave. Actualmente es un placeholder.

**11. Sin gestion de equipo real**
No hay forma de invitar usuarios. Los 5 miembros en Settings son datos hardcodeados. Un equipo de ventas de 3 personas no puede usar el producto de forma colaborativa porque todos ven lo mismo sin asignacion de leads.

**12. El analisis IA no se guarda**
Cada vez que el usuario presiona "Analizar con IA" se hace una llamada a OpenAI nueva. El resultado no se almacena en la DB. Si el usuario cierra el panel y vuelve, debe pagar por otro analisis. Esto tiene costo real y deteriora la experiencia.

---

### Mejoras UX - Pulido y experiencia

**13. Sin feedback de error en formularios de onboarding**
El onboarding no muestra errores de validacion campo por campo. Si algo falla, el usuario no sabe por que.

**14. El panel de detalle en Leads no permite editar**
Desde `LeadDetail` en `leads.tsx` el usuario puede ver el lead pero no puede cambiar su nombre, telefono, sitio web ni categoria. Tiene que ir al explorer o no puede hacerlo en absoluto.

**15. Paginacion del Leads no resetea la seleccion visualmente**
Al cambiar de pagina, `setSelectedId(null)` y luego se selecciona `leads[0]` automaticamente, pero no hay indicacion visual de que esto ocurrio.

**16. El Explorer no muestra cuantos leads nuevos se guardaron de forma prominente**
`saved_new` esta disponible en la respuesta pero el feedback post-busqueda es minimo. El usuario no sabe cuantos leads nuevos encontro vs cuantos ya tenia.

**17. Modo oscuro ausente**
El design system usa CSS custom properties para tokens pero no hay tema oscuro definido. Para uso intensivo (agencias que tienen el app abierto todo el dia), es una mejora de calidad de vida importante.

**18. Sin busqueda ni filtros en el Kanban**
El Kanban carga todos los leads y los muestra sin posibilidad de filtrar por categoria, zona o busqueda de texto. Con 100+ leads por columna se vuelve inmanejable.

**19. El tooltip y la inspeccion de marcadores del mapa es limitada**
Los marcadores del mapa muestran el nombre al hacer click pero no abren directamente el panel de detalle con toda la informacion del lead.

**20. Sin indicador de "ya contactado hoy"**
No hay forma rapida de saber si un lead fue contactado recientemente sin abrir el detalle.

---

### Tecnico - Deuda tecnica y escalabilidad

**21. Filtro de texto en Leads rompe paginacion**
`leads_repository.py` linea 44-45: el filtro `q` se aplica en Python sobre resultados ya paginados. Esto hace que `total` sea incorrecto y que paginas subsiguientes no funcionen bien con busqueda activa. Debe moverse a un filtro SQL con `ilike`.

**22. Sin busqueda full-text en Supabase**
No se usa `textSearch` de Supabase (PostgREST), que soporta `fts` con indices GIN. Implementarlo permitiria busqueda real multi-campo (nombre + direccion + categoria) con relevancia.

**23. Los limites del plan son constantes en el codigo**
`leads_limit=500, searches_limit=100` en `settings_service.py` estan hardcodeados. No hay tabla de planes ni relacion entre workspace y plan. Escalar a modelo freemium requiere refactorizar esto.

**24. `find_by_place_id` no filtra por workspace_id**
`leads_repository.py` linea 90-93: `find_by_place_id` busca en toda la tabla sin filtrar por workspace. Si dos workspaces diferentes descubren el mismo negocio, el segundo no podra guardarlo como nuevo lead propio. Es un bug de aislamiento de datos.

**25. Cache de Places sin invalidacion**
Las busquedas de Google Places se cachean con TTL fijo (definido en `cache.py`). Si un negocio abre/cierra o cambia su telefono, los resultados cacheados siguen apareciendo por dias.

**26. Coordinadas de Buenos Aires en explorer-data.ts**
`lib/explorer-data.ts` y `lib/location-service.ts` mencionan coordenadas placeholder de Buenos Aires. Aunque no afectan el funcionamiento real (el usuario configura su ubicacion), son un riesgo si algun path de codigo falla silenciosamente y usa el default.

**27. Sin tests automatizados en el frontend**
No hay archivos de test visibles en `c:\Proyects\leadscout-ai`. El backend tiene carpeta `tests/` pero no se verifico su contenido. Para un producto en produccion con logica de scoring y clasificacion IA, la ausencia de tests es un riesgo.

**28. El query filter de Leads hace post-filtrado en memoria**
Relacionado con el punto 21. A 500+ leads el tiempo de respuesta puede degradarse porque Supabase devuelve todos los registros de la pagina antes del filtro de texto Python.

---

## Roadmap Priorizado

### Sprint 1 - MVP Completable (1-2 semanas)

Objetivo: cerrar los huecos que hacen el producto inutilizable para un usuario real.

**1.1 - Corregir el filtro de texto en Leads (Critico)**
- Archivo: `c:\Proyects\leadscout-ai-backend\app\repositories\leads_repository.py`
- Cambiar el filtro `q` de post-procesamiento Python a un filtro SQL con `ilike` en `name` y `address`
- Usar `or_()` de Supabase para busqueda multi-campo
- Esto corrige el `total` incorrecto y hace la paginacion correcta

**1.2 - Activar PageSpeed y SSL en el pipeline del Explorer**
- Archivo: `c:\Proyects\leadscout-ai-backend\app\services\explorer_service.py`
- En `_process_place()`, si el lead tiene sitio web: llamar a `pagespeed_service.get_pagespeed_score(url)` y verificar si la URL empieza con `https://`
- Pasar esos valores reales a `scoring_service.calculate_score()`
- Resultado: scores mas precisos y el criterio "Rendimiento web bajo" funcional

**1.3 - Corregir `find_by_place_id` para aislar por workspace**
- Archivo: `c:\Proyects\leadscout-ai-backend\app\repositories\leads_repository.py`
- Agregar filtro `.eq("workspace_id", workspace_id)` en `find_by_place_id`
- Cambiar firma de la funcion para recibir `workspace_id`
- Actualizar llamada en `explorer_service.py` linea 249

**1.4 - Hacer editable `last_contact` desde Leads y Kanban**
- Frontend: agregar un `<input type="date">` en `LeadDetail` (en `leads.tsx`) que llame a `PATCH /api/leads/{id}` con `last_contact`
- El campo ya existe en `LeadUpdate` schema y en el endpoint

**1.5 - Guardar analisis IA en la base de datos**
- Backend: agregar campo `ai_analysis` (text, nullable) en la tabla `leads` de Supabase
- Agregar `ai_analysis` a `LeadUpdate` schema
- Frontend: en `ExplorerLeadDetail` y `LeadDetail`, hacer PATCH con el analisis recibido
- En la UI, mostrar el analisis guardado sin necesidad de volver a llamar a OpenAI

**1.6 - Reemplazar las coordenadas placeholder de Buenos Aires**
- Archivo: `c:\Proyects\leadscout-ai\lib\explorer-data.ts`
- Cambiar `DEFAULT_SEARCH_AREA.center` a coordenadas de San Salvador: `[-89.2182, 13.6929]`
- Revisar `lib/location-service.ts` para eliminar cualquier referencia a coordenadas de Argentina

**1.7 - KPIs de Leads sobre todos los leads, no solo la pagina actual**
- Opcion A (simple): agregar un endpoint `GET /api/leads/stats` que devuelva `high_priority_count`, `no_contact_count`, `avg_score` calculados en SQL sobre todo el workspace
- Opcion B: mover los KPIs al summary de reportes que ya existe

---

### Sprint 2 - Producto Vendible (2-4 semanas)

Objetivo: agregar las funcionalidades minimas para que un equipo de ventas pueda usar el producto de principio a fin.

**2.1 - Notas por lead (Historia de actividad)**
- Backend: nueva tabla `lead_notes` (id, lead_id, workspace_id, user_id, content, created_at)
- Nuevo endpoint `POST /api/leads/{id}/notes` y `GET /api/leads/{id}/notes`
- Frontend: agregar seccion de notas en el panel de detalle con textarea + boton guardar + lista cronologica de notas anteriores

**2.2 - Exportacion de leads a CSV**
- Backend: nuevo endpoint `GET /api/leads/export?format=csv` que devuelve los leads del workspace con los filtros activos en formato CSV
- Frontend: boton "Exportar CSV" en `leads.tsx` que descarga el archivo
- Campos: nombre, categoria, ubicacion, score, status, prioridad, telefono, sitio web, fecha creacion

**2.3 - Edicion inline de leads**
- Frontend: en `LeadDetail` dentro de `leads.tsx`, convertir los campos nombre, telefono, sitio web en inputs editables con boton "Guardar"
- Llamar a `PATCH /api/leads/{id}` con los campos modificados
- Mostrar estado de guardado (loading, ok, error)

**2.4 - Columna "Ganado" en el Kanban**
- Agregar `ganado` a `LeadStatus` enum en backend y frontend
- Agregar la quinta columna al Kanban en `oportunidades-kanban.tsx`
- Actualizar colores y badges en los componentes `badge.tsx`
- Actualizar el summary de reportes para incluir `ganado` en `by_status`

**2.5 - Busqueda y filtro en el Kanban**
- Frontend: agregar barra de busqueda y filtro de categoria encima del grid de columnas en `oportunidades-kanban.tsx`
- Filtrado client-side sobre `leads` state ya cargado

**2.6 - Corregir limites de Usage con datos reales**
- Backend `settings_service.py`: usar `search_audit_repository` para contar busquedas del mes actual en lugar de devolver 0
- Definir una tabla `plans` o una constante de configuracion por workspace para los limites reales
- Eliminar los numeros hardcodeados `leads_limit=500, searches_limit=100`

**2.7 - Persistir preferencias operacionales en backend**
- Backend: agregar columnas a la tabla `workspaces` (o tabla `workspace_preferences`) para las preferencias que actualmente son decorativas
- Nuevo endpoint `PATCH /api/settings/preferences`
- Frontend: conectar los toggles en `configuracion.tsx` para que llamen al API real

**2.8 - Feedback prominente de resultados en Explorer**
- Frontend: despues de busqueda exitosa, mostrar un toast o panel con "X leads nuevos encontrados, Y ya existian en tu workspace"
- El campo `saved_new` ya viene en la respuesta del backend

---

### Sprint 3 - Diferenciacion (1-2 meses)

Objetivo: funcionalidades que distinguen LeadScout de una hoja de calculo y justifican precio premium.

**3.1 - Modulo de Campanas (WhatsApp + Email)**
- Backend: tablas `campaigns` y `campaign_messages`
- Integracion con WhatsApp Business API (Meta) o Twilio para envio de mensajes
- Templates de mensaje por categoria de negocio (restaurantes, clinicas, etc.)
- Seguimiento de estado: enviado, leido, respondido
- Frontend: modulo completo reemplazando el placeholder actual

**3.2 - Gestion de equipo real**
- Backend: endpoint `POST /api/settings/team/invite` que envia email de invitacion via Supabase Auth
- Endpoint `DELETE /api/settings/team/{member_id}` para remover miembros
- Frontend: formulario de invitacion en Settings con campo email y rol
- Asignacion de leads a miembros especificos (campo `assigned_to` en la tabla leads)

**3.3 - Integraciones**
- Webhook saliente: notificar a URL externa cuando un lead cambia de status
- Importacion CSV: cargar leads manualmente desde un archivo
- Google Sheets: exportacion directa a una hoja de calculo del workspace
- Zapier / Make: conector para conectar LeadScout con otras herramientas

**3.4 - Reportes avanzados**
- Filtro de rango de fechas en el summary de reportes
- Breakdowns por agente asignado
- Breakdowns por zona geografica
- Tasa de conversion real (calificados / contactados)
- Exportacion de reporte a PDF
- Nuevo endpoint `GET /api/reports/summary?from=&to=&agent_id=&zone=`

**3.5 - Re-scoring automatico de leads existentes**
- Backend: tarea periodica (cron o endpoint manual) que re-corre el scoring con PageSpeed y SSL reales sobre leads ya guardados
- Actualizar score e issues cuando el sitio web de un negocio cambia
- Notificar al usuario cuando un lead de baja prioridad mejora su situacion digital

**3.6 - Zonas de trabajo configurables**
- Backend: tabla `work_zones` con CRUD completo
- Frontend: reemplazar `SETTINGS_WORK_ZONES` hardcodeado por datos reales
- Permitir definir zonas desde el mapa del Explorer con un poligono dibujado

**3.7 - Plan y facturacion real**
- Tabla `plans` con limites reales por plan
- Integracion con Stripe para suscripciones mensuales/anuales
- Upgrade/downgrade de plan desde Settings
- Enforcement real de limites en el backend (devolver 402 cuando se supera el limite)

---

## Funcionalidades Faltantes Detalladas

### Autenticacion
**Estado**: Completo con huecos menores
**Falta**:
- Cambio de contrasena autenticado (sin email de reset)
- 2FA real (TOTP o SMS)
- Edicion de telefono y titulo del perfil individual
**Impacto**: Bajo
**Complejidad**: Baja (cambio de contrasena) / Alta (2FA)

### Explorer
**Estado**: Completo con bugs de scoring
**Falta**:
- Integracion real de PageSpeed en el pipeline de scoring
- Verificacion de SSL en el pipeline de scoring
- Guardado de analisis IA en la DB
- Feedback prominente de cuantos leads nuevos se descubrieron
- Correccion de coordenadas default de Buenos Aires a El Salvador
**Impacto**: Alto (scoring), Medio (UX)
**Complejidad**: Baja (scoring y coordenadas), Media (guardado de analisis)

### Leads
**Estado**: Completo con huecos funcionales
**Falta**:
- Edicion de campos de un lead
- `last_contact` editable
- Exportacion CSV
- KPIs sobre todo el workspace (no solo la pagina)
- Busqueda SQL en lugar de post-procesamiento Python
**Impacto**: Alto (edicion y exportacion), Medio (KPIs y busqueda)
**Complejidad**: Baja (last_contact, exportacion, edicion simple), Media (busqueda SQL)

### Oportunidades / Kanban
**Estado**: Completo con pipeline incompleto
**Falta**:
- Status "Ganado" como columna final del pipeline
- Notas y historial de actividad por lead
- Busqueda y filtros dentro del Kanban
- Limite de 200 leads debe aumentarse o implementar paginacion por columna
- `last_contact` editable desde una tarjeta
**Impacto**: Alto (ganado, notas), Medio (filtros, limites)
**Complejidad**: Baja (ganado, filtros client-side), Media (notas con tabla nueva), Alta (paginacion por columna)

### Reportes
**Estado**: Completo pero estatico
**Falta**:
- Filtro de rango de fechas
- Breakdown por agente y por zona
- Exportacion PDF/CSV
- Comparacion con periodo anterior
- Metrica de conversion real (calificados/contactados)
**Impacto**: Medio (para uso diario), Alto (para reportar a clientes)
**Complejidad**: Media (rango de fechas, conversion real), Alta (breakdowns por agente/zona)

### Configuracion
**Estado**: Parcial (workspace real, resto placeholder)
**Falta**:
- Preferencias operacionales con backend real
- Zonas de trabajo editables (no hardcodeadas)
- Gestion de equipo: invitar, remover, asignar roles
- Plan y usage con datos reales
- Seguridad: 2FA, sesiones activas, rotacion de contrasena
**Impacto**: Alto (equipo, plan), Medio (preferencias, zonas), Bajo (seguridad avanzada)
**Complejidad**: Alta (equipo multi-tenant, planes, 2FA), Media (preferencias, zonas)

### Campanas
**Estado**: Placeholder
**Falta**:
- Todo: diseno de producto, backend, integraciones de mensajeria, UI
**Impacto**: Muy alto (diferenciador clave para agencias)
**Complejidad**: Muy alta (integracion con WhatsApp Business API, estado de campanas, templates)

### Integraciones
**Estado**: Placeholder
**Falta**:
- Webhooks salientes
- Importacion CSV
- Conectores con herramientas externas (Google Sheets, Zapier)
**Impacto**: Alto (flujo de trabajo con otras herramientas)
**Complejidad**: Media (webhooks, CSV), Alta (Zapier, conectores nativos)

---

## Oportunidades de Diferenciacion

**1. Scoring adaptado al mercado salvadoreno**
El scoring actual penaliza "sin sitio web" con -35 puntos. En El Salvador, muchos negocios legitimos operan 100% por WhatsApp o Facebook sin sitio web. Un scoring que considere presencia en WhatsApp Business, Facebook Business, Instagram Business y Google Business Profile como alternativas validas al sitio web seria mas representativo del mercado local.

**2. Deteccion de oportunidades digitales especificas por categoria**
Actualmente las "brechas" son genericas (sin sitio web, sin telefono, etc.). Para una papeleria en Santa Tecla, la brecha clave podria ser "sin Google Maps verificado". Para un restaurante en El Tunco, podria ser "sin menu digital" o "sin opcion de reserva online". Brechas especificas por categoria aumentan el valor percibido del analisis.

**3. Templates de pitch por tipo de negocio y brecha**
Combinando el analisis IA con templates especificos: "Para un restaurante sin sitio web en San Salvador, el mensaje de primer contacto que mejor convierte es...". Esto convierte a LeadScout en un entrenador de ventas ademas de un descubridor de leads.

**4. Integracion nativa con WhatsApp Business**
En El Salvador, WhatsApp es el canal de comunicacion dominante en B2B pequeño y mediano. Una integracion que permita enviar un mensaje de primer contacto directamente desde el panel de detalle del lead (con el numero ya cargado) seria una ventaja enorme vs. copiar el numero y abrir WhatsApp manualmente.

**5. Mapa de saturacion competitiva**
Mostrar en el mapa del Explorer no solo los leads descubiertos, sino tambien la densidad de competidores en cada zona. Un negocio de servicios digitales puede ver donde hay mas negocios sin presencia digital por km2 y priorizar esa zona.

**6. Alertas de nuevos negocios en zonas vigiladas**
Sistema de monitorizacion: "Cada lunes te enviamos los nuevos negocios que aparecieron en tus zonas esta semana sin sitio web o sin telefono". Esto convierte LeadScout en un producto con recurrencia automatica en lugar de requerir que el usuario vuelva a buscar manualmente.

**7. Exportacion de propuesta comercial automatizada**
Generar automaticamente un PDF de propuesta para un lead especifico con: nombre del negocio, score actual, brechas identificadas, servicios recomendados y precio estimado (basado en un catalogo configurable del workspace). Esto reduce drasticamente el tiempo entre descubrimiento del lead y envio de propuesta.

**8. Historico de scores para mostrar mejora potencial**
Si un cliente contratado mejora su presencia digital (agrega sitio web, obtiene ratings), el score de ese lead en LeadScout deberia cambiar. Mostrar la evolucion del score como prueba del impacto del trabajo realizado justifica la relacion comercial ante el cliente.

---

## KPIs para Medir el Exito del Producto

**Adquisicion**
- Registros nuevos por semana
- Tasa de completacion del onboarding (registro -> primer workspace creado)
- Costo por adquisicion de usuario (si hay pauta)

**Activacion**
- Porcentaje de usuarios que hacen al menos 1 busqueda en Explorer en los primeros 7 dias
- Leads descubiertos por workspace en la primera semana
- Tiempo desde registro hasta primer lead descubierto

**Retencion**
- DAU / WAU / MAU por workspace
- Busquedas en Explorer por semana por workspace activo
- Leads movidos de status en el Kanban por semana (indicador de uso real del pipeline comercial)
- Porcentaje de workspaces activos a 30 dias, 60 dias, 90 dias

**Valor del producto**
- Total de leads descubiertos en toda la plataforma (por mes)
- Promedio de leads por workspace por mes
- Tasa de conversion en el pipeline: nuevo -> contactado -> calificado -> ganado
- Score promedio de leads descubiertos (menor score = mayor oportunidad para los usuarios)
- Analisis IA generados por semana (indica engagement con la funcionalidad premium)

**Comerciales**
- MRR (Monthly Recurring Revenue) por plan
- Churn mensual por cohorte
- Expansion revenue (upgrades de plan)
- NPS mensual via encuesta en-app
- Leads exportados por workspace (proxy de uso en flujos reales de ventas)

**Tecnicos**
- Latencia del endpoint `/api/explorer/search` (objetivo < 8s para el 95th percentil)
- Tasa de error en llamadas a Google Places API
- Tasa de error en clasificacion OpenAI
- Costo OpenAI por busqueda (controlar que la clasificacion IA no escale el costo de forma insostenible)
- Porcentaje de lugares filtrados como "marca reconocida" vs "negocio local elegible" (calibrar el modelo)
