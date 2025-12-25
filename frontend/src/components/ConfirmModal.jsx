import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isDanger = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                {/* En-tête */}
                <div className={`p-4 flex items-center justify-between ${isDanger ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <h3 className={`font-bold text-lg flex items-center gap-2 ${isDanger ? 'text-red-700' : 'text-gray-800'}`}>
                        {isDanger && <AlertTriangle size={20} />}
                        {title}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Corps */}
                <div className="p-6 text-gray-600">
                    {message}
                </div>

                {/* Pied de page (Boutons) */}
                <div className="p-4 bg-gray-50 flex justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition"
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={() => { onConfirm(); onClose(); }} 
                        className={`px-4 py-2 rounded-lg text-white font-bold shadow-md transition transform active:scale-95
                            ${isDanger 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-bahri-blue hover:bg-opacity-90'}`}
                    >
                        Confirmer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;