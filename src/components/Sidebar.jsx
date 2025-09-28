import React from 'react';
import { motion } from 'framer-motion';
import { Home, Building2, Users, Briefcase, FileText, CreditCard } from 'lucide-react';

const Sidebar = ({ onSectionChange, activeSection }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Tableau de bord' },
    { id: 'entreprises', icon: Building2, label: 'Entreprises' },
    { id: 'users', icon: Users, label: 'Utilisateurs' },
    { id: 'employes', icon: Briefcase, label: 'Employés' },
    { id: 'payruns', icon: FileText, label: 'Cycles de paie' },
    { id: 'payslips', icon: FileText, label: 'Bulletins' },
    { id: 'paiements', icon: CreditCard, label: 'Paiements' },
  ];

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50"
    >
      <nav className="p-6">
        <ul className="space-y-4">
          {navItems.map((item) => (
            <motion.li key={item.id}>
              <motion.button
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-sky-50 text-sky-600 border-l-4 border-sky-600'
                    : 'text-gray-700 hover:bg-sky-50 hover:text-sky-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            </motion.li>
          ))}
        </ul>
      </nav>
    </motion.aside>
  );
};

export default Sidebar;
