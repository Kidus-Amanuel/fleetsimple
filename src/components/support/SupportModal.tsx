"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/api";
import { SupportRequest } from "@/api/types";
import { toast } from "react-hot-toast";
import { FaPaperPlane, FaHeadset, FaClock, FaCheckCircle, FaSpinner } from "react-icons/fa";

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
    const { user, company } = useAuth();
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [requests, setRequests] = useState<SupportRequest[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && company?.id) {
            fetchRequests();
        }
    }, [isOpen, company?.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [requests]);

    const fetchRequests = async () => {
        if (!company?.id) return;
        setFetching(true);
        try {
            const data = await api.support.getMySupportRequests(company.id);
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch support requests", error);
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !user || !company) return;

        setLoading(true);
        try {
            await api.support.createSupportRequest({
                company_id: company.id,
                user_id: user.id,
                message: message.trim(),
                priority: "medium",
            });
            setMessage("");
            toast.success("Support request sent successfully!");
            fetchRequests();
        } catch (error: any) {
            toast.error(error.message || "Failed to send request");
        } finally {
            setLoading(true); // Small delay feel
            setTimeout(() => setLoading(false), 500);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-0 overflow-hidden">
            <div className="flex flex-col h-[600px] bg-white dark:bg-gray-900">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-brand-500/5 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                            <FaHeadset size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Command Center</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Admin support & requests</p>
                        </div>
                    </div>
                </div>

                {/* Requests List */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
                >
                    {fetching ? (
                        <div className="h-full flex items-center justify-center">
                            <FaSpinner className="animate-spin text-brand-500 text-2xl" />
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <FaPaperPlane className="text-gray-300 dark:text-gray-600 text-xl" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No active requests</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-xs text-sm">
                                Need help? Send a message below and our admin team will get back to you immediately.
                            </p>
                        </div>
                    ) : (
                        requests.map((req) => (
                            <div key={req.id} className="flex flex-col space-y-2">
                                <div className="flex items-start gap-3">
                                    <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-2xl rounded-tl-none p-4 border border-gray-100 dark:border-gray-800">
                                        <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap">{req.message}</p>
                                        <div className="mt-3 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider">
                                            <span className="text-gray-400 flex items-center gap-1">
                                                <FaClock /> {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className={`flex items-center gap-1 ${req.status === 'resolved' ? 'text-green-500' : 'text-amber-500'}`}>
                                                {req.status === 'resolved' ? <FaCheckCircle /> : <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                                                {req.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {req.admin_response && (
                                    <div className="flex items-start gap-3 pl-8">
                                        <div className="flex-1 bg-brand-500/5 dark:bg-brand-500/10 rounded-2xl rounded-tr-none p-4 border border-brand-500/10">
                                            <p className="text-brand-700 dark:text-brand-400 text-sm font-medium mb-1">Admin Response</p>
                                            <p className="text-gray-800 dark:text-gray-200 text-sm">{req.admin_response}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Minimalist Input Layer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
                    <form onSubmit={handleSubmit} className="relative group">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your request here..."
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl py-3 pl-4 pr-14 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none shadow-sm dark:text-white"
                            rows={2}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <button
                            type="submit"
                            disabled={loading || !message.trim()}
                            className="absolute right-2 bottom-2 p-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-brand-500/20 active:scale-95"
                        >
                            {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane size={16} />}
                        </button>
                    </form>
                    <p className="text-[10px] text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                        <FaClock className="text-xs" /> Responses typically arrive within 1 hour
                    </p>
                </div>
            </div>
        </Modal>
    );
}
