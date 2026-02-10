import React from 'react';
import { motion } from 'framer-motion';

const SubtleLoader = ({ message = "Analyzing data stream..." }) => {
    return (
        <div className="flex flex-col items-center justify-center p-12">
            <div className="relative w-16 h-16 mb-6">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-blue-500/20 border-t-blue-500 rounded-full"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 border-2 border-blue-400/10 border-r-blue-400/50 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={{ scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"
                    />
                </div>
            </div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-slate-400 text-sm font-medium tracking-wide"
            >
                {message}
            </motion.p>
        </div>
    );
};

export default SubtleLoader;
