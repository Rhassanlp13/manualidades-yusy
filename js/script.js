let carrito = JSON.parse(localStorage.getItem('pilon_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    renderizarProductos(productos);
    actualizarContador();
});

function renderizarProductos(lista) {
    const container = document.getElementById('product-list');
    container.innerHTML = lista.map(p => `
        <div class="product-card">
            <img src="${p.imagen}" alt="${p.nombre}">
            <div class="product-info">
                <h3>${p.nombre}</h3>
                <p class="vendedor">Vendido por: ${p.vendedor}</p>
                <div class="price">$${p.precio.toLocaleString()} CUP</div>
                <button class="btn-add-cart" onclick="agregarAlCarrito('${p.id}')">
                    <i class="fas fa-cart-plus"></i> Añadir al carrito
                </button>
            </div>
        </div>
    `).join('');
}

function agregarAlCarrito(id) {
    const prod = productos.find(p => p.id === id);
    carrito.push(prod);
    localStorage.setItem('pilon_cart', JSON.stringify(carrito));
    actualizarContador();
    alert(`${prod.nombre} añadido.`);
}

function actualizarContador() {
    document.getElementById('cart-count').innerText = carrito.length;
}

function checkoutWhatsApp() {
    if (carrito.length === 0) return alert("El carrito está vacío");
    
    const miNumero = "5356195243";
    let texto = "*Pedido Shopping Pilón*%0A%0A";
    let total = 0;
    
    carrito.forEach(item => {
        texto += `- ${item.nombre} ($${item.precio})%0A`;
        total += item.precio;
    });
    
    texto += `%0A*Total: $${total} CUP*`;
    window.open(`https://wa.me/${miNumero}?text=${texto}`, '_blank');
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    if(modal.style.display === 'block') renderCarrito();
}

function renderCarrito() {
    const container = document.getElementById('cart-items');
    let total = 0;
    container.innerHTML = carrito.map((item, i) => {
        total += item.precio;
        return `<div>${item.nombre} - $${item.precio} <button onclick="quitar(${i})">x</button></div>`;
    }).join('');
    document.getElementById('total-price').innerText = total;
}

function quitar(i) {
    carrito.splice(i, 1);
    localStorage.setItem('pilon_cart', JSON.stringify(carrito));
    renderCarrito();
    actualizarContador();
}
