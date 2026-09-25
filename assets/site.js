(function(){
  "use strict";
  var y = document.getElementById('y'); if (y) y.textContent = new Date().getFullYear();
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* menú móvil */
  var burger = document.getElementById('burger'), menu = document.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', function(){
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        menu.classList.remove('open'); burger.setAttribute('aria-expanded','false'); burger.focus();
      }
    });
  }

  /* header al hacer scroll */
  var hdr = document.getElementById('hdr');
  var onScroll = function(){ hdr.classList.toggle('stuck', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});

  /* aparición suave */
  var rvs = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var rv = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting) { en.target.classList.add('in'); rv.unobserve(en.target); }
      });
    }, {rootMargin:'0px 0px -8% 0px', threshold:.06});
    Array.prototype.forEach.call(rvs, function(el){ rv.observe(el); });
  } else {
    Array.prototype.forEach.call(rvs, function(el){ el.classList.add('in'); });
  }

  /* un solo área abierta a la vez */
  var areas = document.querySelectorAll('details.area');
  Array.prototype.forEach.call(areas, function(d){
    d.addEventListener('toggle', function(){
      if (!d.open) return;
      Array.prototype.forEach.call(areas, function(o){ if (o !== d) o.open = false; });
    });
  });
  /* #ancla a un desplegable lo abre */
  if (location.hash) {
    var d0 = document.getElementById(location.hash.slice(1));
    if (d0 && d0.tagName === 'DETAILS') { d0.open = true; }
  }

  /* la banda: la foto se mueve más despacio que la página */
  (function(){
    var band = document.querySelector('.band'), bg = band && band.querySelector('img.bg');
    if (!bg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var t = false;
    function mover(){
      t = false;
      var r = band.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var y = (r.top + r.height / 2 - window.innerHeight / 2) * -0.22;
      bg.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0) scale(1.3)';
    }
    function pedir(){ if (!t) { t = true; requestAnimationFrame(mover); } }
    window.addEventListener('scroll', pedir, {passive:true});
    window.addEventListener('resize', pedir);
    mover();
  })();

  /* mapas: se cargan al pulsar */
  Array.prototype.forEach.call(document.querySelectorAll('.mapa[data-src]'), function(box){
    var b = box.querySelector('button');
    if (!b) return;
    b.addEventListener('click', function(){
      var f = document.createElement('iframe');
      f.src = box.getAttribute('data-src'); f.loading = 'lazy'; f.title = 'Mapa'; f.referrerPolicy = 'no-referrer-when-downgrade';
      f.setAttribute('allowfullscreen', '');
      box.innerHTML = ''; box.appendChild(f); box.classList.add('cargado');
    });
  });

  /* formulario -> correo ya redactado (sin backend) */
  var form = document.getElementById('form'), note = document.getElementById('note');
  if (form) {
    var q = new URLSearchParams(location.search).get('asunto');
    if (q === 'online') {
      var sel = document.getElementById('asunto');
      Array.prototype.forEach.call(sel.options, function(o){ if (/online/i.test(o.text)) sel.value = o.text; });
    }
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if (!form.checkValidity()) {
        var bad = form.querySelector(':invalid'); if (bad) bad.focus();
        note.textContent = 'Revisa los campos marcados: faltan datos para poder responderte.';
        note.style.color = '#c0392b';
        return;
      }
      var v = function(id){ return (document.getElementById(id).value || '').trim(); };
      var NL = String.fromCharCode(10);
      var cuerpo = 'Nombre: ' + v('nombre') + NL + 'Correo: ' + v('email') + NL +
        'Teléfono: ' + (v('tel') || '—') + NL + 'Mejor hora para llamar: ' + (v('hora') || '—') + NL + NL +
        v('consulta') + NL + NL + '— Enviado desde shabogadas.com';
      window.location.href = 'mailto:info@shabogadas.com?subject=' + encodeURIComponent('Consulta web · ' + v('asunto')) +
        '&body=' + encodeURIComponent(cuerpo);
      note.textContent = 'Abriendo tu programa de correo… Si no se abre, escríbenos a info@shabogadas.com.';
      note.style.color = '';
    });
  }
})();
