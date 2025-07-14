import React from 'react';
import { FaRocket } from 'react-icons/fa';
import { motion } from 'framer-motion';

const loaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
  minHeight: '80px',
};

function Loader({ fullScreen = false }) {
  const overlayStyle = fullScreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(255,255,255,0.7)',
        zIndex: 9999,
        ...loaderStyle,
      }
    : loaderStyle;

  return (
    <div style={overlayStyle}>
      <motion.div
        initial={{ y: 40, scale: 0.8, opacity: 0.7 }}
        animate={{
          y: [40, -20, -40, -60, -80, -100, 40],
          scale: [0.8, 1.1, 1, 1.2, 1, 1.1, 0.8],
          opacity: [0.7, 1, 1, 1, 1, 1, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <FaRocket style={{ fontSize: '3rem', color: '#667eea', filter: 'drop-shadow(0 4px 12px #667eea88)', transform: 'rotate(315deg)' }} />
        <motion.div
          initial={{ opacity: 0.7, scale: 1 }}
          animate={{
            opacity: [0.7, 0.2, 0.7],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            width: 12,
            height: 32,
            marginTop: -8,
            background: 'linear-gradient(180deg, #ff9800 0%, #fffde4 100%)',
            borderRadius: '0 0 12px 12px',
            filter: 'blur(2px)',
          }}
        />
      </motion.div>
    </div>
  );
}

export default Loader; 