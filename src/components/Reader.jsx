import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Settings,
  X
} from 'lucide-react';

const Reader = ({ manga, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const totalPages = 24;

  const handleNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handlePrev = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <motion.div 
      className="reader-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="reader-header">
        <div className="reader-title">
          <button onClick={onClose} className="back-btn"><X /></button>
          <div>
            <h3>{manga.title}</h3>
            <span>{manga.chapter} - Sahifa {currentPage}/{totalPages}</span>
          </div>
        </div>
        
        <div className="reader-controls">
          <button onClick={() => setZoom(prev => Math.min(prev + 0.2, 2))}><ZoomIn size={20} /></button>
          <button onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}><ZoomOut size={20} /></button>
          <button onClick={() => setZoom(1)}><RotateCcw size={20} /></button>
          <button><Settings size={20} /></button>
          <button className="download-btn"><Download size={20} /> Yuklash</button>
        </div>
      </div>

      <div className="reader-content">
        <button className="nav-zone prev" onClick={handlePrev}><ChevronLeft size={48} /></button>
        
        <div className="manga-page-container">
          <motion.img 
            key={currentPage}
            src={`https://picsum.photos/id/${100 + currentPage}/800/1200`} 
            alt={`Page ${currentPage}`}
            style={{ transform: `scale(${zoom})` }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          />
        </div>

        <button className="nav-zone next" onClick={handleNext}><ChevronRight size={48} /></button>
      </div>

      <div className="reader-footer">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(currentPage / totalPages) * 100}%` }}></div>
        </div>
      </div>
    </motion.div>
  );
};

export default Reader;
