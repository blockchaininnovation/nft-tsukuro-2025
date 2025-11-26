"use client";

import { useEffect, useState } from "react";

interface SuccessDialogProps {
    isOpen: boolean;
    onClose: () => void;
    txHash: string;
}

export function SuccessDialog({ isOpen, onClose, txHash }: SuccessDialogProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog Content */}
            <div
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full transform transition-all duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
                    }`}
            >
                <div className="text-center">
                    {/* Success Icon */}
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-6">
                        <svg
                            className="h-8 w-8 text-green-600 dark:text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Mint Successful!
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        NFTのミントが完了しました
                    </p>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-6">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Transaction Hash
                        </p>
                        <a
                            href={`https://amoy.polygonscan.com/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-mono text-blue-600 dark:text-blue-400 hover:underline break-all"
                        >
                            {txHash.slice(0, 6)}...{txHash.slice(-4)}
                        </a>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
}
