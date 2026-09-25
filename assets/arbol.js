(function(){
  "use strict";
  /* el baobab: scroll -> hojas */
  (function(){
    var scene = document.getElementById('scene');
    if (!scene) return;
    var fino = window.matchMedia('(max-width: 900px)').matches ||
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (fino) {
      /* móvil: el árbol se queda arriba y cada texto, al pasar, enciende su hoja */
      var mb = [].slice.call(scene.querySelectorAll('.bud')),
          mi = [].slice.call(scene.querySelectorAll('.mitem')),
          mn = document.getElementById('mnum'), mbar = document.getElementById('mbar');
      scene.classList.add('live');
      if (!('IntersectionObserver' in window)) {
        mb.forEach(function(b){ b.classList.add('on'); });
        mi.forEach(function(x){ x.classList.add('now'); });
        return;
      }
      var mio = new IntersectionObserver(function(es){
        es.forEach(function(e){
          if (!e.isIntersecting) return;
          var k = parseInt(e.target.getAttribute('data-i'), 10);
          mi.forEach(function(x){ x.classList.remove('now'); });
          e.target.classList.add('now');
          if (isNaN(k)) { mb.forEach(function(b){ b.classList.add('on'); b.classList.remove('now'); }); mn.textContent = '08 / 08'; mbar.style.width = '100%'; return; }
          mb.forEach(function(b, j){ b.classList.toggle('on', j <= k); b.classList.toggle('now', j === k); });
          mn.textContent = ('0' + (k + 1)).slice(-2) + ' / 08';
          mbar.style.width = ((k + 1) / 8 * 100).toFixed(0) + '%';
        });
      }, {rootMargin:'-45% 0px -40% 0px', threshold:0});
      mi.forEach(function(x){ mio.observe(x); });
      return;
    }

    var stage  = document.getElementById('stage'),
        tree   = document.getElementById('tree'),
        finale = document.getElementById('finale'),
        mnum   = document.getElementById('mnum'),
        mbar   = document.getElementById('mbar'),
        buds   = [].slice.call(scene.querySelectorAll('.bud')),
        cards  = [].slice.call(scene.querySelectorAll('.card')),
        N = cards.length,
        INI = 0.14, FIN = 0.90, PASO = (FIN - INI) / N,
        activa = -2, ticking = false;

    scene.classList.add('live');

    function pintar(){
      ticking = false;
      var top = scene.getBoundingClientRect().top,
          rec = scene.offsetHeight - window.innerHeight;
      if (rec <= 0) return;
      var p = Math.min(1, Math.max(0, -top / rec));

      tree.style.setProperty('--grow', Math.min(1, p / (INI * 0.8)).toFixed(3));

      var i = p < INI ? -1 : (p >= FIN ? N : Math.floor((p - INI) / PASO));
      if (i > N) i = N;
      if (i !== activa) {
        activa = i;
        cards.forEach(function(c, k){ c.classList.toggle('on', k === i); });
        buds.forEach(function(b, k){
          b.classList.toggle('on', k <= i);
          b.classList.toggle('now', k === i);
        });
        finale.classList.toggle('on', i >= N);
        stage.classList.toggle('busy', i >= 0);
        stage.classList.toggle('fin', i >= N);
        if (i >= 0) mnum.textContent = ('0' + Math.min(i + 1, N)).slice(-2) + ' / 0' + N;
      }
      mbar.style.width = (Math.min(1, Math.max(0, (p - INI) / (FIN - INI))) * 100).toFixed(1) + '%';
    }

    function pedir(){ if (!ticking) { ticking = true; requestAnimationFrame(pintar); } }
    window.addEventListener('scroll', pedir, {passive:true});
    window.addEventListener('resize', pedir);
    pintar();
  })();

  /* el árbol alto: la tinta sigue al scroll, las hojas salen de los lados */
  (function(){
    var movil = window.matchMedia('(max-width: 900px)').matches,
        b = document.getElementById(movil ? 'bosque-m' : 'bosque');
    if (!b) return;
    var fino = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ink = document.getElementById(movil ? 'ink-m' : 'ink'), t = false,
        hojas = [].slice.call(b.querySelectorAll('.hoja2, .hoja2m, .rama-hoja'));
    if (!fino) {
      function tinta(){
        t = false;
        var r = b.getBoundingClientRect();
        var p = Math.min(1, Math.max(0, (window.innerHeight * (movil ? 0.72 : 0.66) - r.top) / r.height));
        ink.style.setProperty('--ink', p.toFixed(4));
        hojas.forEach(function(h){ if (p >= parseFloat(h.getAttribute('data-y')) - 0.012) h.classList.add('on'); });
        if (p > 0.035) b.classList.add('copa-on');
      }
      function pedir(){ if (!t) { t = true; requestAnimationFrame(tinta); } }
      window.addEventListener('scroll', pedir, {passive:true});
      window.addEventListener('resize', pedir);
      tinta();
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function(es){
        es.forEach(function(e){
          if (!e.isIntersecting) return;
          if (e.target.id === 'copa-sentinela') { b.classList.add('copa-on'); }
          else { e.target.classList.add('on'); }
          io.unobserve(e.target);
        });
      }, {rootMargin:'0px 0px -28% 0px', threshold:0.01});
      if (fino) Array.prototype.forEach.call(b.querySelectorAll('#copa-sentinela'), function(el){ io.observe(el); });
      Array.prototype.forEach.call(b.querySelectorAll('.copa-hoja'), function(el, n){
        el.style.setProperty('--d', (n * 0.07).toFixed(2) + 's');
      });
    } else {
      b.classList.add('copa-on');
      Array.prototype.forEach.call(b.querySelectorAll('.hoja2'), function(el){ el.classList.add('on'); });
    }
  })();
})();
