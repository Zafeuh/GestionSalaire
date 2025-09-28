import React, { useState } from 'react';
import { Eye, EyeOff, Twitter, Linkedin, Instagram, Loader2 } from 'lucide-react';
import { useAuth } from '../contexte/useAuth';
import { validateAuthForm } from '../validations/authValidation';
import toast from 'react-hot-toast';

export default function FormConnexion() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: [] }));
    }
  };

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Éviter les soumissions multiples
    
    try {
      setErrors({});
      setIsSubmitting(true);
      
      // Validation du formulaire
      const formErrors = validateAuthForm(formData);
      const hasErrors = formErrors.email?.length > 0 || formErrors.password?.length > 0;
      
      if (hasErrors) {
        setErrors(formErrors);
        const errorMessages = [...(formErrors.email || []), ...(formErrors.password || [])];
        errorMessages.forEach(error => toast.error(error));
        return;
      }

      // Tentative de connexion
      const success = await login(formData.email, formData.password);
      
      if (success) {
        toast.success('Connexion réussie !');
      } else {
        toast.error('Identifiants incorrects');
      }
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <div className="relative">
          <input
            id="email"
            name="email"
            type="text"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            className={`block w-full px-4 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition ${
              errors.email?.length > 0 ? 'border-red-300' : ''
            }`}
            placeholder="Entrez votre email"
          />
        </div>
        {errors.email?.length > 0 && (
          <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            className={`block w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition ${
              errors.password?.length > 0 ? 'border-red-300' : ''
            }`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={togglePassword}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {errors.password?.length > 0 && (
          <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>
        )}
      </div>

      {/* Remember & Forgot */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-sky-500 focus:ring-sky-500 border-gray-300 rounded"
          />
          <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
            Se souvenir de moi
          </label>
        </div>
        <div className="text-sm">
          <a href="#" className="font-medium text-sky-500 hover:text-sky-600">
            Mot de passe oublié ?
          </a>
        </div>
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connexion en cours...
            </>
          ) : (
            'Se connecter'
          )}
        </button>
      </div>

      {/* Divider - Suivez-nous */}
      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Suivez-nous sur nos réseaux</span>
          </div>
        </div>
      </div>

      {/* Social Follow Links */}
      <div className="mt-6">
        <p className="text-center text-sm text-gray-600 mb-4">
          Restez connectés avec Teranga Pay
        </p>
        <div className="flex justify-center space-x-4">
          <a
            href="#"
            className="inline-flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition"
            title="Suivez-nous sur Twitter"
          >
            <Twitter className="h-5 w-5 text-sky-500" />
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition"
            title="Suivez-nous sur LinkedIn"
          >
            <Linkedin className="h-5 w-5 text-blue-700" />
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition"
            title="Suivez-nous sur Instagram"
          >
            <Instagram className="h-5 w-5 text-pink-500" />
          </a>
        </div>
        <p className="text-center text-xs text-gray-500 mt-3">
          Pour les dernières actualités et mises à jour de votre plateforme de gestion des salaires
        </p>
      </div>

      {/* Support Contact */}
      <div className="text-center mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Besoin d'aide ? {' '}
          <a href="#" className="text-sky-500 hover:text-sky-600 font-medium">
            Contactez le support IT
          </a>
        </p>
      </div>
    </form>
  );
}