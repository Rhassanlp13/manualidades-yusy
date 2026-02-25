// Estructura de productos:
// - id, nombre, precio, categoria, imagen, stock son obligatorios
// - descripcion es OPCIONAL - se muestra en el overlay de detalle
// - valoracion (número 1-5) es OPCIONAL - solo se muestra si existe
const productos = [
    {
        id: 'p1',
        nombre: "Cintillos con lazos",
        precio: 150,
        categoria: "Accesorios para el cabello",
        imagen: "assets/Gemini_Generated_Image_qo5uk7qo5uk7qo5u.png",
        descripcion: "Hermosos cintillos decorados con lazos artesanales. Perfectos para quotidien looks.",
        stock: 10
    },
    {
        id: 'p2',
        nombre: "Lazos para cabello(niñas)",
        precio: 500,
        categoria: "Accesorios para el cabello",
        imagen: "assets/Gemini_Generated_Image_qo5uk7qo5uk7qo5u.png",
        descripcion: "Lazos colorful para el cabello de las más pequeñas. Varios colores disponibles.",
        stock: 5
    },
    {
        id: 'p3',
        nombre: "Zapatos de Bebe",
        precio: 250,
        categoria: "Ropa de Bebe",
        imagen: "assets/Gemini_Generated_Image_qo5uk7qo5uk7qo5u.png",
        descripcion: "Zapatitos tejidos a mano para bebés recién nacidos. Suaves y cómodos.",
        stock: 2
    },
    {
        id: 'p4',
        nombre: "Diademas florales",
        precio: 180,
        categoria: "Accesorios para el cabello",
        imagen: "assets/Gemini_Generated_Image_qo5uk7qo5uk7qo5u.png",
        descripcion: "Diademas con flores artificiales artesanales. Ideales para ocasiones especiales.",
        stock: 0
    }
];
