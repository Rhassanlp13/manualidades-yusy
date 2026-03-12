// app.js — Punto de entrada
document.addEventListener('DOMContentLoaded', async () => {
    const productos = await cargarProductos();
    carrito.init();
    UI.init(productos);
});