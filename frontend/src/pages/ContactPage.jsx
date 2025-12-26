import React from 'react';
import { Mail, Phone, MapPin, Send, Clock, MessageSquare } from 'lucide-react';

const ContactPage = () => {

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Merci ! Votre message a été envoyé. Nous vous répondrons bientôt.");
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- EN-TÊTE --- */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Contactez <span className="text-bahri-blue">Bahri Fishing</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Une question sur un leurre ? Besoin d'un conseil pour votre prochaine canne ? 
            Notre équipe d'experts est là pour vous accompagner.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- COLONNE GAUCHE : INFOS --- */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Carte Coordonnées */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-bahri-blue">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageSquare className="text-bahri-blue"/> Nos Coordonnées
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-bahri-blue">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-500 uppercase">Email</p>
                    <a href="mailto:rayengragba18@gmail.com" className="font-medium text-gray-900 hover:text-bahri-blue transition">
                      rayengragba18@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-bahri-blue">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-500 uppercase">Téléphone</p>
                    <p className="font-medium text-gray-900">+216 XX XXX XXX</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-bahri-blue">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-500 uppercase">Adresse</p>
                    <p className="font-medium text-gray-900">Tunis, Tunisie</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte Horaires */}
            <div className="bg-gray-900 rounded-2xl shadow-lg p-8 text-white">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Clock className="text-bahri-blue"/> Horaires d'ouverture
              </h3>
              <ul className="space-y-3 opacity-90">
                <li className="flex justify-between">
                  <span>Lundi - Vendredi</span>
                  <span className="font-bold">09:00 - 19:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Samedi</span>
                  <span className="font-bold">09:00 - 13:00</span>
                </li>
                <li className="flex justify-between text-red-300">
                  <span>Dimanche</span>
                  <span>Fermé</span>
                </li>
              </ul>
            </div>
          </div>

          {/* --- COLONNE DROITE : FORMULAIRE --- */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nom & Prénom</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-bahri-blue focus:border-transparent transition"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-bahri-blue focus:border-transparent transition"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Sujet</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-bahri-blue transition">
                    <option>Question sur un produit</option>
                    <option>Suivi de commande</option>
                    <option>Partenariat / Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                  <textarea 
                    rows="5"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-bahri-blue focus:border-transparent transition"
                    placeholder="Comment pouvons-nous vous aider ?"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-bahri-blue hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Envoyer le message <Send size={20} />
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;