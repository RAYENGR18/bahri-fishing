import React from 'react';
import { Link } from 'react-router-dom';
import { Fish, Facebook, Instagram, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Slogan */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 font-bold text-2xl text-white mb-6">
              <Fish size={32} className="text-bahri-blue" />
              <span>Bahri Fishing</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Votre partenaire numéro 1 pour la pêche en Tunisie. Qualité, passion et service irréprochable.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Navigation</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/" className="hover:text-bahri-blue transition">Accueil</Link></li>
              <li><Link to="/products" className="hover:text-bahri-blue transition">Nos Produits</Link></li>
              <li><Link to="/contact" className="hover:text-bahri-blue transition">Contact</Link></li>
              <li><Link to="/login" className="hover:text-bahri-blue transition">Mon Compte</Link></li>
            </ul>
          </div>

          {/* Catégories (Statique pour l'instant) */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Rayons</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/products" className="hover:text-bahri-blue transition">Cannes à pêche</Link></li>
              <li><Link to="/products" className="hover:text-bahri-blue transition">Moulinets</Link></li>
              <li><Link to="/products" className="hover:text-bahri-blue transition">Leurres</Link></li>
              <li><Link to="/products" className="hover:text-bahri-blue transition">Accessoires</Link></li>
            </ul>
          </div>

          {/* Contact Rapide */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Nous Suivre</h3>
            <div className="flex space-x-4 mb-6">
               <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-bahri-blue transition"><Facebook size={20}/></a>
               <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-bahri-blue transition"><Instagram size={20}/></a>
               <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-bahri-blue transition"><Twitter size={20}/></a>
            </div>
            <p className="flex items-center gap-2 text-sm text-gray-400">
                <Mail size={16} className="text-bahri-blue"/> rayengragba18@gmail.com
            </p>
          </div>
        </div>

        {/* --- COPYRIGHT SECTION --- */}
        <div className="border-t border-gray-800 pt-8 mt-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} Copyright reserved au <span className="text-white font-bold">Rayen Gragba</span>
          </p>
          <p className="text-gray-600 text-xs mt-2">
            rayengragba18@gmail.com | Developed with ❤️ for Fishing Lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;