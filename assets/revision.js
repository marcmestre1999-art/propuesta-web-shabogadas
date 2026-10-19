/* Modo revisión de la web de S&H Abogadas.
   Se carga solo si la URL trae ?revision=1 o si ya se activó antes en este navegador.
   Nada de esto existe para una visita normal. Todo se guarda en el propio navegador;
   al final se exporta un resumen para pasárselo a quien monta la web. */
(function () {
  'use strict';

  var LS = 'sh-revision-v1';
  var SEL = 'h1,h2,h3,h4,p,li,address,figcaption,.sum-note,.video-cap,.btn,.more';
  var R = (function () {
    var s = document.currentScript || document.querySelector('script[src*="revision.js"]');
    return s ? s.src.replace(/assets\/revision\.js.*$/, '') : '';
  })();

  /* ── estado ────────────────────────────────────────────── */
  function cargar() {
    try { return JSON.parse(localStorage.getItem(LS)) || null; } catch (e) { return null; }
  }
  function guardar() {
    try { localStorage.setItem(LS, JSON.stringify(st)); } catch (e) {}
    pintarContador();
    pintaGuias();
  }
  var st = cargar() || { textos: {}, notas: [] };
  var VAR = {};
  try {
    fetch(R + 'assets/variantes.json').then(function (r) { return r.json(); }).then(function (j) { VAR = j; });
  } catch (e) {}

  var VBASE = (function () {
    var m = location.pathname.match(/^(.*\/v\/[^\/]+\/)/);
    return m ? m[1] : R;
  })();
  var VERSION = (function () {
    var m = location.pathname.match(/\/v\/([^\/]+)\//);
    return m ? m[1] : 'clasica';
  })();

  st.secciones = st.secciones || {};
  var qEst = location.search.match(/[?&]estilo=([^&]*)/);
  if (qEst) {
    st.estilo = decodeURIComponent(qEst[1]) || 'clasica';
    try { localStorage.setItem(LS, JSON.stringify(st)); } catch (e) {}
  }

  /* Pregunta que guía cada sección (por el nombre de la sección) */
  var PREG = [
    [/otro estilo|ninguna/i, '¿Qué webs os gustan, de abogados o de lo que sea? Colores, fotos, la sensación que queréis dar.'],
    [/dénia y valencia|^s&h/i, 'Es lo primero que se ve. ¿Qué tiene que entender alguien en cinco segundos? ¿Os vale la foto?'],
    [/quiénes somos|quién va a llevar/i, '¿Cómo os presentaríais vosotras? Lo que os hace distintas, años de experiencia, idiomas…'],
    [/online/i, '¿Qué hacéis de verdad a distancia? ¿Hay precios cerrados que queráis enseñar?'],
    [/servicios|qué llevamos|al detalle/i, '¿Falta algún servicio o sobra alguno? ¿Cuál es el que más os interesa que entre?'],
    [/prioridades/i, '¿Estas son vuestras prioridades? ¿Os gusta el árbol o preferís algo más sencillo?'],
    [/actualidad|seguir leyendo/i, '¿Qué os preguntan más los clientes? De ahí salen los próximos artículos.'],
    [/el despacho/i, '¿Tenéis fotos del despacho o del equipo que queráis poner?'],
    [/cómo trabajamos|cómo funciona/i, '¿Así es como trabajáis? Contad los pasos reales con un cliente nuevo.'],
    [/preguntas frecuentes/i, '¿Qué preguntas os hacen siempre en la primera llamada?'],
    [/contacto|antes de escribirnos|empezamos/i, '¿Cómo preferís que os contacten: WhatsApp, llamada o formulario? ¿En qué horario?']
  ];
  function pregunta(n) {
    for (var i = 0; i < PREG.length; i++) if (PREG[i][0].test(n)) return PREG[i][1];
    return '¿Qué querríais tener aquí? Lo que sobra, lo que falta o lo que cambiaríais.';
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  var RUTA = (function () {
    var p = location.pathname.replace(/index\.html$/, '');
    if (p.charAt(p.length - 1) !== '/') p += '/';
    return p;
  })();
  var TITULO = (document.body.getAttribute('data-pagina') || (document.title || '').split('—')[0]).trim();

  function nEdits() { return Object.keys(st.textos).length; }
  function nNotas() { return st.notas.length; }

  /* ── estilos (se inyectan solo aquí) ───────────────────── */
  var CSS = [
    '.rev-ui{font-family:Archivo,system-ui,sans-serif;box-sizing:border-box}',
    '.rev-ui *{box-sizing:border-box}',
    '.rev-pill{position:fixed;left:18px;bottom:18px;z-index:120;display:flex;align-items:center;gap:10px;',
    'background:#101014;color:#fff;border:0;border-radius:999px;padding:12px 18px;font:600 14px Archivo,system-ui,sans-serif;',
    'cursor:pointer;box-shadow:0 12px 30px -10px rgba(16,16,20,.6)}',
    '.rev-pill:hover{transform:translateY(-2px)}',
    '.rev-pill b{background:#d0deff;color:#101014;border-radius:999px;padding:2px 9px;font-size:12.5px}',
    '.rev-pill.rev-off{background:#fff;color:#101014;border:1.5px solid #e3e6ef}',
    'body.rev-on [data-rev]{outline:1.5px dashed transparent;outline-offset:3px;border-radius:3px;transition:outline-color .15s,background .15s;cursor:text}',
    'body.rev-on [data-rev]:hover{outline-color:#a3b8ff;background:rgba(208,222,255,.35)}',
    'body.rev-on [data-rev]:focus{outline:2px solid #28407f;background:rgba(208,222,255,.5)}',
    'body.rev-on [data-rev].rev-tocado{background:rgba(255,224,130,.4);outline-color:#e0a800}',
    '[data-rev].rev-borrado{opacity:.4;text-decoration:line-through;text-decoration-thickness:2px}',
    '.rev-var .quitar{margin-top:11px;display:flex;gap:8px}',
    '.rev-var .quitar button{background:#3a2626;color:#ffb4a8;border:0;border-radius:999px;padding:7px 14px;font:600 12.5px Archivo,system-ui,sans-serif;cursor:pointer}',
    '.rev-var .quitar button:hover{background:#5a3030}',
    '.rev-var .quitar button.mic{background:#26262e;color:#fff}',
    '.rev-var .quitar button.mic:hover{background:#3a3a44}',
    '.rev-var .quitar button.mic.grabando{background:#c0392b;color:#fff}',
    '.rev-nota-form .mic{width:100%;background:#f4f6fb;border:1.5px solid #e3e6ef;border-radius:9px;padding:9px;',
    'font:600 13px Archivo,system-ui,sans-serif;cursor:pointer;margin-bottom:8px;color:#101014}',
    '.rev-nota-form .mic.grabando{background:#c0392b;border-color:#c0392b;color:#fff}',
    '.rev-nota-form .dos{display:flex;gap:8px;margin-bottom:8px}',
    '.rev-nota-form .dos .mic{margin:0}',
    'body.rev-on main a{cursor:not-allowed}',
    '.rev-sec{position:absolute;right:8px;top:8px;z-index:60;display:flex;gap:6px}',
    '.rev-sec button{background:#101014;color:#fff;border:0;border-radius:999px;padding:7px 13px;font:600 12px Archivo,system-ui,sans-serif;cursor:pointer;opacity:.28;transition:opacity .15s}',
    'section:hover > .rev-sec button,.rev-sec button:hover{opacity:1}',
    '.rev-panel{position:fixed;right:0;top:0;bottom:0;width:min(430px,100%);background:#fff;z-index:130;display:flex;flex-direction:column;',
    'box-shadow:-20px 0 50px -30px rgba(16,16,20,.6);transform:translateX(100%);transition:transform .28s cubic-bezier(.4,0,.2,1)}',
    '.rev-panel.abierto{transform:none}',
    '.rev-head{padding:18px 20px;border-bottom:1px solid #e3e6ef;display:flex;align-items:center;gap:12px}',
    '.rev-head h2{margin:0;font-size:17px;font-weight:600;flex:1;color:#101014}',
    '.rev-head button{background:none;border:0;font-size:22px;cursor:pointer;color:#6a6a76;line-height:1}',
    '.rev-tabs{display:flex;gap:4px;padding:12px 20px 0}',
    '.rev-tabs button{flex:1;background:#f4f6fb;border:0;border-radius:9px;padding:9px;font:600 13px Archivo,system-ui,sans-serif;cursor:pointer;color:#55555e}',
    '.rev-tabs button.on{background:#101014;color:#fff}',
    '.rev-body{flex:1;overflow:auto;padding:16px 20px}',
    '.rev-vacio{color:#6a6a76;font-size:14px;line-height:1.6;margin:8px 0}',
    '.rev-item{border:1px solid #e3e6ef;border-radius:11px;padding:13px 14px;margin-bottom:10px;font-size:13.5px;color:#3a3a44}',
    '.rev-item .ru{font-size:11px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:#28407f;margin-bottom:7px}',
    '.rev-item del{color:#9a5a5a;text-decoration:line-through;display:block;margin-bottom:4px}',
    '.rev-item ins{color:#1d6b3f;text-decoration:none;display:block;font-weight:500}',
    '.rev-item .acc{margin-top:9px;display:flex;gap:8px}',
    '.rev-item .acc button{background:none;border:1px solid #e3e6ef;border-radius:7px;padding:5px 10px;font:500 12px Archivo,system-ui,sans-serif;cursor:pointer;color:#55555e}',
    '.rev-item .acc button:hover{border-color:#101014;color:#101014}',
    '.rev-nota-form{margin-bottom:14px}',
    '.rev-nota-form select,.rev-nota-form textarea{width:100%;border:1.5px solid #e3e6ef;border-radius:9px;padding:10px 12px;font:400 14px Archivo,system-ui,sans-serif;margin-bottom:8px;background:#fff;color:#101014}',
    '.rev-nota-form textarea{min-height:88px;resize:vertical}',
    '.rev-foot{border-top:1px solid #e3e6ef;padding:14px 20px;display:grid;gap:8px}',
    '.rev-foot .fila{display:flex;gap:8px}',
    '.rev-btn{flex:1;border:0;border-radius:999px;padding:12px;font:600 13.5px Archivo,system-ui,sans-serif;cursor:pointer}',
    '.rev-btn.p{background:#101014;color:#fff}',
    '.rev-btn.s{background:#fff;color:#101014;border:1.5px solid #e3e6ef}',
    '.rev-btn.wa{background:#25d366;color:#04310f}',
    '.rev-btn.x{background:none;color:#9a5a5a;border:0;font-size:12.5px;padding:4px}',
    '.rev-ayuda{position:fixed;left:18px;bottom:92px;width:min(365px,calc(100vw - 36px));z-index:125;max-height:calc(100vh - 130px);overflow:auto;background:#101014;color:#fff;border-radius:14px;padding:16px 18px;font:400 13.5px/1.5 Archivo,system-ui,sans-serif;box-shadow:0 20px 50px -20px rgba(0,0,0,.7)}',
    '.rev-ayuda b{display:block;font-size:15px;margin-bottom:10px}','.rev-ayuda ul{margin:0 0 10px;padding:0;list-style:none}','.rev-ayuda li{margin-bottom:7px;padding-left:25px;text-indent:-25px}','.rev-ayuda li b{display:inline;font-size:13.5px}','.rev-ayuda i{color:#9296a4;display:block;margin:0 0 12px;font-size:12.5px;line-height:1.45}',
    '.rev-ayuda button{background:#fff;color:#101014;border:0;border-radius:999px;padding:9px 16px;font:600 13px Archivo,system-ui,sans-serif;cursor:pointer}',
    '.rev-aviso{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:140;background:#101014;color:#fff;',
    'padding:12px 20px;border-radius:999px;font:500 13.5px Archivo,system-ui,sans-serif;box-shadow:0 12px 30px -10px rgba(0,0,0,.6)}',
    '.rev-var{position:fixed;z-index:128;width:min(420px,calc(100vw - 24px));background:#101014;color:#fff;border-radius:13px;',
    'padding:14px 16px;box-shadow:0 20px 50px -20px rgba(0,0,0,.75);font:400 13px/1.55 Archivo,system-ui,sans-serif}',
    '.rev-var .tipo{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#d0deff;margin-bottom:6px}',
    '.rev-var .porque{color:#c9cbd4;margin-bottom:11px}',
    '.rev-var .chips{display:flex;flex-wrap:wrap;gap:6px}',
    '.rev-var .chips button{background:#26262e;color:#fff;border:0;border-radius:999px;padding:7px 13px;font:600 12.5px Archivo,system-ui,sans-serif;cursor:pointer}',
    '.rev-var .chips button:hover{background:#3a3a44}',
    '.rev-var .chips button.on{background:#d0deff;color:#101014}',
    '.rev-var .cierra{position:absolute;right:10px;top:8px;background:none;border:0;color:#9296a4;font-size:18px;cursor:pointer;line-height:1}',
    '.rev-envio{position:fixed;inset:0;z-index:150;background:rgba(16,16,20,.45);display:grid;place-items:center;padding:16px}',
    '.rev-envio .caja{background:#fff;color:#101014;border-radius:16px;padding:22px 22px 18px;width:min(420px,100%);font:400 14.5px/1.55 Archivo,system-ui,sans-serif}',
    '.rev-envio b{display:block;font-size:18px;margin-bottom:6px}.rev-envio p{margin:0 0 10px;color:#3a3a44}',
    '.rev-envio .barra{height:6px;background:#eef0f6;border-radius:3px;overflow:hidden;margin-top:8px}.rev-envio .barra i{display:block;height:100%;background:#101014;transition:width .3s}',
    '.rev-envio .bts{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.rev-envio .bts .rev-btn{flex:1 1 auto}',
    '.rev-guia{position:relative;z-index:60;max-width:1160px;margin:14px auto;padding:12px 16px;display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;',
    'background:#eef3ff;border:1.5px dashed #a3b8ff;border-radius:12px;font:400 14px/1.45 Archivo,system-ui,sans-serif;color:#101014;width:calc(100% - 32px)}',
    '.rev-guia .q{flex:1 1 320px}.rev-guia .q b{display:block;font-size:11.5px;letter-spacing:.09em;text-transform:uppercase;color:#28407f;margin-bottom:2px}',
    '.rev-guia .bs{display:flex;flex-wrap:wrap;gap:6px}',
    '.rev-guia .bs button{background:#101014;color:#fff;border:0;border-radius:999px;padding:8px 14px;font:600 13px Archivo,system-ui,sans-serif;cursor:pointer}',
    '.rev-guia .bs button[data-g="ok"]{background:#fff;color:#101014;border:1.5px solid #cdd5ea}',
    '.rev-guia .bs button[data-g="ok"].on{background:#1d6b3f;border-color:#1d6b3f;color:#fff}',
    '.rev-guia .bs button.grabando{background:#c0392b}',
    '.rev-guia .st{flex-basis:100%;font-size:12.5px;font-weight:600;color:#1d6b3f}.rev-guia .st:empty{display:none}',
    '.rev-guia.hecha{background:#f1faf3;border-color:#9bd3ae;border-style:solid}',
    '@media (max-width:560px){.rev-panel{width:100%;top:auto;height:82vh;border-radius:18px 18px 0 0;transform:translateY(100%)}',
    '.rev-panel.abierto{transform:none}.rev-pill{left:12px;bottom:12px;padding:10px 14px;font-size:13px}}'
  ].join('');

  var estilo = document.createElement('style');
  estilo.textContent = CSS;
  document.head.appendChild(estilo);

  /* ── utilidades ────────────────────────────────────────── */
  function texto(html) {
    var d = document.createElement('div');
    d.innerHTML = html;
    return (d.textContent || '').replace(/\s+/g, ' ').trim();
  }
  function corta(s, n) { return s.length > n ? s.slice(0, n - 1) + '…' : s; }

  function aviso(msg) {
    var d = document.createElement('div');
    d.className = 'rev-ui rev-aviso';
    d.textContent = msg;
    document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 2600);
  }

  function nombreSeccion(sec) {
    if (!sec) return 'Página';
    var e = sec.querySelector('.eyebrow');
    if (e) return texto(e.innerHTML).slice(0, 60);
    var h = sec.querySelector('h1,h2');
    if (h) return texto(h.innerHTML).slice(0, 60);
    return sec.id || 'Sección';
  }

  /* ── marcar los textos editables ───────────────────────── */
  var editables = [], guias = [];
  function notasDe(nom) { return st.notas.filter(function (n) { return n.ruta === RUTA && n.seccion === nom; }).length; }
  function guiaHecha(g) { return st.secciones[g.getAttribute('data-k')] === 'ok' || notasDe(g.getAttribute('data-nom')) > 0; }
  function pintaGuias() {
    guias.forEach(function (g) {
      var n = notasDe(g.getAttribute('data-nom')), ok = st.secciones[g.getAttribute('data-k')] === 'ok';
      g.classList.toggle('hecha', ok || n > 0);
      g.querySelector('[data-g="ok"]').classList.toggle('on', ok);
      g.querySelector('.st').textContent = n ? '✓ ' + n + (n === 1 ? ' comentario guardado' : ' comentarios guardados') : ok ? '✓ Marcada: así os gusta' : '';
    });
  }
  function preparar() {
    var secciones = document.querySelectorAll('main section, main article');
    Array.prototype.forEach.call(secciones, function (sec, si) {
      var cands = sec.querySelectorAll(SEL);
      var n = 0;
      Array.prototype.forEach.call(cands, function (el) {
        if (el.closest('form, .rev-ui, .meter, .hint, .mapa, [data-norev]')) return;
        if (el.querySelector(SEL)) return;             // solo las hojas
        if (!texto(el.innerHTML)) return;
        var clave = RUTA + '|' + (sec.id || 's' + si) + '|' + el.tagName.toLowerCase() + n;
        n++;
        el.setAttribute('data-rev', clave);
        el.setAttribute('data-rev-sec', nombreSeccion(sec));
        editables.push(el);
        var g = st.textos[clave];
        if (g) {
          if (g.orig === el.innerHTML) {
            el.innerHTML = g.nuevo;
            el.classList.add('rev-tocado');
            if (g.borrado) el.classList.add('rev-borrado');
          }
          else if (g.nuevo === el.innerHTML) { el.classList.add('rev-tocado'); }
          else { g.obsoleto = true; }
        }
      });
      // la pregunta de la sección, con audio, texto o "así me gusta"
      if (sec.tagName === 'SECTION') {
        var nom = nombreSeccion(sec);
        if (st.estilo === 'otro' && !guias.length && st.rutaOtro === RUTA) nom = 'Otro estilo';
        var k = RUTA + '|' + nom;
        var g = document.createElement('div');
        g.className = 'rev-ui rev-guia';
        g.setAttribute('data-k', k);
        g.setAttribute('data-nom', nom);
        g.innerHTML = '<div class="q"><b>' + esc(nom) + '</b><span>' + esc(pregunta(nom)) + '</span></div>' +
          '<div class="bs"><button type="button" data-g="audio">🎙 Contarlo en audio</button>' +
          '<button type="button" data-g="texto">✍️ Escribirlo</button>' +
          '<button type="button" data-g="ok">👍 Así me gusta</button></div><div class="st"></div>';
        sec.parentNode.insertBefore(g, sec);
        g.addEventListener('click', function (e) {
          var b = e.target.closest('[data-g]');
          if (!b) return;
          e.preventDefault(); e.stopPropagation();
          var a = b.getAttribute('data-g');
          var kk = g.getAttribute('data-k'), nn = g.getAttribute('data-nom');
          if (a === 'ok') {
            if (st.secciones[kk] === 'ok') delete st.secciones[kk]; else st.secciones[kk] = 'ok';
            guardar();
          } else if (a === 'audio') grabar(b, nn);
          else abrir('notas', nn);
        });
        guias.push(g);
      }
    });
  }

  /* ── edición ───────────────────────────────────────────── */
  window.addEventListener('scroll', function () { cerrarPop(); }, { passive: true });

  function activarEdicion(on) {
    document.body.classList.toggle('rev-on', on);
    editables.forEach(function (el) {
      if (on) {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('spellcheck', 'true');
      } else {
        el.removeAttribute('contenteditable');
      }
    });
    Array.prototype.forEach.call(document.querySelectorAll('.rev-sec, .rev-guia'), function (b) {
      b.style.display = on ? '' : 'none';
    });
  }

  document.addEventListener('focusin', function (e) {
    var el = e.target.closest && e.target.closest('[data-rev]');
    if (!el || !document.body.classList.contains('rev-on')) return;
    el.setAttribute('data-rev-antes', el.innerHTML);
    verVariantes(el);
  });

  document.addEventListener('focusout', function (e) {
    var el = e.target.closest && e.target.closest('[data-rev]');
    if (!el) return;
    setTimeout(cerrarPop, 150);
    var antes = el.getAttribute('data-rev-antes');
    el.removeAttribute('data-rev-antes');
    if (antes === null || antes === el.innerHTML) return;
    var prev = st.textos[el.getAttribute('data-rev')];
    registrar(el, prev ? prev.orig : antes);
  });

  /* ── dictado (el navegador lo trae de serie, no cuesta nada) ── */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var rec = null;

  function dictar(destino, modo, boton) {
    if (!SR) { aviso('Tu navegador no tiene dictado. Prueba con Chrome.'); return; }
    if (rec) { rec.stop(); return; }
    var esCampo = destino.value !== undefined;
    var base = modo === 'suma' ? (esCampo ? destino.value : destino.innerHTML) : '';
    if (base && modo === 'suma') base += esCampo ? ' ' : ' ';
    var firme = '';
    rec = new SR();
    rec.lang = 'es-ES';
    rec.interimResults = true;
    rec.continuous = true;
    boton.classList.add('grabando');
    boton.textContent = '⏹ Parar';
    rec.onresult = function (e) {
      var prov = '';
      for (var i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) firme += e.results[i][0].transcript;
        else prov += e.results[i][0].transcript;
      }
      var t = (base + firme + prov).replace(/\s+/g, ' ').trim();
      if (esCampo) destino.value = t; else destino.innerHTML = t;
    };
    rec.onerror = function (ev) {
      aviso(ev.error === 'not-allowed' ? 'Da permiso al micrófono en el candado de la barra de direcciones.' : 'No he podido oírte.');
    };
    rec.onend = function () {
      rec = null;
      boton.classList.remove('grabando');
      boton.textContent = '🎤 Dictar';
    };
    try { rec.start(); aviso('Habla; cuando acabes pulsa «Parar».'); }
    catch (e) { rec = null; boton.classList.remove('grabando'); boton.textContent = '🎤 Dictar'; }
  }

  /* -- almacen de audios en el propio navegador -----------
     Se guardan los bytes (ArrayBuffer + tipo), no el Blob: Safari/iPhone no guarda bien Blobs de MediaRecorder en
     IndexedDB (2026-10-17: los 3 audios de Elisabeth no llegaron). Copia en memoria para esta página, y cada audio se
     relee tras guardarlo: si no está, se avisa y se ofrece enviarlo ya. */
  var DB = null, MEM = {}, enRiesgo = {};   // enRiesgo: audios que solo viven en memoria y aún no han llegado
  window.addEventListener('beforeunload', function (e) {
    if (Object.keys(enRiesgo).length) { e.preventDefault(); e.returnValue = ''; }
  });
  function db(cb) {
    if (DB) return cb(DB);
    if (!window.indexedDB) return cb(null);
    try {
      var r = indexedDB.open('sh-revision', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('audios'); };
      r.onsuccess = function () { DB = r.result; cb(DB); };
      r.onerror = function () { cb(null); };
    } catch (e) { cb(null); }
  }
  function bytes(blob) {
    if (blob.arrayBuffer) return blob.arrayBuffer();
    return new Promise(function (ok, ko) {
      var fr = new FileReader();
      fr.onload = function () { ok(fr.result); };
      fr.onerror = ko;
      fr.readAsArrayBuffer(blob);
    });
  }
  function guardaAudio(nombre, blob, cb) {
    MEM[nombre] = blob;
    var fin = function (ok) { if (cb) { cb(ok); cb = null; } };
    bytes(blob).then(function (buf) {
      db(function (d) {
        if (!d) return fin(false);
        try {
          var tx = d.transaction('audios', 'readwrite');
          tx.objectStore('audios').put({ buf: buf, tipo: blob.type || 'audio/webm' }, nombre);
          tx.oncomplete = function () {
            leeDisco(nombre, function (b) { fin(!!b && b.size === blob.size && b.size > 0); });
          };
          tx.onerror = tx.onabort = function () { fin(false); };
        } catch (e) { fin(false); }
      });
    }, function () { fin(false); });
  }
  function leeDisco(nombre, cb) {
    db(function (d) {
      if (!d) return cb(null);
      try {
        var q = d.transaction('audios').objectStore('audios').get(nombre);
        q.onsuccess = function () {
          var v = q.result;
          if (v && v.buf) return cb(new Blob([v.buf], { type: v.tipo }));
          cb(v instanceof Blob && v.size ? v : null);   // formato antiguo (Blob)
        };
        q.onerror = function () { cb(null); };
      } catch (e) { cb(null); }
    });
  }
  function leeAudio(nombre, cb) {
    if (MEM[nombre]) return cb(MEM[nombre]);
    leeDisco(nombre, cb);
  }
  function borraAudios() { MEM = {}; db(function (d) { if (d) d.transaction('audios', 'readwrite').objectStore('audios').clear(); }); }

  function bajaAudio(nombre, blob) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }

  /* -- nota de voz ---------------------------------------- */
  var mr = null, trozos = [], t0 = 0, cron = null;

  function grabar(boton, seccionFija) {
    if (mr) { mr.stop(); return; }
    var etiqueta = boton.textContent;
    if (!navigator.mediaDevices || !window.MediaRecorder) { aviso('Tu navegador no puede grabar audio.'); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      mr = new MediaRecorder(stream);
      trozos = [];
      t0 = Date.now();
      mr.ondataavailable = function (e) { if (e.data.size) trozos.push(e.data); };
      mr.onstop = function () {
        clearInterval(cron);
        stream.getTracks().forEach(function (t) { t.stop(); });
        var seg = Math.round((Date.now() - t0) / 1000);
        var tipo = mr.mimeType || 'audio/webm';
        var blob = new Blob(trozos, { type: tipo });
        mr = null;
        boton.classList.remove('grabando');
        boton.textContent = etiqueta;
        if (seg < 1) return;
        st.audios = (st.audios || 0) + 1;
        var nombre = 'nota-voz-' + st.audios + (/mp4|aac/.test(tipo) ? '.m4a' : /ogg/.test(tipo) ? '.ogg' : '.webm');
        var campo = seccionFija ? null : document.getElementById('rev-txt');
        var extra = campo ? campo.value : '';
        if (campo) campo.value = '';
        st.notas.push({
          texto: '🎙 Nota de voz de ' + seg + ' s (' + nombre + ')' +
                 (extra.trim() ? String.fromCharCode(10) + extra.trim() : ''),
          audio: nombre, seg: seg,
          seccion: seccionFija || (document.getElementById('rev-sec') || {}).value || '',
          ruta: RUTA, pagina: TITULO
        });
        guardar();
        guardaAudio(nombre, blob, function (ok) {
          pintar();
          if (ok) { aviso('Audio guardado: puedes oirlo y descargarlo cuando quieras.'); return; }
          enRiesgo[nombre] = true;
          estadoEnvio('<b>Envía este audio ahora</b><p>Este navegador no deja guardar el audio, así que si cambias de ' +
            'página o la cierras, se pierde. Envíalo ahora (llega con lo que lleves hasta aquí) y sigue después; ' +
            'lo que ya haya llegado no se repite.</p>',
            '<button type="button" class="rev-btn p" data-e="1">Enviar ahora</button>' +
            '<button type="button" class="rev-btn s" data-d="1">Descargarlo</button>' +
            '<button type="button" class="rev-btn x" data-c="1">Más tarde</button>');
          modal.querySelector('[data-e]').addEventListener('click', function () { cierraEnvio(); enviar(); });
          modal.querySelector('[data-d]').addEventListener('click', function () { bajaAudio(nombre, blob); });
          modal.querySelector('[data-c]').addEventListener('click', cierraEnvio);
        });
        pintar();
      };
      mr.start();
      if (seccionFija) aviso('Grabando. Cuenta lo que querríais aquí y pulsa «Parar».');
      boton.classList.add('grabando');
      cron = setInterval(function () {
        boton.textContent = '⏹ Parar (' + Math.round((Date.now() - t0) / 1000) + ' s)';
      }, 500);
    }).catch(function () { aviso('Da permiso al micrófono para poder grabar.'); });
  }

  /* ── variantes de copy ─────────────────────────────────── */
  var pop = null;
  function cerrarPop() { if (rec) { try { rec.stop(); } catch (e) {} } if (pop) { pop.remove(); pop = null; } }

  function verVariantes(el) {
    cerrarPop();
    var clave = el.getAttribute('data-rev');
    var g = st.textos[clave];
    var base = texto(g ? g.orig : el.innerHTML);
    var d = VAR[base];
    var esBoton = el.classList.contains('btn') || el.classList.contains('more');
    pop = document.createElement('div');
    pop.className = 'rev-ui rev-var';
    var h = '<button type="button" class="cierra" aria-label="Cerrar">×</button>';
    if (d) {
      h += '<div class="tipo">' + d.t + '</div><div class="porque">' + d.p + '</div><div class="chips">' +
        '<button type="button" data-v="-1">Original</button>';
      d.v.forEach(function (v, i) { h += '<button type="button" data-v="' + i + '" title="' + v.replace(/"/g, '&quot;') + '">Versión ' + (i + 1) + '</button>'; });
      h += '</div>';
    } else {
      h += '<div class="tipo">' + (esBoton ? 'Botón' : 'Texto') + '</div><div class="porque">' +
           (esBoton ? 'Escribe encima para cambiar lo que pone. Si lo dejas sin texto, el botón se quita de la web.'
                    : 'Escribe encima para cambiarlo, o díctalo con el micrófono. Si lo dejas sin texto, se quita.') +
           '</div>';
    }
    h += '<div class="quitar">' +
         (SR ? '<button type="button" class="mic" data-mic="1" title="Dictar (sustituye el texto)">🎤 Dictar</button>' : '') +
         '<button type="button" data-quitar="1">' +
         (el.classList.contains('rev-borrado') ? 'Recuperar' : (esBoton ? 'Quitar este botón' : 'Quitar este texto')) +
         '</button></div>';
    pop.innerHTML = h;
    document.body.appendChild(pop);

    var r = el.getBoundingClientRect();
    var alto = pop.offsetHeight;
    var top = r.bottom + 10;
    if (top + alto > window.innerHeight - 10) top = Math.max(10, r.top - alto - 10);
    pop.style.top = top + 'px';
    pop.style.left = Math.max(12, Math.min(r.left, window.innerWidth - pop.offsetWidth - 12)) + 'px';

    pop.addEventListener('mousedown', function (e) { e.preventDefault(); });  // no perder el foco
    pop.querySelector('.cierra').addEventListener('click', cerrarPop);
    var mic = pop.querySelector('[data-mic]');
    if (mic) mic.addEventListener('click', function () {
      el.classList.remove('rev-borrado');
      dictar(el, 'nuevo', mic);
    });
    pop.querySelector('[data-quitar]').addEventListener('click', function () {
      if (el.classList.contains('rev-borrado')) recuperar(el); else quitar(el);
    });
    Array.prototype.forEach.call(pop.querySelectorAll('[data-v]'), function (b) {
      b.addEventListener('click', function () {
        var i = parseInt(b.getAttribute('data-v'), 10);
        el.classList.remove('rev-borrado');
        el.innerHTML = i < 0 ? (g ? g.orig : el.innerHTML) : d.v[i];
        Array.prototype.forEach.call(pop.querySelectorAll('[data-v]'), function (o) { o.classList.toggle('on', o === b); });
      });
    });
  }

  function registrar(el, orig) {
    var clave = el.getAttribute('data-rev');
    var base = {
      orig: orig, ruta: RUTA, pagina: TITULO,
      seccion: el.getAttribute('data-rev-sec'), etiqueta: el.tagName.toLowerCase(),
      boton: el.classList.contains('btn')
    };
    if (!texto(el.innerHTML)) {                       // sin texto = fuera
      el.innerHTML = orig;
      base.nuevo = orig; base.borrado = true;
      st.textos[clave] = base;
      el.classList.add('rev-tocado', 'rev-borrado');
    } else if (orig === el.innerHTML) {
      delete st.textos[clave];
      el.classList.remove('rev-tocado');
      el.classList.remove('rev-borrado');
    } else {
      base.nuevo = el.innerHTML;
      st.textos[clave] = base;
      el.classList.add('rev-tocado');
      el.classList.remove('rev-borrado');
    }
    guardar();
    if (panel.classList.contains('abierto')) pintar();
  }

  function quitar(el) {
    var g = st.textos[el.getAttribute('data-rev')];
    var orig = g ? g.orig : el.innerHTML;
    el.innerHTML = '';
    registrar(el, orig);
    cerrarPop();
    aviso(el.classList.contains('btn') ? 'Botón marcado para quitar' : 'Marcado para quitar');
  }

  function recuperar(el) {
    var clave = el.getAttribute('data-rev'), g = st.textos[clave];
    if (g) el.innerHTML = g.orig;
    delete st.textos[clave];
    el.classList.remove('rev-tocado');
    el.classList.remove('rev-borrado');
    guardar();
    if (panel.classList.contains('abierto')) pintar();
    cerrarPop();
  }

  /* pegar sin formato */
  document.addEventListener('paste', function (e) {
    var el = e.target.closest && e.target.closest('[data-rev]');
    if (!el || !document.body.classList.contains('rev-on')) return;
    e.preventDefault();
    var t = (e.clipboardData || window.clipboardData).getData('text');
    document.execCommand('insertText', false, t);
  });

  /* en modo revisión los enlaces del contenido no navegan (se navega por el menú o por el panel) */
  document.addEventListener('click', function (e) {
    if (!document.body.classList.contains('rev-on')) return;
    var a = e.target.closest && e.target.closest('main a');
    if (!a || a.closest('[data-norev]')) return;
    e.preventDefault();
    aviso('En modo revisión los enlaces no navegan. Usa el menú de arriba o «Ir a otra página».');
  });

  /* ── panel ─────────────────────────────────────────────── */
  var panel = document.createElement('aside');
  panel.className = 'rev-ui rev-panel';
  panel.innerHTML =
    '<div class="rev-head"><h2>Tus cambios</h2>' +
    '<button type="button" id="rev-ayuda" aria-label="Cómo funciona" title="Cómo funciona" style="font-size:16px">?</button>' +
    '<button type="button" id="rev-x" aria-label="Cerrar">×</button></div>' +
    '<div class="rev-tabs"><button type="button" data-tab="cambios" class="on">Textos</button>' +
    '<button type="button" data-tab="notas">Notas</button>' +
    '<button type="button" data-tab="ir">Ir a…</button></div>' +
    '<div class="rev-body" id="rev-body"></div>' +
    '<div class="rev-foot">' +
    '<div class="fila"><button type="button" class="rev-btn p" id="rev-todo">📤 Enviar (textos y audios)</button></div>' +
    '<div class="fila"><button type="button" class="rev-btn x" id="rev-copiar">Copiar el resumen</button>' +
    '<button type="button" class="rev-btn x" id="rev-bajar">Descargar una copia</button></div>' +
    '<div class="fila"><button type="button" class="rev-btn x" id="rev-limpiar">Empezar de cero</button>' +
    '<button type="button" class="rev-btn x" id="rev-salir">Salir del modo revisión</button></div>' +
    '</div>';
  document.body.appendChild(panel);

  var tab = 'cambios', secPre = '';
  var body = panel.querySelector('#rev-body');

  panel.querySelector('#rev-x').addEventListener('click', function () { cerrar(); });
  panel.querySelector('#rev-ayuda').addEventListener('click', function () { cerrar(); ayuda(); });
  Array.prototype.forEach.call(panel.querySelectorAll('.rev-tabs button'), function (b) {
    b.addEventListener('click', function () {
      tab = b.getAttribute('data-tab');
      Array.prototype.forEach.call(panel.querySelectorAll('.rev-tabs button'), function (o) {
        o.classList.toggle('on', o === b);
      });
      pintar();
    });
  });

  function abrir(t, sec) {
    if (t) {
      tab = t;
      Array.prototype.forEach.call(panel.querySelectorAll('.rev-tabs button'), function (o) {
        o.classList.toggle('on', o.getAttribute('data-tab') === t);
      });
    }
    secPre = sec || '';
    panel.classList.add('abierto');
    pintar();
  }
  function cerrar() { panel.classList.remove('abierto'); }

  function pintar() {
    if (tab === 'cambios') return pintarCambios();
    if (tab === 'notas') return pintarNotas();
    return pintarIr();
  }

  function pintarCambios() {
    var claves = Object.keys(st.textos);
    if (!claves.length) {
      body.innerHTML = '<p class="rev-vacio">Todavía no has cambiado ningún texto.<br><br>' +
        'Pincha sobre cualquier título o párrafo de la página y escribe encima. Lo que cambies se queda guardado ' +
        'aunque cierres el navegador.</p>';
      return;
    }
    var h = '';
    claves.forEach(function (k) {
      var c = st.textos[k];
      h += '<div class="rev-item"><div class="ru">' + (c.pagina || c.ruta) + ' · ' + (c.seccion || '') + '</div>' +
        (c.borrado
          ? '<ins style="color:#9a5a5a">Quitar ' + (c.boton ? 'el botón' : 'el texto') + ':</ins><del>' + corta(texto(c.orig), 160) + '</del>'
          : '<del>' + corta(texto(c.orig), 160) + '</del><ins>' + corta(texto(c.nuevo), 160) + '</ins>') +
        (c.obsoleto ? '<div class="ru" style="color:#9a5a5a;margin-top:6px">El texto original ha cambiado en la web</div>' : '') +
        '<div class="acc">' +
        (c.ruta === RUTA ? '<button type="button" data-ver="' + k + '">Ver</button>' : '') +
        '<button type="button" data-deshacer="' + k + '">Deshacer</button></div></div>';
    });
    body.innerHTML = h;
    Array.prototype.forEach.call(body.querySelectorAll('[data-deshacer]'), function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-deshacer');
        var el = document.querySelector('[data-rev="' + k + '"]');
        if (el && st.textos[k]) {
          el.innerHTML = st.textos[k].orig;
          el.classList.remove('rev-tocado');
          el.classList.remove('rev-borrado');
        }
        delete st.textos[k];
        guardar(); pintar();
      });
    });
    Array.prototype.forEach.call(body.querySelectorAll('[data-ver]'), function (b) {
      b.addEventListener('click', function () {
        var el = document.querySelector('[data-rev="' + b.getAttribute('data-ver') + '"]');
        if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); el.focus(); }
      });
    });
  }

  function pintarNotas() {
    var secs = [];
    Array.prototype.forEach.call(document.querySelectorAll('main section'), function (s) {
      var n = nombreSeccion(s);
      if (secs.indexOf(n) < 0) secs.push(n);
    });
    var h = '<div class="rev-nota-form"><select id="rev-sec">';
    h += '<option value="">Toda la página</option>';
    secs.forEach(function (s) {
      h += '<option' + (s === secPre ? ' selected' : '') + '>' + s + '</option>';
    });
    h += '</select><textarea id="rev-txt" placeholder="Qué cambiarías aquí: una foto, un dato, algo que falta…"></textarea>' +
      '<div class="dos">' +
      (SR ? '<button type="button" class="mic" id="rev-mic">🎤 Dictar</button>' : '') +
      '<button type="button" class="mic" id="rev-grab">🎙 Grabar audio</button></div>' +
      '<button type="button" class="rev-btn p" id="rev-add">Añadir nota</button></div>';
    if (!st.notas.length) {
      h += '<p class="rev-vacio">Aún no hay notas.</p>';
    } else {
      st.notas.forEach(function (n, i) {
        h += '<div class="rev-item"><div class="ru">' + n.pagina + (n.seccion ? ' · ' + n.seccion : '') + '</div>' +
          n.texto.replace(/</g, '&lt;').replace(/\n/g, '<br>') +
          (n.audio ? '<div class="audio" data-audio="' + n.audio + '"></div>' : '') +
          '<div class="acc"><button type="button" data-borrar="' + i + '">Borrar</button>' +
          (n.audio ? '<button type="button" data-bajar="' + n.audio + '">Descargar audio</button>' : '') +
          '</div></div>';
      });
    }
    body.innerHTML = h;
    var micN = body.querySelector('#rev-mic');
    if (micN) micN.addEventListener('click', function () { dictar(body.querySelector('#rev-txt'), 'suma', micN); });
    var grabN = body.querySelector('#rev-grab');
    if (grabN) grabN.addEventListener('click', function () { grabar(grabN); });
    body.querySelector('#rev-add').addEventListener('click', function () {
      var t = body.querySelector('#rev-txt').value.trim();
      if (!t) return;
      st.notas.push({ texto: t, seccion: body.querySelector('#rev-sec').value, ruta: RUTA, pagina: TITULO });
      guardar(); secPre = ''; pintar();
      aviso('Nota guardada');
    });
    Array.prototype.forEach.call(body.querySelectorAll('[data-audio]'), function (box) {
      leeAudio(box.getAttribute('data-audio'), function (blob) {
        if (!blob) { box.innerHTML = '<small style="color:#9a5a5a">El archivo ya no esta en este navegador.</small>'; return; }
        var au = document.createElement('audio');
        au.controls = true;
        au.src = URL.createObjectURL(blob);
        au.style.cssText = 'width:100%;margin-top:9px;height:34px';
        box.appendChild(au);
      });
    });
    Array.prototype.forEach.call(body.querySelectorAll('[data-bajar]'), function (b) {
      b.addEventListener('click', function () {
        var nombre = b.getAttribute('data-bajar');
        leeAudio(nombre, function (blob) { if (blob) bajaAudio(nombre, blob); else aviso('Ese audio ya no esta guardado.'); });
      });
    });
    Array.prototype.forEach.call(body.querySelectorAll('[data-borrar]'), function (b) {
      b.addEventListener('click', function () {
        st.notas.splice(parseInt(b.getAttribute('data-borrar'), 10), 1);
        guardar(); pintar();
      });
    });
  }

  function pintarIr() {
    body.innerHTML = '<p class="rev-vacio">Cargando el índice de páginas…</p>';
    fetch(R + 'assets/paginas.json').then(function (r) { return r.json(); }).then(function (ps) {
      var h = '<p class="rev-vacio">Tus cambios se guardan al cambiar de página.</p>';
      ps.forEach(function (p) {
        h += '<div class="rev-item"><div class="ru">' + (p.grupo || '') + '</div>' +
          '<a href="' + VBASE + p.ruta + '" style="color:#28407f;text-decoration:none;font-weight:600">' + p.titulo + '</a></div>';
      });
      body.innerHTML = h;
    }).catch(function () {
      body.innerHTML = '<p class="rev-vacio">Usa el menú de arriba para cambiar de página.</p>';
    });
  }

  /* ── exportar ──────────────────────────────────────────── */
  function informe() {
    var hoy = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    var l = ['# Cambios para la web de S&H Abogadas', '', (st.quien ? 'Lo envía: **' + st.quien + '**' : ''), '',
      'Estilo elegido: **' + (st.estilo || VERSION) + '**', '',
      hoy + ' · ' + nEdits() + ' cambios de texto · ' + nNotas() + ' comentarios', ''];
    var bien = Object.keys(st.secciones).filter(function (k) { return st.secciones[k] === 'ok'; });
    if (bien.length) {
      l.push('**Secciones que os gustan tal cual:**');
      bien.forEach(function (k) { var p = k.split('|'); l.push('- ' + p[1] + '  (' + p[0] + ')'); });
      l.push('');
    }
    var porPag = {};
    Object.keys(st.textos).forEach(function (k) {
      var c = st.textos[k];
      (porPag[c.pagina || c.ruta] = porPag[c.pagina || c.ruta] || { ruta: c.ruta, textos: [], notas: [] }).textos.push(c);
    });
    st.notas.forEach(function (n) {
      (porPag[n.pagina] = porPag[n.pagina] || { ruta: n.ruta, textos: [], notas: [] }).notas.push(n);
    });
    Object.keys(porPag).forEach(function (p) {
      var d = porPag[p];
      l.push('## ' + p + '  (' + d.ruta + ')', '');
      d.textos.forEach(function (c) {
        if (c.borrado) {
          l.push('**QUITAR ' + (c.boton ? 'este botón' : 'este texto') + ' · ' + (c.seccion || '') + '**');
          l.push('- ' + texto(c.orig));
          l.push('');
          return;
        }
        l.push('**' + (c.boton ? 'Botón' : 'Texto') + ' · ' + (c.seccion || '') + '**');
        l.push('- Antes: ' + texto(c.orig));
        l.push('- Ahora: ' + texto(c.nuevo));
        if (c.obsoleto) l.push('- (ojo: el texto original ya no coincide con el de la web)');
        l.push('');
      });
      d.notas.forEach(function (n) {
        l.push('**Nota · ' + (n.seccion || 'toda la página') + '**');
        l.push('> ' + n.texto.replace(/\n/g, '\n> '));
        l.push('');
      });
    });
    var conAudio = st.notas.filter(function (n) { return n.audio; });
    if (conAudio.length) {
      l.push('---', 'Hay ' + conAudio.length + ' nota(s) de voz, enviadas junto a este resumen:');
      conAudio.forEach(function (n) { l.push('- ' + n.audio + ' (' + n.seg + ' s)'); });
      l.push('');
    }
    if (!nEdits() && !nNotas()) l.push('(sin cambios todavía)');
    return l.join('\n');
  }

  /* ── enviar: directo al repo de Ringuno ────────────────────────
     Cada cosa va al back office (entrada pública para demos, ver proposals/spec-demo-drop.md):
     el resumen como nota y cada audio como nota de voz, que el back office transcribe. Acaba en
     clients/shabogadas/inbox/ y el brief se recompila solo. Mismo contrato que /backoffice/drop,
     sin login: X-Demo-Key en vez del token. X-Submission-Id fijo por envío y por archivo, así
     un reintento nunca crea un segundo input. Solo se da por enviado cuando todo responde 2xx;
     si no sale, no se pierde nada (sigue guardado aquí). */
  var ENVIO = 'https://hallowed-barracuda-843.eu-west-1.convex.site/backoffice/demo-drop';            // lo pone build.py desde envio/config.json
  var CLAVE_ENVIO = 'sh-P82dANVlEFobhzhkYSu7WPc5yXBSS3J4';
  var CLIENTE = 'shabogadas';

  function leeAudioP(n) { return new Promise(function (ok) { leeAudio(n, ok); }); }
  function espera(ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); }

  function sube(item) {
    var intento = 0;
    function uno() {
      intento++;
      var ctl = window.AbortController ? new AbortController() : null;
      var t = ctl ? setTimeout(function () { ctl.abort(); }, 180000) : null;
      return fetch(ENVIO, {
        method: 'POST', body: item.blob, signal: ctl ? ctl.signal : undefined,
        headers: {
          'Content-Type': item.tipo, 'X-Demo-Key': CLAVE_ENVIO, 'X-Client': CLIENTE, 'X-Kind': item.kind,
          'X-Filename': encodeURIComponent(item.nombre), 'X-Who': encodeURIComponent(st.quien || ''),
          'X-Subject': encodeURIComponent(item.asunto), 'X-Language': 'es', 'X-Submission-Id': item.id
        }
      }).then(function (r) {
        if (t) clearTimeout(t);
        if (r.ok) return true;
        var e = new Error('HTTP ' + r.status); e.final = r.status >= 400 && r.status < 500 && r.status !== 408 && r.status !== 429;
        throw e;
      }).catch(function (e) {
        if (t) clearTimeout(t);
        if (e.final || intento >= 5) throw e;
        return espera([0, 2000, 5000, 10000, 20000][intento]).then(uno);
      });
    }
    return uno();
  }

  var modal = null;
  function estadoEnvio(html, botones) {
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'rev-ui rev-envio';
      document.body.appendChild(modal);
    }
    modal.innerHTML = '<div class="caja">' + html + (botones ? '<div class="bts">' + botones + '</div>' : '') + '</div>';
    return modal;
  }
  function cierraEnvio() { if (modal) { modal.remove(); modal = null; } }

  var quienOk = false;
  function enviar() {
    if (!nEdits() && !nNotas() && !Object.keys(st.secciones).length) {
      aviso('Todavía no hay nada que enviar: contesta alguna sección primero.');
      return;
    }
    if (!quienOk) {
      estadoEnvio('<b>¿Quién lo envía?</b><p>Para saber de quién son los comentarios.</p>' +
        '<input type="text" id="rev-quien" value="' + esc(st.quien || '') + '" placeholder="Tu nombre" ' +
        'style="width:100%;border:1.5px solid #e3e6ef;border-radius:9px;padding:11px 12px;font:400 15px Archivo,system-ui,sans-serif">',
        '<button type="button" class="rev-btn p" data-e="1">Enviar</button><button type="button" class="rev-btn x" data-c="1">Cancelar</button>');
      var inp = modal.querySelector('#rev-quien');
      inp.focus();
      var sigue = function () {
        var v = inp.value.trim();
        if (!v) { inp.focus(); return; }
        st.quien = v; guardar(); quienOk = true; enviar(); quienOk = false;
      };
      modal.querySelector('[data-e]').addEventListener('click', sigue);
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') sigue(); });
      modal.querySelector('[data-c]').addEventListener('click', cierraEnvio);
      return;
    }
    if (ENVIO.indexOf('http') !== 0) return compartir();
    // Solo lo nuevo: los audios ya recibidos no se vuelven a subir; el resumen va entero cada vez.
    st.subidos = st.subidos || {};
    var conAudio = st.notas.filter(function (n) { return n.audio && !st.subidos[n.audio]; });
    var envio = 'web-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    estadoEnvio('<b>Enviando…</b><p>' + (conAudio.length ? conAudio.length + ' audio(s) y el resumen.' : 'El resumen.') +
      ' No cierres esta página.</p><div class="barra"><i style="width:6%"></i></div>');
    Promise.all(conAudio.map(function (n) {
      return leeAudioP(n.audio).then(function (b) { return b ? { n: n, b: b } : null; });
    })).then(function (lista) {
      lista = lista.filter(Boolean);
      var faltan = conAudio.length - lista.length;
      var md = informe() + (faltan ? '\n\n(' + faltan + ' audio(s) ya no estaban guardados en este navegador)' : '');
      var items = [{ id: envio + '-resumen', kind: 'note', nombre: 'revision-web-' + (st.estilo || VERSION) + '.md',
        tipo: 'text/markdown', asunto: 'Revisión de la web (' + (st.estilo || VERSION) + ')',
        blob: new Blob([md], { type: 'text/markdown' }) }];
      lista.forEach(function (x, i) {
        items.push({ id: envio + '-a' + (i + 1), kind: 'voice', nombre: x.n.audio, tipo: (x.b.type || 'audio/webm').split(';')[0],
          asunto: 'Revisión de la web · ' + (x.n.seccion || 'toda la página') + ' (' + (x.n.pagina || '') + ')', blob: x.b, nota: x.n });
      });
      var hechos = 0, cadena = Promise.resolve();
      items.forEach(function (it) {
        cadena = cadena.then(function () { return sube(it); }).then(function () {
          hechos++;
          if (it.nota) { st.subidos[it.nota.audio] = new Date().toISOString(); delete enRiesgo[it.nota.audio]; guardar(); }
          var b = modal && modal.querySelector('.barra i');
          if (b) b.style.width = Math.round(6 + 94 * hechos / items.length) + '%';
        });
      });
      return cadena.then(function () {
        st.enviado = new Date().toISOString();
        guardar();
        estadoEnvio(faltan
          ? '<b>Ha llegado el texto, pero faltan ' + faltan + ' audio(s)</b><p>' +
            (lista.length ? 'Han llegado ' + lista.length + ' audio(s). ' : '') +
            'Este navegador no había guardado ' + (faltan > 1 ? 'los demás' : 'uno') + '. Si puedes, vuelve a grabar' +
            (faltan > 1 ? 'los' : 'lo') + ' y envía otra vez.</p>'
          : '<b>✓ Recibido</b><p>Nos ha llegado todo' + (lista.length ? ', con ' + lista.length + ' audio(s)' : '') +
            '. Puedes seguir comentando y volver a enviar cuando quieras.</p>',
          '<button type="button" class="rev-btn p" data-c="1">' + (faltan ? 'Entendido' : 'Perfecto') + '</button>');
        modal.querySelector('[data-c]').addEventListener('click', cierraEnvio);
      });
    }).catch(function () {
      copiaLocal('No se ha podido enviar (¿hay conexión?). No se ha perdido nada: sigue todo guardado aquí, y lo que ya había llegado no se repite.');
    });
  }

  /* Mientras la entrada del back office no esté conectada: Compartir del móvil (WhatsApp…) con el
     resumen y los audios; en el ordenador, se descargan para adjuntarlos. */
  function compartir() {
    var conAudio = st.notas.filter(function (n) { return n.audio; });
    Promise.all(conAudio.map(function (n) {
      return leeAudioP(n.audio).then(function (b) { return b ? new File([b], n.audio, { type: (b.type || 'audio/webm').split(';')[0] }) : null; });
    })).then(function (audios) {
      var files = [new File([informe()], 'cambios-web-shabogadas.md', { type: 'text/markdown' })]
        .concat(audios.filter(Boolean));
      var puede = false;
      try { puede = !!(navigator.canShare && navigator.canShare({ files: files })); } catch (e) {}
      if (puede) {
        estadoEnvio('<b>Mandárselo a Marc</b><p>Se abre el menú de compartir: elige WhatsApp y su chat. Van el resumen' +
          (audios.length ? ' y ' + audios.length + ' audio(s)' : '') + '.</p>',
          '<button type="button" class="rev-btn p" data-s="1">Compartir</button><button type="button" class="rev-btn x" data-c="1">Cancelar</button>');
        modal.querySelector('[data-c]').addEventListener('click', cierraEnvio);
        modal.querySelector('[data-s]').addEventListener('click', function () {
          navigator.share({ files: files, title: 'Web S&H Abogadas', text: 'Comentarios de la web' + (st.quien ? ' · ' + st.quien : '') })
            .then(function () { st.enviado = new Date().toISOString(); guardar(); cierraEnvio(); aviso('Enviado'); })
            .catch(function () {});
        });
        return;
      }
      files.forEach(function (f, i) { setTimeout(function () { bajaAudio(f.name, f); }, i * 450); });
      estadoEnvio('<b>Descargado</b><p>Se han descargado el resumen' + (audios.length ? ' y ' + audios.length + ' audio(s)' : '') +
        '. Mándaselos a Marc por WhatsApp o correo.</p>', '<button type="button" class="rev-btn p" data-c="1">Vale</button>');
      modal.querySelector('[data-c]').addEventListener('click', cierraEnvio);
    });
  }

  function copiaLocal(motivo) {
    estadoEnvio('<b>No ha salido</b><p>' + motivo + '</p><p>Prueba otra vez en un momento. Si corre prisa, descarga una copia y mándala por WhatsApp.</p>',
      '<button type="button" class="rev-btn p" data-r="1">Probar otra vez</button><button type="button" class="rev-btn s" data-d="1">Descargar una copia</button><button type="button" class="rev-btn x" data-c="1">Cerrar</button>');
    modal.querySelector('[data-r]').addEventListener('click', function () { cierraEnvio(); enviar(); });
    modal.querySelector('[data-c]').addEventListener('click', cierraEnvio);
    modal.querySelector('[data-d]').addEventListener('click', function () {
      bajaAudio('cambios-web-shabogadas.md', new Blob([informe()], { type: 'text/markdown;charset=utf-8' }));
      st.notas.filter(function (n) { return n.audio; }).forEach(function (n, i) {
        leeAudio(n.audio, function (b) { if (b) setTimeout(function () { bajaAudio(n.audio, b); }, (i + 1) * 450); });
      });
    });
  }

  panel.querySelector('#rev-todo').addEventListener('click', enviar);

  panel.querySelector('#rev-copiar').addEventListener('click', function () {
    var t = informe();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(t).then(function () { aviso('Copiado. Pégalo donde quieras.'); },
        function () { pedirCopia(t); });
    } else { pedirCopia(t); }
  });
  function pedirCopia(t) {
    var ta = document.createElement('textarea');
    ta.value = t; ta.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); aviso('Copiado'); } catch (e) { aviso('No he podido copiar; usa Descargar'); }
    ta.remove();
  }

  panel.querySelector('#rev-bajar').addEventListener('click', function () {
    var b = new Blob([informe()], { type: 'text/markdown;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = 'cambios-web-shabogadas.md';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  });



  panel.querySelector('#rev-salir').addEventListener('click', function () {
    if (nEdits() + nNotas() && !confirm('Tienes cambios guardados. Salir no los borra: seguirán aquí cuando vuelvas a entrar con el enlace de revisión. ¿Salir?')) return;
    try { localStorage.removeItem('sh-rev-on'); } catch (e) {}
    location.href = location.pathname;
  });

  panel.querySelector('#rev-limpiar').addEventListener('click', function () {
    if (!confirm('¿Borrar todos los cambios y notas guardados? No se puede deshacer.')) return;
    st = { textos: {}, notas: [], secciones: {} };
    borraAudios();
    guardar();
    location.reload();
  });

  /* ── pastilla flotante ─────────────────────────────────── */
  var pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'rev-ui rev-pill';
  document.body.appendChild(pill);

  function pintarContador() {
    var n = nEdits() + nNotas();
    var hechas = guias.filter(guiaHecha).length;
    pill.innerHTML = (activo ? '✏️ Revisión' : '👁 Modo revisión') +
      (guias.length ? ' · ' + hechas + ' de ' + guias.length + ' secciones' : '') + (n ? ' <b>' + n + '</b>' : '');
    pill.classList.toggle('rev-off', !activo);
  }

  var activo = false;
  pill.addEventListener('click', function () { abrir('cambios'); });

  function ayuda() {
    var vieja = document.querySelector('.rev-ayuda');
    if (vieja) vieja.remove();
    var d = document.createElement('div');
    d.className = 'rev-ui rev-ayuda';
    d.innerHTML = '<b>Cómo funciona</b><ul>' +
      (st.estilo === 'otro' ? '<li>1️⃣ <b>Estilo:</b> queréis otro distinto. Contad cómo en la pregunta de arriba del todo, con la web delante.</li>' : '<li>1️⃣ <b>Estilo:</b> estás viendo «' + esc(st.estilo || VERSION) + '». Si ninguno os convence, se hacen más.</li>') +
      '<li>2️⃣ <b>Sección por sección:</b> encima de cada una hay una pregunta. Contesta con un audio o por escrito, o marca «Así me gusta».</li>' +
      '<li>✏️ <b>Si quieres, cambia textos</b> pinchando encima. Los titulares tienen 5 versiones para probar.</li>' +
      '<li>🗑️ <b>Borra el texto</b> de algo y se quita de la web.</li>' +
      '<li>3️⃣ <b>Al acabar:</b> la pastilla de abajo → «Enviar». Nos llega todo, con los audios. Ve página a página con el menú; se guarda todo.</li>' +
      '</ul><i>No cambia la web: es una propuesta, y se guarda aunque cierres.<br>' +
      'Como mi prima no se calla ni bajo del agua, espero que mandando un audio tenga facilidades para llevar a cabo esta hazaña.</i>' +
      '<button type="button">Entendido, empiezo</button>';
    document.body.appendChild(d);
    d.querySelector('button').addEventListener('click', function () { d.remove(); });
  }

  /* arranque */
  if (qEst && st.estilo === 'otro') st.rutaOtro = RUTA;
  preparar();
  activo = true;
  activarEdicion(true);
  pintarContador();
  pintaGuias();
  if ((!st.vioAyuda || qEst) && TITULO !== 'Elegir el estilo') { ayuda(); st.vioAyuda = true; try { localStorage.setItem(LS, JSON.stringify(st)); } catch (e) {} }

  window.SHRevision = { informe: informe, estado: function () { return st; }, abrir: abrir };
})();
