import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen = ({ message = "Initializing Security Protocols" }) => {
    const [statusIndex, setStatusIndex] = useState(0);

    const statuses = [
        "Verifying system integrity...",
        "Scanning neural pathways...",
        "Establishing secure gateway...",
        "Guardian AI active."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStatusIndex((prev) => (prev < statuses.length - 1 ? prev + 1 : prev));
        }, 800);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8 }}
            className="aegis-loader-overlay"
        >
            {/* Background Effects */}
            <div className="aegis-loader-bg">
                <div className="aegis-hexagon-grid"></div>
            </div>

            <div className="aegis-loader-content">
                {/* Central Shield Animation */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="aegis-shield-container"
                >
                    <div className="aegis-ring-outer"></div>
                    <div className="aegis-ring-inner"></div>
                    <div className="aegis-shield-icon">
                        <Shield size={48} className="text-blue-500 fill-blue-500/20" />
                        <div className="aegis-scan-bar"></div>
                    </div>
                </motion.div>

                {/* Text Information */}
                <div className="aegis-loader-text-container">
                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="aegis-loader-title"
                    >
                        GUARDIAN AI
                    </motion.h2>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="aegis-loader-status"
                    >
                        <span>{message}</span>
                        <div className="aegis-loader-cursor"></div>
                    </motion.div>
                </div>

                {/* Progress Bar */}
                <div className="aegis-progress-container">
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                        className="aegis-progress-bar"
                    ></motion.div>
                </div>

                {/* Status Checklist */}
                <div className="aegis-status-list">
                    <AnimatePresence mode="popLayout">
                        {statuses.map((status, index) => (
                            index <= statusIndex && (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="aegis-status-item"
                                    style={{
                                        color: index === statusIndex ? '#94a3b8' : '#475569'
                                    }}
                                >
                                    <div className={`aegis-status-dot ${index <= statusIndex ? 'active' : ''}`}></div>
                                    <span>{status}</span>
                                </motion.div>
                            )
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Encryption Badge */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-10 flex items-center gap-2 text-[10px] tracking-[0.2em] font-bold text-slate-600 uppercase"
            >
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                Quantum Encryption Active
            </motion.div>
        </motion.div>
    );
};

export default LoadingScreen;
