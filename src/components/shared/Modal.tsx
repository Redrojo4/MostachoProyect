import React from 'react';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-xl dark:bg-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-3xl leading-none text-slate-400 hover:text-slate-800 dark:hover:text-white">
            &times;
          </button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
