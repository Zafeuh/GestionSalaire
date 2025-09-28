export const validateEmail = (email) => {
  const errors = [];
  
  if (!email || email.trim() === '') {
    errors.push('L\'email est requis');
  } else if (email.length < 3) {
    errors.push('L\'email doit contenir au moins 3 caractères');
  } else if (email.length > 50) {
    errors.push('L\'email ne doit pas dépasser 50 caractères');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('L\'email doit être valide (ex. nom@domaine.com)');
  }

  return errors;
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.trim() === '') {
    errors.push('Le mot de passe est requis');
  } else if (password.length < 6) {
    errors.push('Le mot de passe doit contenir au moins 6 caractères');
  } else if (password.length > 50) {
    errors.push('Le mot de passe ne doit pas dépasser 50 caractères');
  }

  return errors;
};

export const validateName = (name) => {
  const errors = [];
  
  if (!name || name.trim() === '') {
    errors.push('Le nom est requis');
  } else if (name.length < 3) {
    errors.push('Le nom doit contenir au moins 3 caractères');
  } else if (name.length > 50) {
    errors.push('Le nom ne doit pas dépasser 50 caractères');
  } else if (!/^[a-zA-ZÀ-ÿ\s-]+$/.test(name)) {
    errors.push('Le nom ne doit contenir que des lettres, espaces et tirets');
  }

  return errors;
};

export const validatePasswordConfirm = (password, passwordConfirm) => {
  const errors = [];
  
  if (!passwordConfirm || passwordConfirm.trim() === '') {
    errors.push('La confirmation du mot de passe est requise');
  } else if (password !== passwordConfirm) {
    errors.push('Les mots de passe ne correspondent pas');
  }

  return errors;
};

export const validateAuthForm = (formData) => {
  const { email, password } = formData;
  const emailErrors = validateEmail(email);
  const passwordErrors = validatePassword(password);
  
  return {
    email: emailErrors,
    password: passwordErrors
  };
};

export const validateRegisterForm = (formData) => {
  const { nom, email, password, passwordConfirm } = formData;
  const errors = {
    nom: validateName(nom),
    email: validateEmail(email),
    password: validatePassword(password),
    passwordConfirm: validatePasswordConfirm(password, passwordConfirm),
    hasError: false
  };

  errors.hasError = errors.nom.length > 0 || 
                   errors.email.length > 0 || 
                   errors.password.length > 0 || 
                   errors.passwordConfirm.length > 0;

  return errors;
};
