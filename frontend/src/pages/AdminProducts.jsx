import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { buildImageUrl } from '../utils/image';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);

    const fetchProducts = async () => {
        try {
            const res = await client.get('/products/admin/all/');
            setProducts(res.data);
        } catch (err) {
            console.error("Erreur chargement produits", err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer ce produit définitivement ?")) {
            try {
                await client.delete(`/products/admin/${id}/`);
                fetchProducts();
            } catch (err) {
                console.error("Erreur suppression produit", err);
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Link to="/admin" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-3xl font-bold">Gestion du Catalogue</h1>
                </div>

                <Link
                    to="/admin/products/new"
                    className="bg-bahri-blue text-white px-4 py-2 rounded flex items-center gap-2"
                >
                    <Plus size={20} /> Nouveau Produit
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4">Image</th>
                            <th className="p-4">Nom</th>
                            <th className="p-4">Catégorie</th>
                            <th className="p-4">Prix</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {products.map((p) => (
                            <tr key={p.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                    {p.image ? (
                                        <img
                                            src={buildImageUrl(p.image)}
                                            alt={p.title}
                                            className="w-12 h-12 object-cover rounded border"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 flex items-center justify-center text-xs text-gray-400 border rounded">
                                            N/A
                                        </div>
                                    )}
                                </td>

                                <td className="p-4 font-bold">{p.title}</td>
                                <td className="p-4 text-sm text-gray-500">
                                    {p.category_name || '-'}
                                </td>
                                <td className="p-4 font-bold text-bahri-blue">
                                    {p.price} TND
                                </td>
                                <td className="p-4">{p.stock}</td>

                                <td className="p-4 flex gap-2">
                                    <Link
                                        to={`/admin/products/edit/${p.id}`}
                                        className="text-blue-500 hover:bg-blue-50 p-2 rounded"
                                    >
                                        <Edit size={18} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {products.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                        Aucun produit disponible.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProducts;
