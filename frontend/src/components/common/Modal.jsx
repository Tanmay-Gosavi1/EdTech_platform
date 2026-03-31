import React from 'react';

const Modal = ({
  isOpen,
  title,
  description,
  onClose,
  children,
  actions,
  maxWidth = 'max-w-md',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className={`w-full ${maxWidth} rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl`}>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
        </div>

        <div>{children}</div>

        <div className="mt-5 flex justify-end gap-3">
          {actions || (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;