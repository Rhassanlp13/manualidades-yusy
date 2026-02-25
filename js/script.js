// ============================================
// SCRIPT PRINCIPAL - Manualidades Yusy
// Estilo Amazon
// ============================================

// Función para generar estrellas de valoración
function generarEstrellas(valoracion) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= valoracion) {
            html += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= valoracion) {
            html += '<i class="fas fa-star-half-alt"></i>';
        } else {
            html += '<i class="far fa-star"></i>';
        }
    }
    return html;
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    
    // Cerrar modal al hacer click fuera
    window.onclick = function(event) {
        const modal = document.getElementById('cart-modal');
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});

// ============================================
// CARGAR PRODUCTOS
// ============================================
function cargarProductos() {
    const productList = document.getElementById('product-list');
    
    if (typeof productos === 'undefined') {
        console.error('No se encontraron productos');
        productList.innerHTML = '<p>No hay productos disponibles</p>';
        return;
    }
    
    productos.forEach(prod => {
        // Determinar disponibilidad
        const stockText = prod.stock > 0 
            ? (prod.stock <= 3 ? `¡Solo quedan ${prod.stock}!` : 'En stock')
            : 'Agotado';
        const stockClass = prod.stock > 0 ? 'stock' : 'stock out-of-stock';
        
        // Determinar precio
        const precioFormateado = prod.precio.toLocaleString('es');
        
        // Valoración (si no existe, mostrar 4 por defecto)
        const valoracion = prod.valoracion || 4;
        const estrellas = generarEstrellas(valoracion);
        
        // Código HTML del producto estilo Amazon
        const productoHTML = `
            <div class="product-card">
                <img src="${prod.imagen}" alt="${prod.nombre}" onerror="this.src='https://via.placeholder.com/200x200?text=Imagen'">
                <div class="product-info">
                    <h3 onclick="verDetalle('${prod.id}')">${prod.nombre}</h3>
                    <div class="stars">${estrellas}</div>
                    <div class="price">
                        <sup>$</sup>${precioFormateado} <small>CUP</small>
                    </div>
                    <div class="${stockClass}">${stockText}</div>
                    ${prod.descripcion ? `<p style="font-size:12px;color:#565959;margin:8px 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${prod.descripcion}</p>` : ''}
                    <button class="btn-add-cart" onclick="agregarAlCarrito('${prod.id}')" ${prod.stock === 0 ? 'disabled' : ''}>
                        ${prod.stock === 0 ? 'Agotado' : '<i class="fas fa-cart-plus"></i> Agregadir al carrito'}
                    </button>
                </div>
            </div>
        `;
        
        productList.innerHTML += productoHTML;
    });
}

// ============================================
// CARRITO DE COMPRAS
// ============================================
let carrito = [];

function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    if (producto && producto.stock > 0) {
        carrito.push(producto);
        actualizarInterfaz();
        
        // Feedback visual
        mostrarNotificacion(`${producto.nombre} agregado al carrito`);
    }
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarInterfaz();
}

function actualizarInterfaz() {
    document.getElementById('cart-count').innerText = carrito.length;
    renderizarCarrito();
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = (modal.style.display === "block") ? "none" : "block";
}

function renderizarCarrito() {
    const container = document.getElementById('cart-items');
    const totalSpan = document.getElementById('total-price');
    
    if (carrito.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px 20px;color:#565959"><i class="fas fa-shopping-basket" style="font-size:48px;margin-bottom:15px;color:#ddd"></i><p>Tu carrito está vacío</p></div>';
        totalSpan.innerText = "0";
        return;
    }
    
    container.innerHTML = "";
    let total = 0;

    carrito.forEach((item, index) => {
        total += item.precio;
        const precioFormateado = item.precio.toLocaleString('es');
        
        container.innerHTML += `
            <div class="cart-item">
                <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/60x60?text=Img'">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.nombre}</div>
                    <div class="cart-item-price">$${precioFormateado} CUP</div>
                    <span class="cart-item-remove" onclick="eliminarDelCarrito(${index})">
                        <i class="fas fa-trash"></i> Eliminar
                    </span>
                </div>
            </div>
        `;
    });
    
    totalSpan.innerText = total.toLocaleString('es');
}

// ============================================
// CHECKOUT POR WHATSAPP
// ============================================
function checkoutWhatsApp() {
    if (carrito.length === 0) {
        mostrarNotificacion('Tu carrito está vacío', 'error');
        return;
    }

    const telefono = "5356195243"; // Número de Yusy
    let mensaje = "🛍️ *Nuevo pedido desde Manualidades Yusy*%0A%0A";
    
    let total = 0;
    carrito.forEach((item, index) => {
        total += item.precio;
        const precioFormateado = item.precio.toLocaleString('es');
        mensaje += `${index + 1}. ${item.nombre}%0A   💰 $${precioFormateado} CUP%0A%0A`;
    });
    
    const totalFormateado = total.toLocaleString('es');
    mensaje += "━━━━━━━━━━━━━━━━━━%0A";
    mensaje += `💵 *TOTAL: $${totalFormateado} CUP*%0A%0A`;
    mensaje += "📍 *Lugar de entrega:* Pilón, Granma%0A";
    mensaje += "📝 *Detalles del pedido:* -";

    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
}

// ============================================
// DETALLE DEL PRODUCTO (Función adicional)
// ============================================
function verDetalle(id) {
    const producto = productos.find(p => p.id === id);
    if (producto) {
        alert(`${producto.nombre}\n\n${producto.descripcion || 'Descripción no disponible'}\n\nPrecio: $${producto.precio} CUP`);
    }
}

// ============================================
// NOTIFICACIONES
// ============================================
function mostrarNotificacion(mensaje, tipo = 'success') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${tipo === 'error' ? '#cc1c39' : '#007600'};
        color: white;
        padding: 15px 25px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        z-index: 3000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    notificacion.innerHTML = `<i class="fas fa-${tipo === 'error' ? 'exclamation-circle' : 'check-circle'}"></i> ${mensaje}`;
    
    document.body.appendChild(notificacion);
    
    // Animación y removal
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notificacion.parentNode) {
                document.body.removeChild(notificacion);
            }
        }, 300);
    }, 2500);
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
