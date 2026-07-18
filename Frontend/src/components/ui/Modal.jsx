import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
}) => {
    const modalRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        const previouslyFocused = document.activeElement;
        const modalEl = modalRef.current;

        document.body.style.overflow = 'hidden';

        const focusableEls = modalEl ? modalEl.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) : [];

        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];
        firstEl?.focus();

        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                onClose();
            }
            if (e.key === 'Tab' && focusableEls.length > 0) {
                if (e.shiftKey && document.activeElement === firstEl) {
                    e.preventDefault();
                    lastEl.focus();
                } else if (!e.shiftKey && document.activeElement === lastEl) {
                    e.preventDefault();
                    firstEl.focus();
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
            previouslyFocused?.focus();
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-2xl'
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                className={`
          relative ${sizes[size]} w-full rounded-3xl shadow-2xl z-10
          bg-surface bg-surface dark:bg-surface dark:bg-gray-800
          text-ink-soft text-ink-soft dark:text-ink-soft dark:text-white
          animate-fadeIn
        `}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-outline dark:border-gray-700">
                    <h2 id="modal-title" className="text-2xl font-bold">
                        {title}
                    </h2>
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            aria-label="Close modal"
                            className="p-2 rounded-lg transition-all text-ink-soft-soft hover:text-ink-soft text-gray-500 dark:text-ink-soft-soft dark:text-gray-400 hover:bg-surface-alt dark:hover:bg-gray-700"
                        >
                            <FaTimes className="text-xl" />
                        </button>
                    )}
                </div>
                <div className="p-6 text-ink-soft-soft">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;