import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Languages, 
  ArrowRight,
  Volume2,
  Type,
  User,
  LogOut,
  Clock,
  Trash2
} from 'lucide-react';
import './App.css';
import AuthModal from './components/AuthModal';
import { supabase } from './lib/supabaseClient';
import { useEffect } from 'react';

const MangaTranslationApp = () => {
  const [sourceLang, setSourceLang] = useState('uz');
  const [targetLang, setTargetLang] = useState('en');
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(localStorage.getItem('username'));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [view, setView] = useState('translator');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const rawName = session.user.user_metadata.username || session.user.email.split('@')[0];
        const userName = rawName === 'ahmirov70-eng' ? 'Abdulazimzor' : rawName;
        setUser(userName);
        localStorage.setItem('username', userName);
        localStorage.setItem('userEmail', session.user.email);
        fetchHistory();
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const rawName = session.user.user_metadata.username || session.user.email.split('@')[0];
        const userName = rawName === 'ahmirov70-eng' ? 'Abdulazimzor' : rawName;
        setUser(userName);
        fetchHistory();
      } else {
        setUser(null);
        setHistory([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setHistory(data);
    }
  };

  const saveToHistory = async (source, target, sLang, tLang) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from('translations').insert([
      {
        user_id: session.user.id,
        source_text: source,
        target_text: target,
        source_lang: sLang,
        target_lang: tLang
      }
    ]);
    fetchHistory();
  };

  const deleteHistoryItem = async (id) => {
    const { error } = await supabase
      .from('translations')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setHistory(history.filter(item => item.id !== id));
    }
  };

  const languages = [
    { code: 'ja', name: 'Yapon tili', flag: '🇯🇵' },
    { code: 'en', name: 'Ingliz tili', flag: '🇺🇸' },
    { code: 'ko', name: 'Koreys tili', flag: '🇰🇷' },
    { code: 'uz', name: 'O\'zbek tili', flag: '🇺🇿' },
    { code: 'ru', name: 'Rus tili', flag: '🇷🇺' },
    { code: 'zh', name: 'Xitoy tili', flag: '🇨🇳' },
    { code: 'tr', name: 'Turk tili', flag: '🇹🇷' },
  ];
  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(targetText);
    setTargetText(sourceText);
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setLoading(true);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(sourceText)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data[0]) {
        const translatedText = data[0].map(item => item[0]).join('');
        setTargetText(translatedText);
        setLoading(false); // Clear loading immediately
        
        // Save to history in background
        saveToHistory(sourceText, translatedText, sourceLang, targetLang);
      } else {
        setTargetText("Tarjima qilishda xatolik yuz berdi");
        setLoading(false);
      }
    } catch (err) {
      console.error("Translation Error:", err);
      alert('Tarjima qilishda xatolik yuz berdi. Internetni tekshiring.');
      setLoading(false);
    }
  };

  const handleSpeak = (text) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    // Attempt to set voice based on target language
    const voices = window.speechSynthesis.getVoices();
    const langMap = { uz: 'uz-UZ', ja: 'ja-JP', en: 'en-US', ru: 'ru-RU' };
    utterance.lang = langMap[targetLang] || 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    setUser(null);
  };

  return (
    <div className="app-container">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      <main>
        <AnimatePresence mode="wait">
          {view === 'translator' ? (
            <motion.div 
              key="translate"
              className="translate-page-v2 container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
            <div className="app-frame glass-card">
              <div className="app-header">
                <motion.div 
                  className="app-logo"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="logo-glow"></div>
                  <Languages size={32} />
                  <span>Manga<span>Translate</span></span>
                </motion.div>

                <div className="profile-action">
                  {user && (
                    <button 
                      className="auth-trigger-btn" 
                      onClick={() => setView('history')} 
                      title="Tarix"
                    >
                      <Clock size={20} />
                    </button>
                  )}
                  {user ? (
                    <div className="profile-info">
                      <span className="user-tag" onClick={() => setView('profile')}>{user}</span>
                      <button className="auth-trigger-btn" onClick={handleLogout} title="Chiqish">
                        <LogOut size={20} />
                      </button>
                    </div>
                  ) : (
                    <button className="auth-trigger-btn" onClick={() => setIsAuthModalOpen(true)} title="Kirish">
                      <User size={20} />
                    </button>
                  )}
                </div>
              </div>

              <div className="app-hero-text">
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Ohiratda <span className="gradient-text">Tarjima</span> Qiling
                </motion.h1>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  Eng tez va aniq manga tarjimoni. AI yordamida sevimli mangalaringizdan zavqlaning.
                </motion.p>
              </div>
              <div className="app-body">

                <motion.div 
                  className="translate-container-v2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Source Bubble */}
                  <motion.div 
                    className="lang-bubble source-bubble"
                    whileHover={{ y: -5 }}
                  >
                    <div className="bubble-header">
                      <div className="lang-info">
                        <span className="flag-icon">{languages.find(l => l.code === sourceLang)?.flag}</span>
                        <select 
                          value={sourceLang} 
                          onChange={(e) => setSourceLang(e.target.value)}
                        >
                          {languages.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <textarea 
                      className="bubble-textarea" 
                      placeholder="Type here..."
                      value={sourceText}
                      onChange={(e) => setSourceText(e.target.value)}
                    ></textarea>
                  </motion.div>

                  <div className="center-action">
                    <motion.button 
                      className="main-swap-btn" 
                      onClick={handleSwap}
                      whileHover={{ scale: 1.1, rotate: 270 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ArrowRight size={28} />
                    </motion.button>
                  </div>

                  <motion.div 
                    className="lang-bubble target-bubble"
                    whileHover={{ y: -5 }}
                  >
                    <div className="bubble-header">
                      <div className="lang-info">
                        <span className="flag-icon">{languages.find(l => l.code === targetLang)?.flag}</span>
                        <select 
                          value={targetLang} 
                          onChange={(e) => setTargetLang(e.target.value)}
                        >
                          {languages.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                          ))}
                        </select>
                      </div>
                      <button 
                        className="speak-icon-btn" 
                        onClick={() => handleSpeak(targetText)}
                        disabled={!targetText}
                        title="Ovozli eshitish"
                      >
                        <Volume2 size={20} />
                      </button>
                    </div>
                    <textarea 
                      className="bubble-textarea" 
                      readOnly 
                      placeholder={loading ? "Translating..." : "Translation..."}
                      value={targetText}
                    ></textarea>
                  </motion.div>
                  <motion.div 
                    className="footer-action"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <button 
                      className="translate-btn-v2" 
                      onClick={handleTranslate}
                      disabled={loading || !sourceText.trim()}
                    >
                      {loading ? (
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                          <Languages size={24} />
                        </motion.div>
                      ) : 'Translate Now'}
                    </button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
          ) : view === 'profile' ? (
            <motion.div 
              key="profile"
              className="profile-page-v2 container"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="app-frame profile-card">
                <div className="profile-header">
                  <button className="back-btn-v2" onClick={() => setView('translator')}>
                    <ArrowRight style={{ transform: 'rotate(180deg)' }} size={24} />
                    Orqaga
                  </button>
                </div>

                <div className="profile-content">
                  <motion.div 
                    className="avatar-container"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                    <div className="avatar-glow"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1000&auto=format&fit=crop" 
                      alt="Lion Profile" 
                      className="profile-avatar"
                    />
                  </motion.div>

                  <motion.div 
                    className="user-details"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2>{user || 'Foydalanuvchi'}</h2>
                    <p className="user-email">{localStorage.getItem('userEmail') || 'email@example.com'}</p>
                    
                    <div className="profile-actions-grid">
                      <button className="action-btn-v2">Profilni tahrirlash</button>
                      <button className="action-btn-v2 secondary">Sozlamalar</button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ) : view === 'history' ? (
            <motion.div 
              key="history-page"
              className="history-page container"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="app-frame history-card">
                <div className="history-header-main">
                  <button className="back-btn-v2" onClick={() => setView('translator')}>
                    <ArrowRight style={{ transform: 'rotate(180deg)' }} size={24} />
                    Orqaga
                  </button>
                  <h2><Clock size={28} /> Xotira</h2>
                  <p>Barcha qilingan tarjimalaringiz</p>
                </div>

                <div className="history-content-main">
                  {history.length > 0 ? (
                    <div className="history-grid">
                      {history.map((item) => (
                        <motion.div 
                          key={item.id} 
                          className="history-card-item"
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="h-card-header">
                            <span className="h-lang-tag">{item.source_lang}</span>
                            <ArrowRight size={14} className="h-arrow" />
                            <span className="h-lang-tag">{item.target_lang}</span>
                            <button onClick={() => deleteHistoryItem(item.id)} className="h-delete-btn">
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <div className="h-card-body">
                            <p className="h-source-text">{item.source_text}</p>
                            <p className="h-target-text">{item.target_text}</p>
                          </div>
                          <div className="h-card-footer">
                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-history-v2">
                      <Clock size={64} />
                      <h3>Hozircha xotira bo'sh</h3>
                      <p>Tarjima qilishni boshlang va ular shu yerda saqlanadi.</p>
                      <button className="action-btn-v2" onClick={() => setView('translator')}>Tarjima qilish</button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={(username) => setUser(username)}
      />
    </div>
  );
};

export default MangaTranslationApp;
