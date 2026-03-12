const UI = {
    grid: null,
    cartCount: null,
    cartModal: null,
    cartItems: null,
    cartTotal: null,
    toast: null,
    toastTimer: null,
    productos: [],

    init(productos) {
        this.productos = productos;
        this.grid      = document.getElementById('grid');
        this.cartCount = document.getElementById('cart-count');
        this.cartModal = document.getElementById('cart-modal');
        this.cartItems = document.getElementById('cart-items');
        this.cartTotal = document.getElementById('cart-total');
        this.toast     = document.getElementById('toast');

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
            return `
            <article class="product-card" data-id="${p.id}">
                <img src="${p.imagen}" alt="${p.nombre}" loading="lazy" style="cursor:pointer"
                     onerror="this.src='https://placehold.co/400x210?text=Sin+imagen'">
                <div class="product-info">
                    <span class="vendedor"><i class="fas fa-user-circle"></i> ${p.vendedor}</span>
                    <h3>${p.nombre}</h3>
                    <div class="price">$${p.precio.toLocaleString('es-CU')} CUP</div>
                    ${agotado
                        ? `<button class="btn-add-cart" disabled>
                               <i class="fas fa-times-circle"></i> Sin stock
                           </button>`
                        : `<button class="btn-add-cart" data-id="${p.id}">
                               <i class="fas fa-cart-plus"></i> Añadir al carrito
                           </button>`
                    }
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
                    <button class="qty-btn btn-aumentar" data-id="${item.id}" ${!enStock ? 'disabled title="Stock máximo"' : ''}>+</button>
                </div>
            </div>`;
        }).join('');
        this.cartTotal.textContent = carrito.total.toLocaleString('es-CU');
    },

    mostrarToast(msg, tipo = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const colores = { ok: '', warning: 'warning', error: 'error', info: 'info' };
        const toast = document.createElement('div');
        toast.className = `toast-item ${colores[tipo] || ''}`;
        toast.textContent = msg;
        container.appendChild(toast);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add('show'));
        });
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 350);
        }, 2200);
    },

    abrirDetalle(id) {
        const p = this.productos.find(p => p.id === id);
        if (!p) return;

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
            const resultado = carrito.agregar(id, this.productos);
            if (resultado.ok) {
                this.actualizarContador();
                this.mostrarToast(`🛒 ${resultado.msg}`, 'ok');
                this.renderProductos();
                const enCarrito = carrito.items.find(i => i.id === id);
                if (enCarrito && enCarrito.cantidad >= p.stock) {
                    btnAdd.disabled = true;
                    btnAdd.innerHTML = '<i class="fas fa-times-circle"></i> Sin stock';
                    stockEl.textContent = 'Agotado';
                    stockEl.className = 'detalle-stock agotado';
                }
            } else {
                this.mostrarToast(`❌ ${resultado.msg}`, 'error');
            }
        };

        modal.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
    },

    cerrarDetalle() {
        document.getElementById('modal-detalle').setAttribute('hidden', '');
        document.body.style.overflow = '';
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

        // Añadir al carrito
        this.grid?.addEventListener('click', e => {
            // Abrir detalle al tocar imagen
            const img = e.target.closest('img');
            if (img) {
                const card = img.closest('.product-card');
                if (card) this.abrirDetalle(card.dataset.id);
                return;
            }

            // Añadir al carrito
            const btn = e.target.closest('.btn-add-cart');
            if (!btn || btn.disabled) return;
            const resultado = carrito.agregar(btn.dataset.id, this.productos);
            if (resultado.ok) {
                this.actualizarContador();
                this.mostrarToast(`🛒 ${resultado.msg}`, 'ok');
                const producto = this.productos.find(p => p.id === btn.dataset.id);
                const enCarrito = carrito.items.find(i => i.id === btn.dataset.id);
                if (producto && enCarrito && enCarrito.cantidad >= producto.stock) {
                    this.renderProductos();
                }
            } else {
                this.mostrarToast(`❌ ${resultado.msg}`, 'error');
            }
        });

        // +/- en el carrito
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
                if (carrito.items.length === 0) {
                    this.mostrarToast('🛒 Carrito vacío', 'info');
                }
            }
        });

        // Cerrar detalle
        document.getElementById('detalle-btn-cerrar')?.addEventListener('click', () => this.cerrarDetalle());
        document.getElementById('modal-detalle')?.addEventListener('click', e => {
            if (e.target === document.getElementById('modal-detalle')) this.cerrarDetalle();
        });
    }
};
