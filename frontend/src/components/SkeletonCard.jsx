import React from 'react';

function SkeletonCard({ type = 'recipe' }) {
    return (
        <div className="card p-4 animate-pulse">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-40 h-40 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-1"></div>
                        </div>
                    </div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    <div className="flex justify-between items-center pt-2">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SkeletonCard;