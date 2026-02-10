import React from 'react';

const CardSkeleton = () => {
    return (
        <div className="bg-[#0B1120] border border-gray-800 rounded-xl p-6 animate-pulse">
            <div className="h-4 w-24 bg-gray-800 rounded mb-4"></div>
            <div className="flex items-end gap-3 mb-4">
                <div className="h-10 w-20 bg-gray-800 rounded"></div>
                <div className="h-4 w-32 bg-gray-800 rounded"></div>
            </div>
            <div className="mt-4 flex gap-1 items-end h-8">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="flex-1 bg-gray-800 rounded-t-sm" style={{ height: `${Math.random() * 100}%` }}></div>
                ))}
            </div>
        </div>
    );
};

export const DashboardSkeleton = () => {
    return (
        <div className="p-8 space-y-8 min-h-screen bg-[#020617]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
            </div>
            <div className="bg-[#0B1120] border border-gray-800 rounded-xl h-64 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0B1120] border border-gray-800 rounded-xl h-48 animate-pulse"></div>
                <div className="bg-[#0B1120] border border-gray-800 rounded-xl h-48 animate-pulse"></div>
            </div>
        </div>
    );
};

export default CardSkeleton;
