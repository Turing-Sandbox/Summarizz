import { useState, ReactNode } from "react";
import ToastNotification from "../../components/ToastNotification";
import { ToastType } from "./ToastType";
import { ToastContext } from "./ToastContext";


export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const notify = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const handleClose = () => setToast(null);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={handleClose}
        />
      )}
    </ToastContext.Provider>
  );
}
