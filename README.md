# IT Knowledge Base

Guía de estudio en español para consultar conceptos, herramientas, ejemplos,
comandos y preguntas de entrevista de distintas áreas de tecnología. El sitio
es estático y no requiere frameworks, dependencias ni proceso de compilación.

**Sitio publicado:** <https://kevingualteros.github.io/conceptos/>

## Contenido

La guía organiza sus temas en secciones navegables que incluyen fundamentos,
explicaciones, ejemplos de referencia, errores frecuentes, preguntas de repaso
y enlaces a documentación oficial. Entre las áreas cubiertas están:

- Cloud: AWS, Azure, Google Cloud, OCI, arquitectura, seguridad y FinOps.
- DevOps, Git, CI/CD, GitHub Actions, GitLab CI y SRE.
- Contenedores, Docker, Kubernetes e infraestructura como código.
- Linux, Bash, SSH, redes, subnetting, DNS y diagnóstico.
- Desarrollo Full Stack, HTML, CSS, JavaScript, frontend, backend y APIs.
- Datos, SQL, bases de datos, ingeniería de datos y BI.
- Seguridad, IAM, autenticación, gestión de secretos y observabilidad.

Los ejemplos son material de aprendizaje. Antes de adaptar comandos o
configuraciones a un entorno real, revisa sus permisos, rutas, versiones y
posibles efectos.

## Funcionalidades

- Navegación por secciones con rutas basadas en el fragmento de la URL.
- Búsqueda global en los temas de la guía.
- Contenido desplegable para estudiar por partes.
- Botones para copiar bloques de código.
- Diseño adaptable y controles preparados para navegación con teclado.

## Archivos del proyecto

| Archivo | Propósito |
| --- | --- |
| `index.html` | Estructura, contenido y ejemplos de estudio. |
| `style.css` | Estilos, diseño adaptable y presentación de bloques de código. |
| `script.js` | Navegación, búsqueda, menú y acciones de copiar. |
| `.github/workflows/deploy.yml` | Publicación automática en GitHub Pages. |

## Ver el sitio localmente

Puedes abrir `index.html` directamente en un navegador. Si prefieres servirlo
localmente, ejecuta desde la raíz del repositorio:

```bash
python -m http.server 8000
```

Después visita <http://localhost:8000>. El servidor local es opcional y no forma
parte de los requisitos de publicación.

## Despliegue en GitHub Pages

El workflow de GitHub Actions publica `index.html`, `style.css` y `script.js`
cuando hay un push a `main`. También admite ejecución manual desde **Actions**.
En la configuración del repositorio, selecciona **Settings → Pages → Build and
deployment → GitHub Actions** como fuente de publicación.

La URL pública del sitio es <https://kevingualteros.github.io/conceptos/>.
El estado y los registros de cada publicación se encuentran en la pestaña
**Actions** del repositorio.

## Contribuir a la guía

- Añade o actualiza el material en `index.html`, conservando los identificadores
  de navegación (`data-view`, `data-page` y los destinos de los enlaces).
- Usa nombres de archivo y rutas relativos que coincidan exactamente con los
  archivos del repositorio; GitHub Pages distingue mayúsculas y minúsculas.
- Mantén los estilos en `style.css` y el comportamiento en `script.js`; evita
  agregar código CSS o JavaScript en línea.
- Comprueba los enlaces internos y la vista en un navegador antes de publicar.
- No incluyas credenciales, secretos ni datos personales en ejemplos o commits.
