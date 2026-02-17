import React, { createContext, useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

interface ModalContextType {
    openModal: (message: string) => void;
    closeModal: () => void;
}

const GLOBAL_MODAL_EVENT = "OPEN_GLOBAL_MODAL";


const ModalContext = createContext<ModalContextType | null>(null);

// external reference (important for API access)
export const openGlobalModal = (message: string) => {
    window.dispatchEvent(
        new CustomEvent(GLOBAL_MODAL_EVENT, { detail: message })
    );
};


export const ModalProvider = ({ children }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {

        const handler = (event: any) => {
            setMessage(event.detail);
            setIsOpen(true);
        };

        window.addEventListener(GLOBAL_MODAL_EVENT, handler);

        return () => {
            window.removeEventListener(GLOBAL_MODAL_EVENT, handler);
        };

    }, []);

    const openModal = (msg: string) => {
        setMessage(msg);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setMessage("");
    };

    const value = { openModal, closeModal };


    return (
        <ModalContext.Provider value={value}>

            {children}

            {/* GLOBAL MODAL UI */}
            {isOpen && createPortal(

                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center">

                    <div className="w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>

                        {/* Header */}
                        <div className="bg-red-50 border-b border-red-100 p-5 flex items-center gap-3">
                            <div className="bg-red-100 text-red-600 p-2 rounded-full">
                                <AlertTriangle size={22} />
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-red-700">
                                    Important Warning
                                </h2>
                                <p className="text-sm text-red-500">
                                    Immediate attention required
                                </p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 text-gray-700 leading-relaxed">
                            {message}
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-6 flex justify-end">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log("OK BUTTON CLICKED");

                                    setIsOpen(false);
                                    setMessage("");
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium transition"
                            >
                                OK
                            </button>

                        </div>

                    </div>

                </div>,

                document.body
            )}

        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const ctx = useContext(ModalContext);
    if (!ctx) throw new Error("ModalProvider missing");
    return ctx;
};
