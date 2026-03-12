// productos.js — Carga productos desde Firebase Firestore
async function cargarProductos() {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js');
    const { getFirestore, collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js');

    const firebaseConfig = {
        apiKey: "AIzaSyCnNVKKvq5a7-dYjA8_fqrtSaVNiwCTJII",
        authDomain: "shoppin-pilon.firebaseapp.com",
        projectId: "shoppin-pilon",
        storageBucket: "shoppin-pilon.firebasestorage.app",
        messagingSenderId: "227863829651",
        appId: "1:227863829651:web:79bfdbfbc08680aaa84166"
    };

    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const snapshot = await getDocs(collection(db, 'productos'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
        console.error('Error cargando productos desde Firebase:', err);
        return [];
    }
}