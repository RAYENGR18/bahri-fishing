import React from 'react';
import { Link } from 'react-router-dom';
import { Fish, Anchor, Heart, Target, CheckCircle } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="bg-white min-h-screen">
      
      {/* =========================================
          1. EN-TÊTE (HEADER)
      ========================================= */}
      <div className="relative py-20 bg-gray-900 overflow-hidden">
        {/* Motif de fond abstrait */}
        <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center text-white">
          <span className="text-bahri-blue font-bold tracking-widest uppercase mb-4 inline-block">Notre Histoire</span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Plus qu'une boutique, <br/>une <span className="text-bahri-blue">Passion</span>.</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light">
            Bahri Fishing est né d'une idée simple : offrir aux pêcheurs tunisiens le matériel qu'ils méritent vraiment.
          </p>
        </div>
      </div>

      {/* =========================================
          2. SECTION "QUI SOMMES-NOUS"
      ========================================= */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          {/* Image illustrative */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-bahri-blue rounded-full opacity-20"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gray-200 rounded-full opacity-50"></div>
            <img 
              src="https://images.unsplash.com/photo-1559863412-25c786733230?q=80&w=1000&auto=format&fit=crop" 
              alt="Pêcheur au coucher du soleil" 
              className="relative rounded-2xl shadow-2xl w-full object-cover h-[500px]"
            />
          </div>

          {/* Texte */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Fondé par Rayen Gragba</h2>
            <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
              <p>
                Tout a commencé au bord de l'eau. Passionné de pêche depuis mon plus jeune âge, j'ai souvent constaté la difficulté de trouver du matériel fiable, durable et performant en Tunisie.
              </p>
              <p>
                J'ai créé <strong>Bahri Fishing</strong> avec une mission claire : sélectionner rigoureusement les meilleurs équipements mondiaux et les rendre accessibles à tous, du débutant curieux au compétiteur acharné.
              </p>
              <p>
                Aujourd'hui, nous ne vendons pas seulement des cannes et des moulinets. Nous partageons l'adrénaline de la touche, la patience de l'attente et la joie de la prise.
              </p>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100 flex items-center gap-4">
               <img 
                 src="https://ui-avatars.com/api/?name=Rayen+Gragba&background=0D8ABC&color=fff&size=64" 
                 alt="Rayen Gragba" 
                 className="w-16 h-16 rounded-full shadow-md"
               />
               <div>
                  <p className="font-bold text-gray-900">Rayen Gragba</p>
                  <p className="text-bahri-blue text-sm">Fondateur & Expert Pêche</p>
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================
          3. NOS VALEURS (ICÔNES)
      ========================================= */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Pourquoi nous choisir ?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Valeur 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition border-t-4 border-bahri-blue">
              <Target className="w-12 h-12 text-bahri-blue mb-6" />
              <h3 className="text-xl font-bold mb-3">Expertise Technique</h3>
              <p className="text-gray-600">
                Nous ne vendons rien que nous n'utiliserions pas nous-mêmes. Chaque produit est testé et approuvé.
              </p>
            </div>

            {/* Valeur 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition border-t-4 border-bahri-blue">
              <Heart className="w-12 h-12 text-bahri-blue mb-6" />
              <h3 className="text-xl font-bold mb-3">Passion Partagée</h3>
              <p className="text-gray-600">
                Nous sommes une communauté. Nous sommes là pour vous conseiller, partager des astuces et célébrer vos prises.
              </p>
            </div>

            {/* Valeur 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition border-t-4 border-bahri-blue">
              <Anchor className="w-12 h-12 text-bahri-blue mb-6" />
              <h3 className="text-xl font-bold mb-3">Confiance & Fiabilité</h3>
              <p className="text-gray-600">
                Paiement sécurisé, livraison rapide et service après-vente réactif. Votre satisfaction est notre priorité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          4. CALL TO ACTION (CTA)
      ========================================= */}
      <section className="py-20 bg-bahri-blue text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <Fish size={64} className="mx-auto mb-6 opacity-20" />
          <h2 className="text-4xl font-bold mb-6">Prêt à vivre votre prochaine aventure ?</h2>
          <p className="text-xl mb-10 opacity-90">
            Explorez notre catalogue et trouvez l'équipement parfait pour votre style de pêche.
          </p>
          <div className="flex justify-center gap-4">
             <Link to="/products" className="bg-white text-bahri-blue font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition shadow-lg">
                Voir les produits
             </Link>
             <Link to="/contact" className="border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white/10 transition">
                Nous contacter
             </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;