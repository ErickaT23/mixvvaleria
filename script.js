/* ===========================
   Invitación Quinceaños - script.js (consolidado)
   Requisitos:
   1) Cargar primero invitados.js (expone window.invitados = { ... })
      <script src="invitados.js"></script>
      <script src="script.js"></script>
   2) Elementos usados (si existen en tu HTML):
      #envelope, #invitacion, #seal, #musica
      #nombreInvitado, #cantidadPases, #badgeInvitado
      #dias, #horas, #minutos, #segundos
      #photo-modal, #main-photo-modal, .close
      #starfield
      #mostrarFormularioBtn, #formularioDeseo, #verDeseosBtn, #wishesContainer
      .block--video .block-video
=========================== */

/* ---------- Abrir invitación (sobre) y música ---------- */
function abrirInvitacion() {
  const envelope   = document.getElementById('envelope');
  const invitacion = document.getElementById('invitacion');
  const musica     = document.getElementById('musica');

  if (!envelope || !invitacion) return;

  if (!envelope.classList.contains('open')) {
    envelope.classList.add('open');

    setTimeout(() => {
      envelope.style.display   = 'none';
      invitacion.style.display = 'block';

      // Repinta por si los nodos estaban ocultos
      pintarInvitadoEnUI(getInvitadoDesdeQuery());

      if (musica && musica.paused) {
        musica.play().catch(() => {/* autoplay bloqueado por navegador */});
      }
    }, 1000);
  } else {
    if (musica) {
      if (musica.paused) musica.play().catch(()=>{});
      else musica.pause();
    }
  }
}

/* ---------- Invitados: leer query y pintar en UI ---------- */
function getInvitadoDesdeQuery() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const fallbackNombre = params.get('nombre'); // opcional ?nombre=Valeria
  const data = (window.invitados || {});
  if (id && data && (data[id] || data[String(id)])) {
    return data[id] || data[String(id)];
  }
  if (fallbackNombre) return { nombre: fallbackNombre, pases: '' };
  return null;
}

function pintarInvitadoEnUI(invitado) {
  if (!invitado) return;

  // Soporta IDs duplicados de forma resiliente
  const nombreEls = document.querySelectorAll('#nombreInvitado');
  const pasesEls  = document.querySelectorAll('#cantidadPases');
  const badge     = document.getElementById('badgeInvitado');

  nombreEls.forEach(el => {
    el.innerText = `${invitado.nombre}`;
    el.classList.add('fondo-nombre');
  });

  pasesEls.forEach(el => {
    if (invitado.pases) {
      const cantidad = Number(invitado.pases);
      const palabra = cantidad === 1 ? 'persona' : 'personas';
      el.innerText = `Invitación válida para ${cantidad} ${palabra}`;
    } else {
      el.innerText = '';
    }
    el.classList.add('fondo-pases');
  });

  if (badge) {
    badge.textContent = invitado.nombre;
    badge.style.display = 'block';
  }
}

function cargarDatosInvitado() {
  const invitado = getInvitadoDesdeQuery();
  if (!invitado) {
    console.warn('[invitados] No hay ?id= válido ni ?nombre= en la URL.');
    return;
  }
  pintarInvitadoEnUI(invitado);

  // Si los nodos aparecen después (por mostrar secciones), repinta una vez
  let repintado = false;
  const obs = new MutationObserver(() => {
    const faltaNombre = !document.getElementById('nombreInvitado');
    const faltaPases  = !document.getElementById('cantidadPases');
    if ((!faltaNombre || !faltaPases) && !repintado) {
      pintarInvitadoEnUI(invitado);
      repintado = true;
      obs.disconnect();
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
}


/* ---------- Contador ---------- */
function iniciarContador() {
  const eventoFecha = new Date("November 29, 2025 00:00:00").getTime();

  setInterval(() => {
    const t = eventoFecha - Date.now();
    const dias     = Math.floor(t / 86400000);
    const horas    = Math.floor((t % 86400000) / 3600000);
    const minutos  = Math.floor((t % 3600000) / 60000);
    const segundos = Math.floor((t % 60000) / 1000);

    const d = document.getElementById("dias");
    const h = document.getElementById("horas");
    const m = document.getElementById("minutos");
    const s = document.getElementById("segundos");

    if (d) d.innerText = Math.max(0, dias);
    if (h) h.innerText = Math.max(0, horas);
    if (m) m.innerText = Math.max(0, minutos);
    if (s) s.innerText = Math.max(0, segundos);
  }, 1000);
}

/* ---------- Galería / Modal ---------- */
function changePhoto(element) {
  const mainPhotoModal = document.getElementById('main-photo-modal');
  if (!mainPhotoModal || !element) return;
  mainPhotoModal.src = element.src;
  openModal();
}

function openModal() {
  const modal = document.getElementById('photo-modal');
  if (!modal) return;
  modal.style.display = 'flex';
}

function closeModal(event) {
  const modal = document.getElementById('photo-modal');
  if (!modal) return;

  const targetIsOverlay  = event?.target?.id === 'photo-modal';
  const targetIsCloseBtn = event?.target?.classList?.contains('close') || event?.target?.className === 'close';
  if (targetIsOverlay || targetIsCloseBtn) modal.style.display = 'none';
}

/* ---------- Fade-in on scroll ---------- */
function initFadeInOnScroll() {
  const els = document.querySelectorAll('.fade-in-element');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        o.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  els.forEach(el => obs.observe(el));
}

/* ---------- Confirmar asistencia (Google Forms) ---------- */
function confirmarAsistencia() {
  const params = new URLSearchParams(window.location.search);
  const invitadoId = params.get("id");
  const invitado = (window.invitados || {})[invitadoId];

  if (!invitado) { alert("Invitado no encontrado."); return; }

  const baseURL     = "https://docs.google.com/forms/d/e/1FAIpQLSedwNzh7uiU7zTThM3COblNHu86Kj0HVD1Jw44gd3vcH5kGHg/viewform?usp=pp_url";
  const nombreField = "entry.1297710131";
  const pasesField  = "entry.1099367965";

  const formURL = `${baseURL}&${nombreField}=${encodeURIComponent(invitado.nombre)}&${pasesField}=${invitado.pases}`;
  window.open(formURL, "_blank");
}

/* ---------- Mapas ---------- */
function elegirAplicacion() {
  window.open('https://maps.app.goo.gl/RyBzj2xNxDKWdJaE9', '_blank');
}
function elegirAplicacionOtraDireccion() {
  window.open('https://maps.app.goo.gl/9F42xmijRvivmaGA7', '_blank');
}

/* ---------- Buenos deseos (Firebase) ---------- */
function initBuenosDeseos() {
  const mostrarFormularioBtn = document.getElementById("mostrarFormularioBtn");
  const formularioDeseo      = document.getElementById("formularioDeseo");
  const verDeseosBtn         = document.getElementById("verDeseosBtn");
  const wishesContainer      = document.getElementById("wishesContainer");

  if (mostrarFormularioBtn && formularioDeseo) {
    mostrarFormularioBtn.addEventListener("click", () => {
      formularioDeseo.style.display =
        (formularioDeseo.style.display === "none" || !formularioDeseo.style.display) ? "block" : "none";
    });
  }

  if (verDeseosBtn && wishesContainer && window.firebase?.database) {
    let deseosVisibles = false;
    verDeseosBtn.addEventListener("click", async () => {
      if (!deseosVisibles) {
        wishesContainer.innerHTML = "<p>Cargando deseos...</p>";
        wishesContainer.style.display = "block";

        const dbRef = firebase.database().ref("buenos_deseos");
        dbRef.once("value", (snapshot) => {
          wishesContainer.innerHTML = "";
          if (!snapshot.exists()) {
            wishesContainer.innerHTML = "<p>No hay deseos aún. Sé el primero 💌</p>";
          } else {
            snapshot.forEach((childSnapshot) => {
              const data = childSnapshot.val();
              wishesContainer.innerHTML += `
                <div class="wish-card">
                  <strong>${data.nombre}</strong><br/>
                  <em>${data.mensaje}</em>
                </div>
              `;
            });
          }
          verDeseosBtn.textContent = "Ocultar buenos deseos";
          deseosVisibles = true;
        });
      } else {
        wishesContainer.innerHTML = "";
        wishesContainer.style.display = "none";
        verDeseosBtn.textContent = "Ver buenos deseos";
        deseosVisibles = false;
      }
    });
  }
}

/* ---------- Estrellitas de fondo ---------- */
function crearEstrellitas(cantidad = 40) {
  const starfield = document.getElementById('starfield');
  if (!starfield) return;

  starfield.innerHTML = "";
  for (let i = 0; i < cantidad; i++) {
    const star = document.createElement('div');
    star.classList.add('star');

    const size = Math.random() * 2 + 1;
    star.style.width  = `${size}px`;
    star.style.height = `${size}px`;
    star.style.top    = `${Math.random() * 100}%`;
    star.style.left   = `${Math.random() * 100}%`;
    star.style.animationDuration = `${Math.random() * 3 + 4}s`;
    star.style.animationDelay    = `${Math.random() * 5}s`;

    starfield.appendChild(star);
  }
}

/* ---------- Video divider: play/pause en viewport ---------- */
function initVideoObserver() {
  const v = document.querySelector('.block--video .block-video');
  if (!v) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        v.play().catch(()=>{});
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.25 });

  obs.observe(v);
}

/* ---------- Bootstrap único ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // Abrir invitación con sello
  const sello = document.getElementById("seal");
  if (sello) sello.addEventListener("click", abrirInvitacion);

  iniciarContador();
  cargarDatosInvitado();
  initFadeInOnScroll();
  crearEstrellitas();
  initBuenosDeseos();
  initVideoObserver();

  // Modal fotos: cerrar por overlay o botón .close
  const photoModal = document.getElementById('photo-modal');
  if (photoModal) {
    photoModal.addEventListener('click', closeModal);
    const closeBtn = photoModal.querySelector('.close');
    if (closeBtn) closeBtn.addEventListener('click', (e) => closeModal(e));
  }
});

/* ---------- Exponer globales si usas onclick="" en HTML ---------- */
window.changePhoto                   = changePhoto;
window.openModal                     = openModal;
window.closeModal                    = closeModal;
window.confirmarAsistencia           = confirmarAsistencia;
window.elegirAplicacion              = elegirAplicacion;
window.elegirAplicacionOtraDireccion = elegirAplicacionOtraDireccion;
window.abrirInvitacion               = abrirInvitacion;


