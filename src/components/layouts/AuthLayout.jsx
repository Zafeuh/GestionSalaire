import React from 'react';
import { BarChart3 } from 'lucide-react';

const AuthLayout = ({ children, title , subtitle  }) => {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Panneau gauche : Header + Formulaire - 50% */}
      <div className="w-1/2 flex flex-col justify-center py-12 px-8 sm:px-12 lg:px-16 xl:px-20">
        {/* Logo Teranga */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="bg-sky-500 rounded-lg p-2 mr-3">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-800">Ter</span>
              <span className="text-2xl font-bold text-sky-500">anga</span>
              <div className="text-xs text-sky-500 font-medium -mt-1 ml-10">Pay</div>
            </div>
          </div>
        </div>
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
        </div>

        {/* Formulaire children */}
        <div>
          {children}
        </div>
      </div>

      {/* Panneau droit : Welcome section - 50% */}
      <div className="w-1/2 relative overflow-hidden">
        {/* Image de fond */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/finance.jpg')`
          }}
        ></div>
        
        {/* Overlay transparent bleu */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/80 to-sky-600/85"></div>
        
        <div className="flex flex-col justify-center items-center h-full p-12 relative z-10 text-white">
          <h1 className="text-5xl font-extrabold mb-6 text-center tracking-tight">Bienvenue !</h1>
          <p className="text-xl mb-8 text-center max-w-md font-medium leading-relaxed">
            Veuillez vous connecter à votre compte{' '}
            <span className="font-bold underline decoration-white/70 decoration-2 underline-offset-2">Teranga pay</span>
          </p>
          <p className="text-white/90 text-center max-w-sm mb-8 leading-relaxed">
            Gérez vos transactions facilement et en toute sécurité. Accédez à vos informations en temps réel et profitez d'une expérience fluide et rapide.
          </p>
        </div>
        
        {/* Background decoration modernisé */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 right-0 w-40 h-40 bg-white/5 rounded-full translate-x-20"></div>
      </div>
    </div>
  );
};

export default AuthLayout;