/* Reserva de la primera reunión (demo): cómo → con quién → cuándo → datos → pago → confirmación.
   Los huecos libres son de ejemplo (deterministas por fecha y abogada); en la web real vendrán de los
   calendarios de cada abogada y el pago de la pasarela. No se envía nada a ningún sitio. */
(function () {
  var box = document.getElementById('reserva');
  if (!box) return;
  var cuerpo = document.getElementById('reserva-cuerpo');
  var pasos = box.querySelectorAll('.reserva-pasos li');
  var ABOG = JSON.parse(box.getAttribute('data-abogadas'));
  var OFIS = JSON.parse(box.getAttribute('data-oficinas'));
  var PRECIOS = JSON.parse(box.getAttribute('data-precios') || '{}');
  function precioTxt() { return PRECIOS[s.dur] || '<span class="todo">importe por fijar</span>'; }
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var HORAS = ['09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '16:30', '17:00', '17:30', '18:00', '18:30'];
  var DURS = (box.getAttribute('data-duraciones') || '30').split(',').map(Number);
  var s = { modo: null, abog: null, dia: null, hora: null, quien: null, datos: {}, dur: DURS[0] };

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hash(t) { var h = 7; for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) % 1000003; return h; }
  function libre(fecha, abog, hora) { return hash(fecha + abog + hora) % 10 < 4; }
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function fechaLarga(d) { return DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()]; }
  function abogada(id) { return ABOG.filter(function (a) { return a.id === id; })[0]; }
  function durTxt() { return s.dur === 60 ? '1 hora' : s.dur + ' minutos'; }
  function modoTxt() { return s.modo === 'online' ? 'Videollamada' : 'Presencial en ' + s.modo; }

  function dias() {
    var out = [], d = new Date(); d.setHours(0, 0, 0, 0);
    while (out.length < 10) { d.setDate(d.getDate() + 1); if (d.getDay() > 0 && d.getDay() < 6) out.push(new Date(d)); }
    return out;
  }
  function huecos(dia) {
    var f = iso(dia), ids = s.abog === 'cualquiera' ? ABOG.map(function (a) { return a.id; }) : [s.abog], out = [];
    HORAS.forEach(function (h) {
      for (var i = 0; i < ids.length; i++) if (libre(f, ids[i], h)) { out.push({ hora: h, quien: ids[i] }); break; }
    });
    return out;
  }

  function marcar(n) {
    pasos.forEach(function (li) { var k = +li.getAttribute('data-n'); li.className = k < n ? 'hecho' : (k === n ? 'on' : ''); });
  }
  function atras(n) { return '<button type="button" class="reserva-atras" data-ir="' + n + '">← Atrás</button>'; }
  function resumen() {
    var a = s.quien ? abogada(s.quien) : null;
    return '<div class="reserva-resumen"><span>' + modoTxt() + '</span>' + (a ? '<span>' + esc(a.nombre) + '</span>' : '') +
      (s.dia && s.hora ? '<span>' + fechaLarga(s.dia) + ' · ' + s.hora + ' h</span>' : '') + '<span>' + durTxt() + ' · ' + precioTxt() + '</span></div>';
  }

  var vistas = {
    1: function () {
      var op = '<button type="button" class="reserva-op" data-modo="online"><b>Online</b><span>Por videollamada, desde donde estés. Te enviamos el enlace.</span></button>';
      OFIS.forEach(function (c) { op += '<button type="button" class="reserva-op" data-modo="' + esc(c) + '"><b>Presencial en ' + esc(c) + '</b><span>En nuestro despacho de ' + esc(c) + '.</span></button>'; });
      var du = DURS.length < 2 ? '' : '<h3>¿Cuánto tiempo necesitas?</h3><div class="reserva-ops">' + DURS.map(function (d) {
        return '<button type="button" class="reserva-op' + (d === s.dur ? ' on' : '') + '" data-dur="' + d + '" aria-pressed="' + (d === s.dur) + '"><b>' + (d === 60 ? '1 hora' : d + ' minutos') + '</b><span>' + (d === 60 ? 'Para asuntos que necesitan más detalle. Máximo una hora.' : 'Para una duda concreta o una primera valoración.') + '</span></button>';
      }).join('') + '</div>';
      return du + '<h3>¿Cómo quieres reunirte?</h3><p class="reserva-nota">Online o presencial, la misma abogada, el mismo tiempo y la misma garantía de asesoramiento.</p><div class="reserva-ops">' + op + '</div>';
    },
    2: function () {
      var op = '';
      ABOG.forEach(function (a) {
        op += '<button type="button" class="reserva-op reserva-abog" data-abog="' + a.id + '"><img src="' + a.foto + '" alt="" width="56" height="56"><b>' + esc(a.nombre) + '</b><span>' + esc(a.areas) + '</span></button>';
      });
      op += '<button type="button" class="reserva-op" data-abog="cualquiera"><b>Me da igual</b><span>Te enseñamos la primera hora libre de cualquiera de las dos.</span></button>';
      return resumen() + '<h3>¿Con quién?</h3><div class="reserva-ops">' + op + '</div>' + atras(1);
    },
    3: function () {
      var ds = dias();
      if (!s.dia) s.dia = ds[0];
      var tabs = ds.map(function (d) {
        var on = iso(d) === iso(s.dia) ? ' on' : '', n = huecos(d).length;
        return '<button type="button" class="reserva-dia' + on + '" data-dia="' + iso(d) + '"' + (n ? '' : ' disabled') + '><small>' + DIAS[d.getDay()].slice(0, 3) + '</small><b>' + d.getDate() + '</b><small>' + MESES[d.getMonth()].slice(0, 3) + '</small></button>';
      }).join('');
      var hs = huecos(s.dia).map(function (h) {
        var tag = s.abog === 'cualquiera' ? '<small>' + esc(abogada(h.quien).nombre.split(' ')[0]) + '</small>' : '';
        return '<button type="button" class="reserva-hora" data-hora="' + h.hora + '" data-quien="' + h.quien + '">' + h.hora + tag + '</button>';
      }).join('');
      return resumen() + '<h3>Elige día y hora</h3><p class="reserva-nota">Solo ves las horas libres en el calendario' + (s.abog === 'cualquiera' ? ' de las dos abogadas' : '') + '.</p>' +
        '<div class="reserva-dias">' + tabs + '</div><p class="reserva-fecha">' + fechaLarga(s.dia) + '</p><div class="reserva-horas">' + (hs || '<p>No quedan huecos este día.</p>') + '</div>' + atras(2);
    },
    4: function () {
      var d = s.datos;
      return resumen() + '<h3>Tus datos</h3><form id="reserva-form" class="reserva-form" novalidate>' +
        '<div class="field"><label for="r-nombre">Nombre y apellidos *</label><input id="r-nombre" required autocomplete="name" value="' + esc(d.nombre || '') + '"></div>' +
        '<div class="field"><label for="r-email">Correo electrónico *</label><input id="r-email" type="email" required autocomplete="email" value="' + esc(d.email || '') + '"></div>' +
        '<div class="field"><label for="r-tel">Teléfono *</label><input id="r-tel" type="tel" required autocomplete="tel" value="' + esc(d.tel || '') + '"></div>' +
        '<div class="field"><label for="r-motivo">Cuéntanos brevemente tu caso</label><textarea id="r-motivo" rows="4">' + esc(d.motivo || '') + '</textarea></div>' +
        '<label class="consent"><input type="checkbox" id="r-rgpd" required><span>He leído y acepto la política de privacidad.</span></label>' +
        '<p class="reserva-error" id="r-error" hidden>Rellena nombre, correo y teléfono y acepta la política de privacidad.</p>' +
        '<button class="btn btn-primary" type="submit">Continuar al pago</button></form>' + atras(3);
    },
    5: function () {
      return resumen() + '<h3>Pago de la primera reunión</h3><div class="reserva-pago">' +
        '<div class="reserva-total"><span>Primera reunión · ' + durTxt() + '</span><b>' + precioTxt() + '</b></div>' +
        '<div class="field"><label for="r-tarjeta">Número de tarjeta</label><input id="r-tarjeta" inputmode="numeric" placeholder="4242 4242 4242 4242"></div>' +
        '<div class="reserva-fila"><div class="field"><label for="r-cad">Caducidad</label><input id="r-cad" placeholder="MM / AA"></div><div class="field"><label for="r-cvc">CVC</label><input id="r-cvc" inputmode="numeric" placeholder="123"></div></div>' +
        '<button type="button" class="btn btn-primary" id="r-pagar">Pagar y confirmar la cita</button>' +
        '<p class="reserva-nota">Pago seguro con tarjeta. Recibirás el justificante en tu correo.</p></div>' + atras(4);
    },
    6: function () {
      var a = abogada(s.quien);
      var donde = s.modo === 'online' ? 'Te hemos enviado el enlace de la videollamada a ' + esc(s.datos.email) + '.' : 'Te esperamos en el despacho de ' + esc(s.modo) + '. Tienes la dirección en el correo de confirmación.';
      return '<div class="reserva-ok"><span class="reserva-check">✓</span><h3>Cita confirmada</h3>' +
        '<p><b>' + modoTxt() + ' con ' + esc(a.nombre) + '</b><br>' + fechaLarga(s.dia) + ' a las ' + s.hora + ' h · ' + durTxt() + '</p>' +
        '<p>' + donde + ' La cita ya está en el calendario de ' + esc(a.nombre.split(' ')[0]) + '.</p>' +
        '<button type="button" class="btn btn-ghost" data-ir="1">Hacer otra reserva</button></div>';
    }
  };

  function ir(n) {
    marcar(Math.min(n, 5));
    if (n === 6) pasos.forEach(function (li) { li.className = 'hecho'; });
    cuerpo.innerHTML = vistas[n]();
    if (n === 1) s = { modo: null, abog: null, dia: null, hora: null, quien: null, datos: s.datos, dur: s.dur };
    if (n > 1) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  cuerpo.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-ir')) return ir(+b.getAttribute('data-ir'));
    if (b.hasAttribute('data-dur')) { s.dur = +b.getAttribute('data-dur'); cuerpo.innerHTML = vistas[1](); return; }
    if (b.hasAttribute('data-modo')) { s.modo = b.getAttribute('data-modo'); return ir(2); }
    if (b.hasAttribute('data-abog')) { s.abog = b.getAttribute('data-abog'); s.dia = null; s.quien = s.abog === 'cualquiera' ? null : s.abog; return ir(3); }
    if (b.hasAttribute('data-dia')) { s.hora = null; var p = b.getAttribute('data-dia').split('-'); s.dia = new Date(+p[0], +p[1] - 1, +p[2]); return ir(3); }
    if (b.hasAttribute('data-hora')) { s.hora = b.getAttribute('data-hora'); s.quien = b.getAttribute('data-quien'); return ir(4); }
    if (b.id === 'r-pagar') { b.disabled = true; b.textContent = 'Procesando…'; setTimeout(function () { ir(6); }, 900); }
  });
  cuerpo.addEventListener('submit', function (e) {
    e.preventDefault();
    var g = function (id) { return document.getElementById(id).value.trim(); };
    s.datos = { nombre: g('r-nombre'), email: g('r-email'), tel: g('r-tel'), motivo: g('r-motivo') };
    var ok = s.datos.nombre && /.+@.+\..+/.test(s.datos.email) && s.datos.tel && document.getElementById('r-rgpd').checked;
    document.getElementById('r-error').hidden = !!ok;
    if (ok) ir(5);
  });

  ir(1);
})();
