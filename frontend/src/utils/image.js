// src/utils/image.js
const API_URL = 'http://127.0.0.1:8000';

export const buildImageUrl = (url) => {
    if (!url) return null;

    // 1. Si c'est déjà une URL complète (Cloudinary, https://...), on ne touche à rien.
    if (url.startsWith('http')) return url;

    // 2. LE GRAND NETTOYAGE 🧹
    // Cette ligne enlève tous les "/" et tous les mots "media/" au début de la chaîne
    // Ex: "/media/products/img.jpg"  -> devient "products/img.jpg"
    // Ex: "media/media/products/img.jpg" -> devient "products/img.jpg"
    let cleanPath = url.replace(/^(\/|media\/)+/g, '');

    // 3. On reconstruit l'URL proprement (1 seule fois media)
    return `${API_URL}/media/${cleanPath}`;
};