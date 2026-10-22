'use strict';

/**
 * IT Knowledge Base
 * -------------------------------------------------------------
 * Funcionalidades:
 * 1. Navegación entre vistas independientes.
 * 2. Gestión de rutas mediante hash para GitHub Pages.
 * 3. Navegación lateral jerárquica y resaltado de sección activa.
 * 4. Búsqueda global en las vistas y su contenido.
 * 5. Menú adaptable para pantallas pequeñas.
 * 6. Botones para copiar comandos y ejemplos de código.
 * 7. Navegación accesible y soporte de enlaces internos.
 *
 * Dependencias: ninguna.
 * -------------------------------------------------------------
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================
    // 1. REFERENCIAS AL DOM
    // =========================================================

    const main = document.getElementById('main-content');
    const sidebar = document.getElementById('sidebar');
    const sidebarNav = document.getElementById('sidebar-nav');
    const menuToggle = document.getElementById('menu-toggle');
    const searchForm = document.getElementById('site-search-form');
    const searchInput = document.getElementById('global-search');

    if (!main) {
        console.error(
            'IT Knowledge Base: no se encontró el elemento #main-content.'
        );
        return;
    }

    const HOME_PAGE = 'home';
    const SEARCH_PAGE = 'search-results';
    const SEARCH_VIEW_ID = 'search-results-view';
    const BASE_TITLE = 'IT Knowledge Base';

    let lastSearchQuery = '';

    // =========================================================
    // 2. FUNCIONES AUXILIARES
    // =========================================================

    /**
     * Normaliza texto para que la búsqueda no distinga entre
     * mayúsculas y minúsculas ni entre letras con y sin tilde.
     *
     * @param {string} value
     * @returns {string}
     */
    function normalizeText(value) {
        return String(value ?? '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLocaleLowerCase('es')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Busca una vista mediante su atributo data-view.
     *
     * Ejemplo:
     * getView('aws-faq')
     *
     * @param {string} pageKey
     * @returns {HTMLElement|null}
     */
    function getView(pageKey) {
        return Array.from(
            main.querySelectorAll('.page-view[data-view]')
        ).find((view) => view.dataset.view === pageKey) || null;
    }

    /**
     * Devuelve las vistas reales del sitio, sin incluir la vista
     * dinámica utilizada para los resultados de búsqueda.
     *
     * @returns {HTMLElement[]}
     */
    function getContentViews() {
        return Array.from(
            main.querySelectorAll('.page-view[data-view]')
        ).filter((view) => view.dataset.view !== SEARCH_PAGE);
    }

    /**
     * Actualiza el título de la pestaña según la sección actual.
     *
     * @param {HTMLElement|null} view
     * @param {string} pageKey
     */
    function updateDocumentTitle(view, pageKey) {
        if (pageKey === SEARCH_PAGE) {
            document.title = lastSearchQuery
                ? `Búsqueda: ${lastSearchQuery} | ${BASE_TITLE}`
                : `Búsqueda | ${BASE_TITLE}`;

            return;
        }

        const heading = view?.querySelector('h1');
        const headingText = heading?.textContent?.trim();

        document.title = headingText
            ? `${headingText} | ${BASE_TITLE}`
            : BASE_TITLE;
    }

    // =========================================================
    // 3. NAVEGACIÓN LATERAL
    // =========================================================

    /**
     * Resalta el enlace activo y abre los grupos necesarios
     * para mostrar su ubicación dentro del árbol de navegación.
     *
     * Ejemplo:
     * AWS -> FAQ de AWS
     *
     * Al entrar a FAQ de AWS, se abren automáticamente los
     * grupos Cloud y AWS en el menú lateral.
     *
     * @param {string} pageKey
     */
    function updateSidebar(pageKey) {
        if (!sidebarNav || pageKey === SEARCH_PAGE) {
            return;
        }

        const navLinks = Array.from(
            sidebarNav.querySelectorAll('a[data-page]')
        );

        const activeLink = navLinks.find(
            (link) => link.dataset.page === pageKey
        ) || null;

        // Actualiza el enlace activo y su estado accesible.
        navLinks.forEach((link) => {
            const isActive = link === activeLink;

            link.classList.toggle('is-active', isActive);

            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });

        // Cierra los grupos para volver a abrir solamente
        // los que contienen la sección activa.
        const groups = Array.from(
            sidebarNav.querySelectorAll('details.nav-group')
        );

        groups.forEach((group) => {
            group.open = false;
        });

        if (activeLink) {
            let parent = activeLink.parentElement;

            while (parent && parent !== sidebarNav) {
                if (
                    parent instanceof HTMLDetailsElement &&
                    parent.classList.contains('nav-group')
                ) {
                    parent.open = true;
                }

                parent = parent.parentElement;
            }
        } else if (pageKey === HOME_PAGE) {
            // Mantiene visible el primer grupo al regresar al inicio.
            const firstGroup = sidebarNav.querySelector(
                ':scope > details.nav-group'
            );

            if (firstGroup) {
                firstGroup.open = true;
            }
        }
    }

    /**
     * Cierra el menú móvil y sincroniza los atributos accesibles.
     */
    function closeMobileMenu() {
        if (!sidebar || !menuToggle) {
            return;
        }

        sidebar.classList.remove('is-open');

        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute(
            'aria-label',
            'Abrir menú de navegación'
        );
    }

    // =========================================================
    // 4. CAMBIO DE VISTAS
    // =========================================================

    /**
     * Muestra una única vista y oculta todas las demás.
     *
     * @param {string} pageKey Clave data-view de la sección.
     * @param {object} options Opciones de navegación.
     */
    function showPage(pageKey, options = {}) {
        const {
            updateUrl = true,
            scrollToTop = true
        } = options;

        const requestedView = getView(pageKey);
        const fallbackView = getView(HOME_PAGE);

        // Si la ruta no existe, se vuelve al inicio.
        const view = requestedView || fallbackView;
        const resolvedPage = requestedView ? pageKey : HOME_PAGE;

        if (!view) {
            return;
        }

        // Solo la vista seleccionada queda visible.
        main.querySelectorAll('.page-view[data-view]').forEach(
            (candidate) => {
                candidate.hidden = candidate !== view;
            }
        );

        // Actualiza los elementos de navegación.
        updateDocumentTitle(view, resolvedPage);
        updateSidebar(resolvedPage);
        closeMobileMenu();

        // Actualiza la URL sin recargar la página.
        if (updateUrl) {
            const nextHash = resolvedPage === HOME_PAGE
                ? '#view-home'
                : `#view-${resolvedPage}`;

            if (window.location.hash !== nextHash) {
                window.history.pushState(
                    { page: resolvedPage },
                    '',
                    nextHash
                );
            }
        }

        // Regresa al comienzo al cambiar de sección.
        if (scrollToTop) {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'auto'
            });

            // También cubre diseños donde el panel principal
            // tiene su propia barra de desplazamiento.
            if (typeof main.scrollTo === 'function') {
                main.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'auto'
                });
            }
        }
    }

    // =========================================================
    // 5. BÚSQUEDA GLOBAL
    // =========================================================

    /**
     * Crea la vista de búsqueda cuando se necesita.
     * No es obligatorio añadir esta sección al HTML manualmente.
     *
     * @returns {HTMLElement}
     */
    function ensureSearchView() {
        let section = document.getElementById(SEARCH_VIEW_ID);

        if (section) {
            return section;
        }

        section = document.createElement('section');

        section.id = SEARCH_VIEW_ID;
        section.className = 'page-view search-results-view';
        section.dataset.view = SEARCH_PAGE;
        section.setAttribute(
            'aria-labelledby',
            'search-results-title'
        );
        section.hidden = true;

        main.appendChild(section);

        return section;
    }

    /**
     * Genera una descripción breve para cada resultado.
     *
     * @param {HTMLElement} view
     * @param {string} query
     * @returns {string}
     */
    function createExcerpt(view, query) {
        const allText = (view.textContent || '')
            .replace(/\s+/g, ' ')
            .trim();

        if (!allText) {
            return 'Abre esta sección para consultar su contenido.';
        }

        const normalizedBody = normalizeText(allText);
        const normalizedQuery = normalizeText(query);

        const firstTerm = normalizedQuery
            .split(/\s+/)
            .find((term) => term.length > 1) || normalizedQuery;

        const matchIndex = firstTerm
            ? normalizedBody.indexOf(firstTerm)
            : -1;

        if (matchIndex < 0) {
            return allText.length > 180
                ? `${allText.slice(0, 177)}…`
                : allText;
        }

        const start = Math.max(0, matchIndex - 65);
        const end = Math.min(allText.length, matchIndex + 120);

        const prefix = start > 0 ? '…' : '';
        const suffix = end < allText.length ? '…' : '';

        return `${prefix}${allText.slice(start, end).trim()}${suffix}`;
    }

    /**
     * Calcula la relevancia de una vista con respecto a la consulta.
     * Los títulos y encabezados tienen mayor peso que el texto general.
     *
     * @param {HTMLElement} view
     * @param {string} query
     * @returns {number}
     */
    function scoreView(view, query) {
        const normalizedQuery = normalizeText(query);

        const terms = normalizedQuery
            .split(/\s+/)
            .filter(Boolean);

        const title = normalizeText(
            view.querySelector('h1')?.textContent || ''
        );

        const headings = normalizeText(
            Array.from(
                view.querySelectorAll('h2, h3, h4, summary')
            )
                .map((node) => node.textContent || '')
                .join(' ')
        );

        const content = normalizeText(view.textContent || '');

        if (!content) {
            return 0;
        }

        let score = 0;

        // Coincidencias de la frase completa.
        if (normalizedQuery && title.includes(normalizedQuery)) {
            score += 18;
        }

        if (normalizedQuery && headings.includes(normalizedQuery)) {
            score += 10;
        }

        if (normalizedQuery && content.includes(normalizedQuery)) {
            score += 5;
        }

        // Coincidencias individuales de cada término.
        let matchedTerms = 0;

        for (const term of terms) {
            let termMatched = false;

            if (title.includes(term)) {
                score += 8;
                termMatched = true;
            }

            if (headings.includes(term)) {
                score += 4;
                termMatched = true;
            }

            if (content.includes(term)) {
                score += 1;
                termMatched = true;
            }

            if (termMatched) {
                matchedTerms += 1;
            }
        }

        // Favorece resultados con todos los términos de la búsqueda.
        if (terms.length && matchedTerms === terms.length) {
            score += 12;
        }

        // Reduce la relevancia de coincidencias parciales.
        if (terms.length > 1 && matchedTerms < terms.length) {
            score -= (terms.length - matchedTerms) * 3;
        }

        return score;
    }

    /**
     * Construye y presenta la lista de resultados.
     *
     * El contenido se inserta mediante textContent para evitar
     * interpretar la consulta como HTML.
     *
     * @param {string} query
     * @returns {HTMLElement}
     */
    function renderSearchResults(query) {
        const section = ensureSearchView();

        section.replaceChildren();

        // Encabezado de resultados.
        const header = document.createElement('header');
        header.className = 'page-header search-results-header';

        const eyebrow = document.createElement('span');
        eyebrow.className = 'eyebrow';
        eyebrow.textContent = 'BÚSQUEDA GLOBAL';

        const title = document.createElement('h1');
        title.id = 'search-results-title';
        title.textContent = query
            ? `Resultados para “${query}”`
            : 'Buscar en la guía';

        const description = document.createElement('p');
        description.className = 'page-description';
        description.textContent = query
            ? 'Resultados encontrados en secciones, conceptos, comandos y preguntas de la guía.'
            : 'Escribe un término, servicio, comando o pregunta en el buscador superior.';

        header.append(eyebrow, title, description);
        section.appendChild(header);

        if (!query) {
            return section;
        }

        // Busca en todo el texto de cada vista, incluso dentro de
        // acordeones cerrados. No realiza peticiones a servidores.
        const candidates = getContentViews()
            .map((view) => ({
                view,
                key: view.dataset.view,
                title:
                    view.querySelector('h1')?.textContent?.trim() ||
                    view.dataset.view,
                score: scoreView(view, query)
            }))
            .filter((result) => result.score > 0)
            .sort(
                (a, b) =>
                    b.score - a.score ||
                    a.title.localeCompare(b.title, 'es')
            )
            .slice(0, 30);

        const summary = document.createElement('p');
        summary.className = 'search-result-count';
        summary.setAttribute('aria-live', 'polite');

        summary.textContent = candidates.length === 1
            ? 'Se encontró 1 sección relevante.'
            : `Se encontraron ${candidates.length} secciones relevantes.`;

        section.appendChild(summary);

        // Estado vacío cuando no existen coincidencias.
        if (candidates.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';

            const emptyTitle = document.createElement('h2');
            emptyTitle.textContent = 'No encontramos coincidencias';

            const emptyText = document.createElement('p');
            emptyText.textContent =
                'Prueba con un término más corto, el nombre de una herramienta o una sigla, por ejemplo: AWS, Docker, SQL o IAM.';

            emptyState.append(emptyTitle, emptyText);
            section.appendChild(emptyState);

            return section;
        }

        // Lista de resultados.
        const list = document.createElement('div');
        list.className = 'search-results-list';
        list.setAttribute('aria-label', 'Secciones encontradas');

        candidates.forEach(({ view, key, title: pageTitle, score }) => {
            const article = document.createElement('article');
            article.className = 'search-result-card';

            const link = document.createElement('a');
            link.className = 'search-result-link';
            link.href = `#view-${key}`;
            link.dataset.page = key;
            link.textContent = pageTitle;

            const excerpt = document.createElement('p');
            excerpt.className = 'search-result-excerpt';
            excerpt.textContent = createExcerpt(view, query);

            const metadata = document.createElement('span');
            metadata.className = 'search-result-meta';
            metadata.textContent = `Sección · Relevancia ${score}`;

            article.append(link, excerpt, metadata);
            list.appendChild(article);
        });

        section.appendChild(list);

        return section;
    }

    /**
     * Presenta los resultados de búsqueda y guarda la consulta
     * en la URL para permitir recargar o compartir la búsqueda.
     *
     * @param {string} query
     * @param {object} options
     */
    function performSearch(query, options = {}) {
        const {
            updateUrl = true,
            scrollToTop = true
        } = options;

        lastSearchQuery = String(query ?? '').trim();

        if (searchInput) {
            searchInput.value = lastSearchQuery;
        }

        renderSearchResults(lastSearchQuery);

        showPage(SEARCH_PAGE, {
            updateUrl: false,
            scrollToTop
        });

        if (updateUrl) {
            const nextHash =
                `#search=${encodeURIComponent(lastSearchQuery)}`;

            if (window.location.hash !== nextHash) {
                window.history.pushState(
                    {
                        page: SEARCH_PAGE,
                        query: lastSearchQuery
                    },
                    '',
                    nextHash
                );
            }
        }

        updateDocumentTitle(getView(SEARCH_PAGE), SEARCH_PAGE);
    }

    // =========================================================
    // 6. RESTAURACIÓN DE RUTAS
    // =========================================================

    /**
     * Interpreta la URL actual.
     *
     * Formatos admitidos:
     *   #view-home
     *   #view-cloud
     *   #view-aws-faq
     *   #search=terraform
     *   #aws-s3  (ancla de una ficha existente)
     */
    function renderFromLocation() {
        const rawHash = window.location.hash.replace(/^#/, '');

        // Página de inicio si la URL no tiene hash.
        if (!rawHash) {
            showPage(HOME_PAGE, {
                updateUrl: false,
                scrollToTop: false
            });

            return;
        }

        // Búsqueda guardada en la URL.
        if (rawHash.startsWith('search=')) {
            let query = '';

            try {
                query = decodeURIComponent(
                    rawHash.slice('search='.length)
                );
            } catch (error) {
                query = rawHash.slice('search='.length);
            }

            performSearch(query, {
                updateUrl: false,
                scrollToTop: false
            });

            return;
        }

        let decodedHash = rawHash;

        try {
            decodedHash = decodeURIComponent(rawHash);
        } catch (error) {
            // Mantiene el hash original si está mal codificado.
        }

        // Navegación normal entre vistas.
        const pageKey = decodedHash.startsWith('view-')
            ? decodedHash.slice('view-'.length)
            : null;

        if (pageKey && getView(pageKey)) {
            showPage(pageKey, {
                updateUrl: false,
                scrollToTop: false
            });

            return;
        }

        // También permite abrir enlaces directos a fichas internas,
        // como #aws-s3, cuando el elemento existe en el HTML.
        const anchorTarget = document.getElementById(decodedHash);

        if (anchorTarget) {
            const parentView = anchorTarget.closest(
                '.page-view[data-view]'
            );

            if (parentView) {
                showPage(parentView.dataset.view, {
                    updateUrl: false,
                    scrollToTop: false
                });
            }

            // Abre los acordeones que contengan el destino.
            let ancestor = anchorTarget;

            while (ancestor && ancestor !== main) {
                if (ancestor instanceof HTMLDetailsElement) {
                    ancestor.open = true;
                }

                ancestor = ancestor.parentElement;
            }

            window.requestAnimationFrame(() => {
                anchorTarget.scrollIntoView({
                    block: 'start',
                    behavior: 'auto'
                });
            });

            return;
        }

        // Una ruta desconocida siempre tiene una salida segura.
        showPage(HOME_PAGE, {
            updateUrl: false,
            scrollToTop: false
        });
    }

    // =========================================================
    // 7. EVENTOS DE NAVEGACIÓN
    // =========================================================

    /**
     * Utiliza delegación de eventos para que los enlaces del menú,
     * las tarjetas de inicio y los resultados de búsqueda funcionen
     * con el mismo mecanismo.
     */
    document.addEventListener('click', (event) => {
        if (!(event.target instanceof Element)) {
            return;
        }

        const pageLink = event.target.closest('a[data-page]');

        if (!pageLink) {
            return;
        }

        const pageKey = pageLink.dataset.page;

        if (!pageKey || !getView(pageKey)) {
            // No intercepta enlaces que no correspondan a vistas.
            return;
        }

        event.preventDefault();
        showPage(pageKey);
    });

    // =========================================================
    // 8. FORMULARIO DE BÚSQUEDA
    // =========================================================

    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            performSearch(searchInput.value);
        });
    }

    // =========================================================
    // 9. MENÚ PARA DISPOSITIVOS MÓVILES
    // =========================================================

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            const isOpen = sidebar.classList.toggle('is-open');

            menuToggle.setAttribute(
                'aria-expanded',
                String(isOpen)
            );

            menuToggle.setAttribute(
                'aria-label',
                isOpen
                    ? 'Cerrar menú de navegación'
                    : 'Abrir menú de navegación'
            );
        });

        // Cierra el menú si el usuario pulsa fuera de él.
        document.addEventListener('click', (event) => {
            if (!(event.target instanceof Node)) {
                return;
            }

            if (!sidebar.classList.contains('is-open')) {
                return;
            }

            const clickedInsideSidebar =
                sidebar.contains(event.target);

            const clickedToggle =
                menuToggle.contains(event.target);

            if (!clickedInsideSidebar && !clickedToggle) {
                closeMobileMenu();
            }
        });
    }

    // Cierra el menú con Escape.
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMobileMenu();
        }
    });

    // =========================================================
    // 10. BOTONES PARA COPIAR EJEMPLOS DE CÓDIGO
    // =========================================================

    /**
     * Añade un botón "Copiar" en cada bloque <pre><code>.
     * Los botones se crean una sola vez por bloque.
     */
    function addCopyButtons() {
        main.querySelectorAll('pre').forEach((pre) => {
            if (pre.querySelector('.copy-code-button')) {
                return;
            }

            const code = pre.querySelector('code');

            if (!code) {
                return;
            }

            pre.classList.add('code-block');

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'copy-code-button';
            button.textContent = 'Copiar';
            button.setAttribute(
                'aria-label',
                'Copiar código al portapapeles'
            );

            button.addEventListener('click', async () => {
                const codeText = code.textContent || '';

                try {
                    // Clipboard API en contextos seguros.
                    if (
                        navigator.clipboard &&
                        window.isSecureContext
                    ) {
                        await navigator.clipboard.writeText(codeText);
                    } else {
                        // Alternativa para navegadores o contextos
                        // donde Clipboard API no está disponible.
                        const temporaryInput =
                            document.createElement('textarea');

                        temporaryInput.value = codeText;
                        temporaryInput.setAttribute('readonly', '');

                        temporaryInput.style.position = 'fixed';
                        temporaryInput.style.opacity = '0';
                        temporaryInput.style.pointerEvents = 'none';

                        document.body.appendChild(temporaryInput);
                        temporaryInput.select();

                        const copied =
                            document.execCommand('copy');

                        temporaryInput.remove();

                        if (!copied) {
                            throw new Error(
                                'El navegador no permitió copiar el texto.'
                            );
                        }
                    }

                    button.textContent = 'Copiado';
                    button.classList.add('is-copied');
                } catch (error) {
                    console.warn(
                        'No se pudo copiar el código:',
                        error
                    );

                    button.textContent = 'Selecciona el código';
                }

                window.setTimeout(() => {
                    button.textContent = 'Copiar';
                    button.classList.remove('is-copied');
                }, 1800);
            });

            pre.appendChild(button);
        });
    }

    // =========================================================
    // 11. SEGURIDAD DE ENLACES EXTERNOS
    // =========================================================

    /**
     * Refuerza noopener y noreferrer para enlaces que se abren
     * en una pestaña nueva.
     */
    function secureExternalLinks() {
        main.querySelectorAll('a[target="_blank"]').forEach((link) => {
            const relTokens = new Set(
                (link.getAttribute('rel') || '')
                    .split(/\s+/)
                    .filter(Boolean)
            );

            relTokens.add('noopener');
            relTokens.add('noreferrer');

            link.setAttribute(
                'rel',
                Array.from(relTokens).join(' ')
            );
        });
    }

    // =========================================================
    // 12. INICIALIZACIÓN
    // =========================================================

    // Prepara los ejemplos de código y los enlaces del contenido inicial.
    addCopyButtons();
    secureExternalLinks();

    // Muestra la sección indicada en la URL o el inicio.
    renderFromLocation();

    // Permite que atrás y adelante restauren la vista correcta.
    window.addEventListener('popstate', renderFromLocation);

    // Responde a cambios de hash realizados desde la barra del navegador
    // o por enlaces internos que no usan el atributo data-page.
    window.addEventListener('hashchange', renderFromLocation);
});