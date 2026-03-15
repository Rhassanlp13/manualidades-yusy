const UI = {
    grid: null,
    cartCount: null,
    cartModal: null,
    cartItems: null,
    cartTotal: null,
    productos: [],
    productoActualId: null,
    estrellaSeleccionada: 0,

    init(productos) {
        this.productos = productos;
        this.grid      = document.getElementById('grid');
        this.cartCount = document.getElementById('cart-count');
        this.cartModal = document.getElementById('cart-modal');
        this.cartItems = document.getElementById('cart-items');
        this.cartTotal = document.getElementById('cart-total');

        this.renderProductos();
        this.actualizarContador();
        this.bindEventos();
    },

    renderProductos() {
        if (!this.grid) return;
        if (this.productos.length === 0) {
            this.grid.innerHTML = `
                <div style="grid-column:1/-1; text-align:center; padding:3rem; color:#999;">
                    <i class="fas fa-box-open" style="font-size:2.5rem; display:block; margin-bottom:1rem;"></i>
                    <p>No hay productos disponibles aún.</p>
                </div>`;
            return;
        }
        this.grid.innerHTML = this.productos.map(p => {
            const enCarrito = carrito.items.find(i => i.id === p.id);
            const agotado = p.stock <= 0 || (enCarrito && enCarrito.cantidad >= p.stock);
            const stockBajo = !agotado && p.stock <= 3;
            return `
            <article class="product-card" data-id="${p.id}">
                ${stockBajo ? `<span class="card-stock-badge">¡Solo ${p.stock}!</span>` : ''}
                <img src="${p.imagen}" alt="${p.nombre}" loading="lazy"
                     onerror="this.src='https://placehold.co/400x400?text=Sin+imagen'">
                <div class="product-info">
                    <span class="vendedor"><i class="fas fa-user-circle"></i> ${p.vendedor}</span>
                    <h3>${p.nombre}</h3>
                    <div class="price">$${p.precio.toLocaleString('es-CU')}</div>
                    <button class="card-btn-add" data-id="${p.id}" ${agotado ? 'disabled' : ''}>
                        ${agotado
                            ? '<i class="fas fa-times-circle"></i> Agotado'
                            : '<i class="fas fa-cart-plus"></i> Añadir'
                        }
                    </button>
                </div>
            </article>`;
        }).join('');
    },

    actualizarContador() {
        if (!this.cartCount) return;
        const n = carrito.cantidad;
        this.cartCount.textContent = n;
        this.cartCount.classList.remove('pop');
        void this.cartCount.offsetWidth;
        if (n > 0) this.cartCount.classList.add('pop');
        setTimeout(() => this.cartCount.classList.remove('pop'), 300);
    },

    abrirModal() {
        this.renderCarrito();
        this.cartModal.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
    },

    cerrarModal() {
        this.cartModal.setAttribute('hidden', '');
        document.body.style.overflow = '';
    },

    renderCarrito() {
        if (!this.cartItems) return;
        if (carrito.items.length === 0) {
            this.cartItems.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Tu carrito está vacío</p>
                </div>`;
            this.cartTotal.textContent = '0';
            return;
        }
        this.cartItems.innerHTML = carrito.items.map(item => {
            const stockDisponible = this.productos.find(p => p.id === item.id)?.stock ?? 0;
            const enStock = item.cantidad < stockDisponible;
            return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.nombre}</div>
                    <div class="cart-item-price">$${(item.precio * item.cantidad).toLocaleString('es-CU')} CUP</div>
                </div>
                <div class="qty-control">
                    <button class="qty-btn btn-disminuir" data-id="${item.id}">−</button>
                    <span class="qty-num">${item.cantidad}</span>
                    <button class="qty-btn btn-aumentar" data-id="${item.id}" ${!enStock ? 'disabled' : ''}>+</button>
                </div>
            </div>`;
        }).join('');
        this.cartTotal.textContent = carrito.total.toLocaleString('es-CU');
    },

    mostrarToast(msg, tipo = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const tipos = { ok: '', warning: 'warning', error: 'error', info: 'info' };
        const toast = document.createElement('div');
        toast.className = `toast-item ${tipos[tipo] || ''}`;
        toast.textContent = msg;
        container.appendChild(toast);
        requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 350);
        }, 2200);
    },

    // ── DETALLE ──
    async abrirDetalle(id) {
        const p = this.productos.find(p => p.id === id);
        if (!p) return;
        this.productoActualId = id;

        const modal     = document.getElementById('modal-detalle');
        const enCarrito = carrito.items.find(i => i.id === id);
        const agotado   = p.stock <= 0 || (enCarrito && enCarrito.cantidad >= p.stock);

        document.getElementById('detalle-img').src              = p.imagen;
        document.getElementById('detalle-img').alt              = p.nombre;
        document.getElementById('detalle-vendedor').textContent = p.vendedor;
        document.getElementById('detalle-nombre').textContent   = p.nombre;
        document.getElementById('detalle-precio').textContent   = p.precio.toLocaleString('es-CU');

        const stockEl = document.getElementById('detalle-stock');
        if (p.stock <= 0) {
            stockEl.textContent = 'Agotado';
            stockEl.className = 'detalle-stock agotado';
        } else if (p.stock <= 3) {
            stockEl.textContent = `¡Solo quedan ${p.stock}!`;
            stockEl.className = 'detalle-stock low';
        } else {
            stockEl.textContent = `${p.stock} disponibles`;
            stockEl.className = 'detalle-stock ok';
        }

        const btnAdd = document.getElementById('detalle-btn-add');
        btnAdd.disabled = agotado;
        btnAdd.innerHTML = agotado
            ? '<i class="fas fa-times-circle"></i> Sin stock'
            : '<i class="fas fa-cart-plus"></i> Añadir al carrito';

        btnAdd.onclick = () => {
            const res = carrito.agregar(id, this.productos);
            if (res.ok) {
                this.actualizarContador();
                this.mostrarToast(`🛒 ${res.msg}`, 'ok');
                this.renderProductos();
                const ec = carrito.items.find(i => i.id === id);
                if (ec && ec.cantidad >= p.stock) {
                    btnAdd.disabled = true;
                    btnAdd.innerHTML = '<i class="fas fa-times-circle"></i> Sin stock';
                    stockEl.textContent = 'Agotado';
                    stockEl.className = 'detalle-stock agotado';
                }
            } else {
                this.mostrarToast(`❌ ${res.msg}`, 'error');
            }
        };

        modal.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';

        this.estrellaSeleccionada = 0;
        this.actualizarEstrellas(0);
        document.getElementById('resena-nombre').value = '';
        document.getElementById('resena-texto').value  = '';

        await this.cargarResenas(id);
    },

    cerrarDetalle() {
        document.getElementById('modal-detalle').setAttribute('hidden', '');
        document.body.style.overflow = '';
        this.productoActualId = null;
    },

    // ── RESEÑAS ──
    async cargarResenas(productoId) {
        const lista = document.getElementById('resenas-lista');
        const count = document.getElementById('resenas-count');
        lista.innerHTML = '<p style="text-align:center; color:#bbb; font-size:0.82rem; padding:1rem">Cargando reseñas...</p>';

        try {
            const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js');
            const { getFirestore, collection, query, where, orderBy, getDocs } = await import('https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js');

            const firebaseConfig = {
                apiKey: "AIzaSyCnNVKKvq5a7-dYjA8_fqrtSaVNiwCTJII",
                authDomain: "shoppin-pilon.firebaseapp.com",
                projectId: "shoppin-pilon",
                storageBucket: "shoppin-pilon.firebasestorage.app",
                messagingSenderId: "227863829651",
                appId: "1:227863829651:web:79bfdbfbc08680aaa84166"
            };

            const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
            const db  = getFirestore(app);

            const q = query(
                collection(db, 'resenas'),
                where('productoId', '==', productoId),
                orderBy('fecha', 'desc')
            );

            const snap = await getDocs(q);
            const resenas = snap.docs.map(d => d.data());

            count.textContent = resenas.length > 0 ? `(${resenas.length})` : '';

            if (resenas.length === 0) {
                lista.innerHTML = '<div class="resenas-empty"><i class="fas fa-comment-slash"></i><br>Sin reseñas aún. ¡Sé el primero!</div>';
                return;
            }

            lista.innerHTML = resenas.map(r => `
                <div class="resena-item">
                    <div class="resena-header">
                        <span class="resena-autor">${r.nombre}</span>
                        <span class="resena-estrellas">${'★'.repeat(r.estrellas)}${'☆'.repeat(5 - r.estrellas)}</span>
                    </div>
                    <div class="resena-texto">${r.texto}</div>
                    <div class="resena-fecha">${new Date(r.fecha).toLocaleDateString('es-CU', { day:'numeric', month:'short', year:'numeric' })}</div>
                </div>
            `).join('');

        } catch (err) {
            lista.innerHTML = '<div class="resenas-empty">No se pudieron cargar las reseñas.</div>';
            console.error(err);
        }
    },

    async enviarResena() {
        const nombre  = document.getElementById('resena-nombre').value.trim();
        const texto   = document.getElementById('resena-texto').value.trim();
        const estrellas = this.estrellaSeleccionada;

        if (!nombre || !texto || estrellas === 0) {
            this.mostrarToast('⚠️ Completa nombre, estrellas y opinión', 'warning');
            return;
        }

        const btn = document.getElementById('btn-enviar-resena');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';

        try {
            const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js');
            const { getFirestore, collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js');

            const firebaseConfig = {
                apiKey: "AIzaSyCnNVKKvq5a7-dYjA8_fqrtSaVNiwCTJII",
                authDomain: "shoppin-pilon.firebaseapp.com",
                projectId: "shoppin-pilon",
                storageBucket: "shoppin-pilon.firebasestorage.app",
                messagingSenderId: "227863829651",
                appId: "1:227863829651:web:79bfdbfbc08680aaa84166"
            };

            const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
            const db  = getFirestore(app);

            await addDoc(collection(db, 'resenas'), {
                productoId: this.productoActualId,
                nombre,
                texto,
                estrellas,
                fecha: Date.now()
            });

            this.mostrarToast('✅ Reseña publicada', 'ok');
            document.getElementById('resena-nombre').value = '';
            document.getElementById('resena-texto').value  = '';
            this.estrellaSeleccionada = 0;
            this.actualizarEstrellas(0);
            await this.cargarResenas(this.productoActualId);

        } catch (err) {
            this.mostrarToast('❌ Error al publicar reseña', 'error');
            console.error(err);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar reseña';
        }
    },

    actualizarEstrellas(valor) {
        document.querySelectorAll('#estrellas-input i').forEach((star, i) => {
            star.classList.toggle('activa', i < valor);
        });
    },

    enviarWhatsApp() {
        if (carrito.items.length === 0) {
            this.mostrarToast('⚠️ Tu carrito está vacío', 'warning');
            return;
        }
        let texto = "🛍️ *Nuevo Pedido - Shopping Pilón*\n\n";
        carrito.items.forEach(i => {
            texto += `• ${i.nombre} x${i.cantidad} — $${(i.precio * i.cantidad).toLocaleString('es-CU')} CUP\n`;
        });
        texto += `\n💰 *Total: $${carrito.total.toLocaleString('es-CU')} CUP*\n\nHola, me gustaría confirmar este pedido. 😊`;
        window.open(`https://wa.me/5356195243?text=${encodeURIComponent(texto)}`, '_blank');
    },

    bindEventos() {
        document.getElementById('cart-btn')?.addEventListener('click', () => this.abrirModal());
        document.getElementById('modal-close')?.addEventListener('click', () => this.cerrarModal());

        this.cartModal?.addEventListener('click', e => {
            if (e.target === this.cartModal) this.cerrarModal();
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                if (!this.cartModal.hasAttribute('hidden')) this.cerrarModal();
                if (!document.getElementById('modal-detalle').hasAttribute('hidden')) this.cerrarDetalle();
            }
        });

        document.getElementById('btn-whatsapp')?.addEventListener('click', () => this.enviarWhatsApp());

        document.getElementById('btn-clear')?.addEventListener('click', () => {
            if (carrito.items.length === 0) {
                this.mostrarToast('⚠️ El carrito ya está vacío', 'warning');
                return;
            }
            carrito.vaciar();
            this.actualizarContador();
            this.renderCarrito();
            this.renderProductos();
            this.mostrarToast('🗑️ Carrito vaciado', 'info');
        });

        // Abrir detalle al tocar la card (excepto el botón)
        this.grid?.addEventListener('click', e => {
            const btn = e.target.closest('.card-btn-add');
            if (btn) {
                if (btn.disabled) return;
                const res = carrito.agregar(btn.dataset.id, this.productos);
                if (res.ok) {
                    this.actualizarContador();
                    this.mostrarToast(`🛒 ${res.msg}`, 'ok');
                    const p = this.productos.find(p => p.id === btn.dataset.id);
                    const ec = carrito.items.find(i => i.id === btn.dataset.id);
                    if (p && ec && ec.cantidad >= p.stock) this.renderProductos();
                } else {
                    this.mostrarToast(`❌ ${res.msg}`, 'error');
                }
                return;
            }
            const card = e.target.closest('.product-card');
            if (card) this.abrirDetalle(card.dataset.id);
        });

        // +/- carrito
        this.cartItems?.addEventListener('click', e => {
            const btnA = e.target.closest('.btn-aumentar');
            const btnD = e.target.closest('.btn-disminuir');
            if (btnA && !btnA.disabled) {
                carrito.aumentar(btnA.dataset.id, this.productos);
                this.actualizarContador();
                this.renderCarrito();
                this.renderProductos();
            }
            if (btnD) {
                carrito.disminuir(btnD.dataset.id);
                this.actualizarContador();
                this.renderCarrito();
                this.renderProductos();
                if (carrito.items.length === 0) this.mostrarToast('🛒 Carrito vacío', 'info');
            }
        });

        // Cerrar detalle
        document.getElementById('detalle-btn-cerrar')?.addEventListener('click', () => this.cerrarDetalle());
        document.getElementById('modal-detalle')?.addEventListener('click', e => {
            if (e.target === document.getElementById('modal-detalle')) this.cerrarDetalle();
        });

        // Estrellas
        document.querySelectorAll('#estrellas-input i').forEach(star => {
            star.addEventListener('click', () => {
                this.estrellaSeleccionada = parseInt(star.dataset.val);
                this.actualizarEstrellas(this.estrellaSeleccionada);
            });
            star.addEventListener('mouseover', () => this.actualizarEstrellas(parseInt(star.dataset.val)));
            star.addEventListener('mouseout',  () => this.actualizarEstrellas(this.estrellaSeleccionada));
        });

        // Enviar reseña
        document.getElementById('btn-enviar-resena')?.addEventListener('click', () => this.enviarResena());
    }
};
