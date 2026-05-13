import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, User, ArrowRight, Mail, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        // Supabase Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email || formData.username, // Supabase usually uses email, but we'll try both
          password: formData.password,
        });

        if (error) throw error;

        const userName = data.user.user_metadata?.username || data.user.email.split('@')[0];
        localStorage.setItem('username', userName);
        localStorage.setItem('userEmail', data.user.email);
        onAuthSuccess(userName);
        onClose();
      } else {
        // Supabase Register
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username
            }
          }
        });

        if (error) throw error;

        // If email confirmation is off, we might already have a session
        if (data.session) {
          const userName = data.user.user_metadata.username;
          localStorage.setItem('username', userName);
          localStorage.setItem('userEmail', data.user.email);
          onAuthSuccess(userName);
          onClose();
        } else {
          alert('Ro\'yxatdan o\'tish muvaffaqiyatli! Emailingizni tekshiring (agar tasdiqlash yoqilgan bo\'lsa).');
          setIsLogin(true);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay">
          <motion.div 
            className="auth-modal premium-modal"
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className="modal-accent-glow"></div>
            <button onClick={onClose} className="modal-close"><X size={22} /></button>
            
            <div className="auth-header">
              <motion.div 
                className="auth-icon-badge"
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles className="text-primary" size={24} />
              </motion.div>
              <motion.h2 
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {isLogin ? 'Xush kelibsiz' : 'Hisob ochish'}
              </motion.h2>
              <p>{isLogin ? 'Tizimga kiring' : 'Supabase orqali ro\'yxatdan o\'ting'}</p>
            </div>

            {error && (
              <motion.div 
                className="auth-error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {isLogin ? (
                <div className="input-field">
                  <label><Mail size={16} /> Email manzili</label>
                  <div className="input-wrapper">
                    <input 
                      type="email" 
                      placeholder="example@mail.com" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="input-field">
                    <label><User size={16} /> Foydalanuvchi nomi</label>
                    <div className="input-wrapper">
                      <input 
                        type="text" 
                        placeholder="User_123" 
                        required 
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="input-field">
                    <label><Mail size={16} /> Email manzili</label>
                    <div className="input-wrapper">
                      <input 
                        type="email" 
                        placeholder="example@mail.com" 
                        required 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="input-field">
                <label><Lock size={16} /> Parol</label>
                <div className="input-wrapper">
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit-btn-v2" disabled={loading}>
                {loading ? 'Kutilmoqda...' : (isLogin ? 'Kirish' : 'Ro\'yxatdan o\'tish')}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                {isLogin ? "Hali a'zo emasmisiz?" : "Hisobingiz bormi?"}
                <button onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}>
                  {isLogin ? "Hoziroq oching" : "Tizimga kiring"}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
