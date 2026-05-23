import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Button } from './Button';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  variant?: 'modal' | 'drawer';
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

export default function Modal({ open, onClose, title, variant = 'modal', actions, children }: ModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const content = (
    <div className={`modal-backdrop ${variant}`} onClick={onClose}>
      <div className={`modal-panel ${variant}`} onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          {title ? <h3>{title}</h3> : null}
          <Button variant="ghost" onClick={onClose} aria-label="Close">✕</Button>
        </header>
        <section className="modal-body">{children}</section>
        {actions ? <footer className="modal-footer">{actions}</footer> : null}
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
}
