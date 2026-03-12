const carrito = {
    items: [],

    init() {
        try {
            const guardado = localStorage.getItem('pilon_cart');
            this.items = guardado ? JSON.parse(guardado) : [];
        } catch (e) {
            this.items = [];
        }
    },

    guardar() {
        try {
            localStorage.setItem('pilon_cart', JSON.stringify(this.items));
        } catch (e) {
            console.error('No se pudo guardar el carrito', e);
        }
    },

    agregar(idProducto, productos) {
        const producto = productos.find(p => p.id === idProducto);
        if (!producto) return { ok: false, msg: 'Producto no encontrado' };
        if (producto.stock <= 0) return { ok: false, msg: 'Producto agotado' };

        const existente = this.items.find(i => i.id === idProducto);
        if (existente) {
            if (existente.cantidad >= producto.stock) {
                return { ok: false, msg: `Solo hay ${producto.stock} disponibles` };
            }
            existente.cantidad++;
        } else {
            this.items.push({ ...producto, cantidad: 1 });
        }
        this.guardar();
        return { ok: true, msg: `${producto.nombre} añadido al carrito` };
    },

    aumentar(idProducto, productos) {
        const item = this.items.find(i => i.id === idProducto);
        const producto = productos.find(p => p.id === idProducto);
        if (!item || !producto) return;
        if (item.cantidad < producto.stock) {
            item.cantidad++;
            this.guardar();
        }
    },

    disminuir(idProducto) {
        const index = this.items.findIndex(i => i.id === idProducto);
        if (index === -1) return;
        if (this.items[index].cantidad > 1) {
            this.items[index].cantidad--;
        } else {
            this.items.splice(index, 1);
        }
        this.guardar();
    },

    vaciar() {
        this.items = [];
        this.guardar();
    },

    get total() {
        return this.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    },

    get cantidad() {
        return this.items.reduce((sum, item) => sum + item.cantidad, 0);
    }
};