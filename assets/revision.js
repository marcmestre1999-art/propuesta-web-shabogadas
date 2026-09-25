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
  }
  var st = cargar() || { textos: {}, notas: [] };
  var VAR = {};
  try {
    fetch(R + 'assets/variantes.json').then(function (r) { return r.json(); }).then(function (j) { VAR = j; });
  } catch (e) {}

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
  var editables = [];
  function preparar() {
    var secciones = document.querySelectorAll('main section, main article');
    Array.prototype.forEach.call(secciones, function (sec, si) {
      var cands = sec.querySelectorAll(SEL);
      var n = 0;
      Array.prototype.forEach.call(cands, function (el) {
        if (el.closest('form, .rev-ui, .meter, .hint, .mapa')) return;
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
      // botón de nota por sección
      if (sec.tagName === 'SECTION') {
        if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
        var bar = document.createElement('div');
        bar.className = 'rev-ui rev-sec';
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = '💬 Nota';
        b.addEventListener('click', function (e) {
          e.preventDefault(); e.stopPropagation();
          abrir('notas', nombreSeccion(sec));
        });
        bar.appendChild(b);
        sec.appendChild(bar);
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
    Array.prototype.forEach.call(document.querySelectorAll('.rev-sec'), function (b) {
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

  /* -- almacen de audios en el propio navegador ----------- */
  var DB = null;
  function db(cb) {
    if (DB) return cb(DB);
    if (!window.indexedDB) return cb(null);
    var r = indexedDB.open('sh-revision', 1);
    r.onupgradeneeded = function () { r.result.createObjectStore('audios'); };
    r.onsuccess = function () { DB = r.result; cb(DB); };
    r.onerror = function () { cb(null); };
  }
  function guardaAudio(nombre, blob, cb) {
    db(function (d) {
      if (!d) return cb && cb(false);
      var tx = d.transaction('audios', 'readwrite');
      tx.objectStore('audios').put(blob, nombre);
      tx.oncomplete = function () { cb && cb(true); };
      tx.onerror = function () { cb && cb(false); };
    });
  }
  function leeAudio(nombre, cb) {
    db(function (d) {
      if (!d) return cb(null);
      var q = d.transaction('audios').objectStore('audios').get(nombre);
      q.onsuccess = function () { cb(q.result || null); };
      q.onerror = function () { cb(null); };
    });
  }
  function borraAudios() { db(function (d) { if (d) d.transaction('audios', 'readwrite').objectStore('audios').clear(); }); }

  function bajaAudio(nombre, blob) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }

  /* -- nota de voz ---------------------------------------- */
  var mr = null, trozos = [], t0 = 0, cron = null;

  function grabar(boton) {
    if (mr) { mr.stop(); return; }
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
        var blob = new Blob(trozos, { type: mr.mimeType || 'audio/webm' });
        mr = null;
        boton.classList.remove('grabando');
        boton.textContent = '🎙 Grabar audio';
        if (seg < 1) return;
        st.audios = (st.audios || 0) + 1;
        var nombre = 'nota-voz-' + st.audios + '.webm';
        var campo = document.getElementById('rev-txt');
        var extra = campo ? campo.value : '';
        if (campo) campo.value = '';
        st.notas.push({
          texto: '🎙 Nota de voz de ' + seg + ' s (' + nombre + ')' +
                 (extra.trim() ? String.fromCharCode(10) + extra.trim() : ''),
          audio: nombre, seg: seg,
          seccion: (document.getElementById('rev-sec') || {}).value || '',
          ruta: RUTA, pagina: TITULO
        });
        guardar();
        guardaAudio(nombre, blob, function (ok) {
          aviso(ok ? 'Audio guardado: puedes oirlo y descargarlo cuando quieras.'
                   : 'No he podido guardarlo aqui; te lo descargo.');
          if (!ok) bajaAudio(nombre, blob);
          pintar();
        });
        pintar();
      };
      mr.start();
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
    if (!a) return;
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
    '<div class="fila"><button type="button" class="rev-btn p" id="rev-copiar">Copiar todo</button>' +
    '<button type="button" class="rev-btn s" id="rev-bajar">Descargar</button></div>' +
    '<div class="fila"><button type="button" class="rev-btn wa" id="rev-wa">Enviar por WhatsApp</button></div>' +
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
          '<a href="' + R + p.ruta + '" style="color:#28407f;text-decoration:none;font-weight:600">' + p.titulo + '</a></div>';
      });
      body.innerHTML = h;
    }).catch(function () {
      body.innerHTML = '<p class="rev-vacio">Usa el menú de arriba para cambiar de página.</p>';
    });
  }

  /* ── exportar ──────────────────────────────────────────── */
  function informe() {
    var hoy = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    var l = ['# Cambios para la web de S&H Abogadas', '',
      hoy + ' · ' + nEdits() + ' cambios de texto · ' + nNotas() + ' notas', ''];
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
      l.push('---', 'Hay ' + conAudio.length + ' nota(s) de voz. Descárgalas desde el panel y adjúntalas:');
      conAudio.forEach(function (n) { l.push('- ' + n.audio + ' (' + n.seg + ' s)'); });
      l.push('');
    }
    if (!nEdits() && !nNotas()) l.push('(sin cambios todavía)');
    return l.join('\n');
  }

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

  panel.querySelector('#rev-wa').addEventListener('click', function () {
    var t = informe();
    if (t.length > 1600) {
      aviso('Son muchos cambios para WhatsApp: mejor «Descargar» y envía el archivo.');
      return;
    }
    window.open('https://wa.me/?text=' + encodeURIComponent(t), '_blank');
  });

  panel.querySelector('#rev-salir').addEventListener('click', function () {
    if (nEdits() + nNotas() && !confirm('Tienes cambios guardados. Salir no los borra: seguirán aquí cuando vuelvas a entrar con el enlace de revisión. ¿Salir?')) return;
    try { localStorage.removeItem('sh-rev-on'); } catch (e) {}
    location.href = location.pathname;
  });

  panel.querySelector('#rev-limpiar').addEventListener('click', function () {
    if (!confirm('¿Borrar todos los cambios y notas guardados? No se puede deshacer.')) return;
    st = { textos: {}, notas: [] };
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
    pill.innerHTML = (activo ? '✏️ Revisión activa' : '👁 Modo revisión') + (n ? ' <b>' + n + '</b>' : '');
    pill.classList.toggle('rev-off', !activo);
  }

  var activo = false;
  pill.addEventListener('click', function () { abrir('cambios'); });

  function ayuda() {
    var vieja = document.querySelector('.rev-ayuda');
    if (vieja) vieja.remove();
    var d = document.createElement('div');
    d.className = 'rev-ui rev-ayuda';
    d.innerHTML = '<b>Modo revisión</b><ul>' +
      '<li>✏️ <b>Pincha un texto y escribe encima.</b></li>' +
      '<li>🔁 <b>Titulares:</b> 5 versiones para probar.</li>' +
      '<li>🎤 <b>¿Mejor hablando?</b> Dicta el texto o graba un audio.</li>' +
      '<li>🗑️ <b>Borra el texto</b> de algo y se quita de la web.</li>' +
      '<li>💬 <b>Nota:</b> un comentario en esa sección.</li>' +
      '<li>📤 <b>Al acabar:</b> la pastilla de abajo → Copiar o Descargar.</li>' +
      '</ul><i>No cambia la web: es una propuesta, y se guarda aunque cierres.<br>' +
      'Como mi prima no se calla ni bajo del agua, espero que mandando un audio tenga facilidades para llevar a cabo esta hazaña.</i>' +
      '<button type="button">Entendido, empiezo</button>';
    document.body.appendChild(d);
    d.querySelector('button').addEventListener('click', function () { d.remove(); });
  }

  /* arranque */
  preparar();
  activo = true;
  activarEdicion(true);
  pintarContador();
  ayuda();

  window.SHRevision = { informe: informe, estado: function () { return st; }, abrir: abrir };
})();
