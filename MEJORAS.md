# Web de S&H Abogadas — propuesta

**En línea:** https://shabogadas-propuesta.netlify.app (con `noindex`, no la indexa Google)

Se genera con `py clients/_web-shabogadas/build.py` (plantillas Jinja + `contenido.py`). Salida: esta
carpeta. Enlaces relativos: funciona en Netlify, en demos.ringuno.com/shabogadas/web/ y abriendo
`index.html` a mano.

## Mapa de la web (22 páginas)

| Ruta | Qué es |
|---|---|
| `/` | Landing completa: hero, quiénes somos, servicios con todos los trámites desplegables, servicios online, las 8 prioridades, banda, actualidad, el despacho (fichas + vídeo) y contacto |
| `/despacho/` | Bios completas con nº de colegiada, vídeo de presentación, las ocho prioridades |
| `/servicios/` | Las 4 áreas en tarjetas + todos los trámites en desplegables |
| `/servicios/derecho-civil/` · `/derecho-de-familia/` · `/extranjeria/` · `/mediacion/` | Una página por área: trámites agrupados, cómo trabajamos, artículos relacionados |
| `/servicios-online/` | Siete servicios a distancia (formato de aobabogados.com), tres pasos, preguntas frecuentes, formulario |
| `/abogado-divorcio-denia/` · `/abogado-comunidad-propietarios-valencia/` | Sus dos páginas SEO, texto literal |
| `/actualidad/` | Portada del blog con destacada + rejilla |
| `/actualidad/<entrada>/` | Las 7 entradas, texto íntegro, foto de portada optimizada, artículos relacionados |
| `/contacto/` | Formulario, teléfonos, correo, dos despachos con mapa de Google (se carga al pulsar) |
| `/aviso-legal/` · `/privacidad/` · `/cookies/` | Textos legales (con tres huecos marcados: NIF, plazo de conservación, tipografía) |

## Qué se ha copiado

Todo lo que hay publicado en shabogadas.com: inicio, el despacho, servicios, contacto, las dos
páginas SEO y las siete entradas del blog con su texto completo. Fotos, vídeo y logo de su servidor.

Lo que es nuestro (para que se sepa): las entradillas de cada área, las descripciones de los siete
servicios online y las preguntas frecuentes (todas apoyadas en afirmaciones suyas: toda España,
telemático, presupuesto cerrado, facilidades de pago), la frase de cierre del árbol, y la corrección
de un par de erratas en títulos del blog («juríca» → «jurídica», mayúsculas).

## Qué se ha mejorado respecto a la web actual

**Estructura y conversión**
- De cuatro páginas planas a una web con subpáginas enlazadas: cada área tiene su URL, cada entrada
  del blog tiene tarjeta con foto, y todo termina en una llamada a la acción.
- Teléfonos pulsables, WhatsApp fijo, "Cómo llegar", formulario con área y franja horaria.
- Sección de servicios online que no existía (lo más parecido era una frase suelta).

**Legal** (lo más urgente de la web actual)
- Casilla RGPD obligatoria en el formulario; aviso legal, privacidad y cookies redactados.
- Los mapas de Google no se cargan hasta que el usuario pulsa: sin cookies de terceros sin permiso.

**SEO y técnica**
- Título y descripción propios en cada página, `og:image`, datos estructurados `LegalService`.
- Un CSS y un JS compartidos (42 KB + 5 KB), sin WordPress ni jQuery. Fotos del blog reducidas a
  ≤ 1400 px (de 2-4 MB a 30-160 KB cada una).
- Modo oscuro, `prefers-reduced-motion`, foco visible, saltar al contenido.

**Las prioridades ("¿Qué es S&H Abogadas?")** van en `/despacho/` como rejilla de ocho cuadros. Los
dos árboles con scroll (baobab y árbol alto) se retiraron el 21-sep a petición de Marc; el generador
sigue en `scratchpad` por si se recuperan.

## Diecinueve versiones para elegir

Abre `versiones.html`. Mismos textos, mismas 22 páginas y mismos contenidos; cambia el diseño, la
tipografía y el movimiento.

| Versión | Dónde | Cómo es |
|---|---|---|
| **Clásica** | `/` | La actual. Limpia, clara y directa. |
| **Editorial** | `/v/editorial/` | Papel y tinta: serif Newsreader, fondo crema, filetes en vez de sombras, fotos en blanco y negro, aparición lenta y un subrayado que crece bajo cada titular. |
| **Titán** | `/v/titan/` | Marca grande: titulares enormes en mayúsculas, bloques de color a sangre, bordes de 3 px, sombras duras que se hunden al pulsar y una marquesina infinita bajo el hero. |
| **Noche** | `/v/noche/` | Oscura y cara: cristal esmerilado, halos azules, degradado animado en el titular, luz que se enciende al pasar por las tarjetas. |
| **Mediterráneo** | `/v/mediterraneo/` | Dénia: cal, azul marino, terracota. Serif Fraunces, curvas asimétricas en las fotos, un sol de fondo y todo entra flotando. |
| **Suiza** | `/v/suiza/` | Retícula internacional: rejilla visible, tipografía pequeña y precisa, un único acento rojo, fotos en blanco y negro y casi nada de animación. La más corporativa. |
| **Boutique** | `/v/boutique/` | Verde profundo y oro fino, Playfair Display en cursiva, secciones centradas, marcos con filete separado. Cara sin gritarlo. |
| **Suave** | `/v/suave/` | Amable: Outfit, pasteles (lila, menta, melón), esquinas muy redondas, sombras de color y entradas con rebote. La menos "bufete". |
| **Expediente** | `/v/expediente/` | El despacho por dentro: papel pautado, tinta azul, tipografía IBM Plex, todo lo administrativo en mono, fichas con franja y los números como «EXP. 01». |
| **Tinta** | `/v/tinta/` | Blanco y negro puro, sin un solo color. Space Grotesk a 140 px, secciones alternas invertidas a negro, fotos panorámicas a sangre y el contenido que se descubre como una cortina. |
| **Cartel** | `/v/cartel/` | Bauhaus: círculo amarillo y arco azul asomando, foto en arco, tarjetas que se rellenan de color al pasar, tipografía geométrica Poppins. |
| **Institucional** | `/v/institucional/` | El peso de la toga: cinta azul y oro fija arriba, serif Libre Baskerville, tarjetas con filete superior y tablas ordenadas. La más formal. |
| **Revista** | `/v/revista/` | Maquetación de revista: DM Serif Display, entradilla a dos columnas, capitular al empezar cada artículo y números de sección grandes. |
| **Zen** | `/v/zen/` | El aire como material: letra pequeña, composición asimétrica, líneas finísimas, sin iconos y un único punto rojo. Mucho silencio. |
| **Atardecer** | `/v/atardecer/` | Luz de tarde: degradados cálidos de fondo, titular con degradado que se mueve, bordes de color en las tarjetas y tipografía redonda. |
| **Cristal** | `/v/cristal/` | Clara y aireada: manchas de color desenfocadas de fondo y tarjetas de vidrio esmerilado encima. El contenido entra desenfocado y se aclara. |
| **Setenta** | `/v/setenta/` | Ocre, mostaza y verde oliva, slab serif Bitter, arcos en las fotos y barra de garantías en forma de píldora marrón. Fotos viradas a sepia. |
| **Columna** | `/v/columna/` | La única que cambia la estructura: el rótulo y el título de cada sección se quedan quietos a la izquierda mientras el contenido pasa al lado. Sobria y muy de estudio. |
| **Mármol** | `/v/marmol/` | Piedra clara y Cormorant Garamond de alto contraste: vetas suaves de fondo, filetes de bronce, marcos separados de la foto y mucho aire. |

Todas comparten `assets/` (una sola copia de fotos y vídeo) y el mismo `site.css`; cada variante añade
su hoja `assets/tema-<nombre>.css` (6-10 KB) y su tipografía. Se generan de una vez con
`py clients/_web-shabogadas/build.py`; la lista está en `TEMAS` y las fuentes en `FUENTES`.
Todas llevan el modo revisión: `?revision=1` funciona igual en las diecinueve, y el informe dice al principio qué versión estaba mirando.

## Modo revisión (para que ellas propongan cambios)

Enlace para Elisabeth e Isabel: **https://shabogadas-propuesta.netlify.app/?revision=1**

Con ese enlace (y solo con ese) aparece abajo a la izquierda la pastilla «Revisión activa». Una visita
normal no ve nada: el modo se activa por `?revision=1` y se recuerda en su navegador hasta que pulsan
«Salir del modo revisión» (o abren la web con `?revision=0`).

Qué pueden hacer:
- **Escribir encima de cualquier texto** de la web (títulos, párrafos, listas, direcciones). Lo cambiado
  se marca en amarillo y se guarda en su navegador aunque cierren la pestaña o cambien de página.
- **Cambiar o quitar botones**: los botones del contenido también se editan. Si se borra su texto (o se
  pulsa «Quitar» en el recuadro) quedan tachados y salen en el informe como «QUITAR este botón».
- **Dejar una nota** en cualquier sección con el botón «💬 Nota» (para fotos, datos que faltan, dudas).
- **Elegir entre 5 versiones de cada copy**: al pinchar en uno de los 24 textos que mandan (titulares,
  entradillas y llamadas a la acción) sale un recuadro con qué tipo de sección es, por qué está escrito
  así y cinco alternativas. Se prueban con un clic, se puede seguir escribiendo encima y se queda la
  última. Los textos sin variantes se editan igual, a mano. Están en `static/variantes.json`.
- **Mandarlo todo** desde el panel: «Copiar todo», «Descargar» (un .md) o «Enviar por WhatsApp».
  El informe sale ordenado por página y sección, con *Antes* / *Ahora* de cada texto.

Para aplicarlo: los textos están en `clients/_web-shabogadas/contenido.py`; se busca el texto de «Antes»,
se cambia y se ejecuta `py clients/_web-shabogadas/build.py`. Nada de lo que ellas editan toca la web
publicada: es solo una propuesta que llega en forma de lista.

Detalles: en modo revisión los enlaces del contenido no navegan (para poder pinchar y editar); se cambia
de página con el menú de arriba o con la pestaña «Ir a…» del panel. El modo vive en `assets/revision.js`
(9 KB) y solo se descarga cuando está activado.

## Pendiente de hablar con ellas

1. Dónde debe llegar el formulario (correo, CRM, WhatsApp). Ahora abre el correo del visitante.
2. NIF y plazo de conservación para los textos legales.
3. Si mantienen el Facebook (perfil con nombre antiguo).
4. Reseñas de Google: no hay ni una en la web y es el bloque que más convierte en un despacho.
5. Fotos: las del blog son de stock (Pexels). Las suyas de verdad, mejor.
