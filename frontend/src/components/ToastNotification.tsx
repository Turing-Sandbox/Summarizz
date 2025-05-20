import { useEffect } from "react";

type ToastNotificationProps = {
  message: string;
  type: "error" | "feedback" | "success";
  onClose: () => void;
};

const notificationStyles = {
  error: "toast-error",
  feedback: "toast-feedback",
  success: "toast-success",
};

export default function ToastNotification({
  message,
  type,
  onClose,
}: ToastNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast-notification ${notificationStyles[type]}`}>
      <span className={`toast-message }`}>{message}</span>
      <button className='toast-close' onClick={onClose} aria-label='Close'>
        ×
      </button>
    </div>
  );
}
