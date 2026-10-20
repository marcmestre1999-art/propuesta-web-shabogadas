/* Reserva de la primera reunión (demo): cómo → cuándo → datos → solicitud recibida.
   Sin elegir abogada ni pago online (Marc, 20-oct-2026): el despacho confirma la cita y explica cómo pagarla.
   Los huecos libres son de ejemplo (deterministas por fecha); en la web real vendrán del calendario del despacho.
   No se envía nada a ningún sitio. */
(function () {
  var box = document.getElementById('reserva');
  if (!box) return;
  var cuerpo = document.getElementById('reserva-cuerpo');
  var pasos = box.querySelectorAll('.reserva-pasos li');
  var OFIS = JSON.parse(box.getAttribute('data-oficinas'));
  var PRECIOS = JSON.parse(box.getAttribute('data-precios') || '{}');
  function precioTxt() { return PRECIOS[s.dur] || '<span class="todo">importe por fijar</span>'; }
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var HORAS = ['09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '16:30', '17:00', '17:30', '18:00', '18:30'];
  var DURS = (box.getAttribute('data-duraciones') || '30').split(',').map(Number);
  var s = { modo: null, dia: null, hora: null, datos: {}, dur: DURS[0] };

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hash(t) { var h = 7; for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) % 1000003; return h; }
  function libre(fecha, hora) { return hash(fecha + hora) % 10 < 5; }
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function fechaLarga(d) { return DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()]; }
  function durTxt() { return s.dur === 60 ? '1 hora' : s.dur + ' minutos'; }
  function modoTxt() { return s.modo === 'online' ? 'Videollamada' : 'Presencial en ' + s.modo; }

  function dias() {
    var out = [], d = new Date(); d.setHours(0, 0, 0, 0);
    while (out.length < 10) { d.setDate(d.getDate() + 1); if (d.getDay() > 0 && d.getDay() < 6) out.push(new Date(d)); }
    return out;
  }
  function huecos(dia) {
    var f = iso(dia);
    return HORAS.filter(function (h) { return libre(f, h); });
  }

  function marcar(n) {
    pasos.forEach(function (li) { var k = +li.getAttribute('data-n'); li.className = k < n ? 'hecho' : (k === n ? 'on' : ''); });
  }
  function atras(n) { return '<button type="button" class="reserva-atras" data-ir="' + n + '">← Atrás</button>'; }
  function resumen() {
    return '<div class="reserva-resumen"><span>' + modoTxt() + '</span>' +
      (s.dia && s.hora ? '<span>' + fechaLarga(s.dia) + ' · ' + s.hora + ' h</span>' : '') + '<span>' + durTxt() + ' · ' + precioTxt() + '</span></div>';
  }

  var vistas = {
    1: function () {
      var op = '<button type="button" class="reserva-op" data-modo="online"><b>Online</b><span>Por videollamada, desde donde estés. Te enviamos el enlace.</span></button>';
      OFIS.forEach(function (c) { op += '<button type="button" class="reserva-op" data-modo="' + esc(c) + '"><b>Presencial en ' + esc(c) + '</b><span>En nuestro despacho de ' + esc(c) + '.</span></button>'; });
      var du = DURS.length < 2 ? '' : '<h3>¿Cuánto tiempo necesitas?</h3><div class="reserva-ops">' + DURS.map(function (d) {
        return '<button type="button" class="reserva-op' + (d === s.dur ? ' on' : '') + '" data-dur="' + d + '" aria-pressed="' + (d === s.dur) + '"><b>' + (d === 60 ? '1 hora' : d + ' minutos') + '</b><span>' + (d === 60 ? 'Para asuntos que necesitan más detalle. Máximo una hora.' : 'Para una duda concreta o una primera valoración.') + '</span></button>';
      }).join('') + '</div>';
      return du + '<h3>¿Cómo quieres reunirte?</h3><p class="reserva-nota">Online o presencial, el mismo tiempo y la misma garantía de asesoramiento.</p><div class="reserva-ops">' + op + '</div>';
    },
    2: function () {
      var ds = dias();
      if (!s.dia) s.dia = ds[0];
      var tabs = ds.map(function (d) {
        var on = iso(d) === iso(s.dia) ? ' on' : '', n = huecos(d).length;
        return '<button type="button" class="reserva-dia' + on + '" data-dia="' + iso(d) + '"' + (n ? '' : ' disabled') + '><small>' + DIAS[d.getDay()].slice(0, 3) + '</small><b>' + d.getDate() + '</b><small>' + MESES[d.getMonth()].slice(0, 3) + '</small></button>';
      }).join('');
      var hs = huecos(s.dia).map(function (h) {
        return '<button type="button" class="reserva-hora" data-hora="' + h + '">' + h + '</button>';
      }).join('');
      return resumen() + '<h3>Elige día y hora</h3><p class="reserva-nota">Solo ves las horas que tenemos libres.</p>' +
        '<div class="reserva-dias">' + tabs + '</div><p class="reserva-fecha">' + fechaLarga(s.dia) + '</p><div class="reserva-horas">' + (hs || '<p>No quedan huecos este día.</p>') + '</div>' + atras(1);
    },
    3: function () {
      var d = s.datos;
      return resumen() + '<h3>Tus datos</h3><form id="reserva-form" class="reserva-form" novalidate>' +
        '<div class="field"><label for="r-nombre">Nombre y apellidos *</label><input id="r-nombre" required autocomplete="name" value="' + esc(d.nombre || '') + '"></div>' +
        '<div class="field"><label for="r-email">Correo electrónico *</label><input id="r-email" type="email" required autocomplete="email" value="' + esc(d.email || '') + '"></div>' +
        '<div class="field"><label for="r-tel">Teléfono *</label><input id="r-tel" type="tel" required autocomplete="tel" value="' + esc(d.tel || '') + '"></div>' +
        '<div class="field"><label for="r-motivo">Cuéntanos brevemente tu caso</label><textarea id="r-motivo" rows="4">' + esc(d.motivo || '') + '</textarea></div>' +
        '<label class="consent"><input type="checkbox" id="r-rgpd" required><span>He leído y acepto la política de privacidad.</span></label>' +
        '<p class="reserva-error" id="r-error" hidden>Rellena nombre, correo y teléfono y acepta la política de privacidad.</p>' +
        '<button class="btn btn-primary" type="submit">Solicitar la cita</button></form>' + atras(2);
    },
    4: function () {
      var donde = s.modo === 'online' ? 'Con la confirmación te enviamos el enlace de la videollamada.' : 'Te esperamos en el despacho de ' + esc(s.modo) + '.';
      return '<div class="reserva-ok"><span class="reserva-check">✓</span><h3>Solicitud recibida</h3>' +
        '<p><b>' + modoTxt() + '</b><br>' + fechaLarga(s.dia) + ' a las ' + s.hora + ' h · ' + durTxt() + ' · <span style="white-space:nowrap">' + precioTxt() + '</span></p>' +
        '<p>Te escribimos a ' + esc(s.datos.email) + ' para confirmar la cita y explicarte cómo pagarla. ' + donde + '</p>' +
        '<button type="button" class="btn btn-ghost" data-ir="1">Hacer otra reserva</button></div>';
    }
  };

  function ir(n) {
    marcar(Math.min(n, 3));
    if (n === 4) pasos.forEach(function (li) { li.className = 'hecho'; });
    cuerpo.innerHTML = vistas[n]();
    if (n === 1) s = { modo: null, dia: null, hora: null, datos: s.datos, dur: s.dur };
    if (n > 1) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  cuerpo.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-ir')) return ir(+b.getAttribute('data-ir'));
    if (b.hasAttribute('data-dur')) { s.dur = +b.getAttribute('data-dur'); cuerpo.innerHTML = vistas[1](); return; }
    if (b.hasAttribute('data-modo')) { s.modo = b.getAttribute('data-modo'); s.dia = null; return ir(2); }
    if (b.hasAttribute('data-dia')) { s.hora = null; var p = b.getAttribute('data-dia').split('-'); s.dia = new Date(+p[0], +p[1] - 1, +p[2]); return ir(2); }
    if (b.hasAttribute('data-hora')) { s.hora = b.getAttribute('data-hora'); return ir(3); }
  });
  cuerpo.addEventListener('submit', function (e) {
    e.preventDefault();
    var g = function (id) { return document.getElementById(id).value.trim(); };
    s.datos = { nombre: g('r-nombre'), email: g('r-email'), tel: g('r-tel'), motivo: g('r-motivo') };
    var ok = s.datos.nombre && /.+@.+\..+/.test(s.datos.email) && s.datos.tel && document.getElementById('r-rgpd').checked;
    document.getElementById('r-error').hidden = !!ok;
    if (ok) ir(4);
  });

  ir(1);
})();
