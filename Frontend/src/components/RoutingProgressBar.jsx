import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const RoutingProgressBar = () => {
    const location = useLocation();
    const [isRouting, setIsRouting] = useState(false);

    useEffect(() => {
        setIsRouting(true);
        const timeout = setTimeout(() => setIsRouting(false), 600);
        return () => clearTimeout(timeout);
    }, [location.pathname]);

    return (
        <AnimatePresence>
            {isRouting && (
                <motion.div
                    initial={{ width: "0%", opacity: 1 }}
                    animate={{ width: "100%", opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-blue-600 via-blue-400 to-blue-500 z-[10000] shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                />
            )}
        </AnimatePresence>
    );
};

export default RoutingProgressBar;
