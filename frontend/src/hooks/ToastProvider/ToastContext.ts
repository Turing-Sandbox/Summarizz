import { createContext } from "react";
import { ToastType } from "./ToastType";

export type ToastContextType = {
  notify: (message: string, type: ToastType) => void;
};

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);
