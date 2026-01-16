export type ToastPosition = "top" | "bottom";

export type ToastPayload = {
  message: string;
  position?: ToastPosition;
};

type ToastListener = (payload: ToastPayload) => void;

let listener: ToastListener | null = null;

export const toast = {
  customToast(message: string, position: ToastPosition = "bottom") {
    listener?.({ message, position });
  },

  _subscribe(fn: ToastListener) {
    listener = fn;
    return () => {
      // only remove if it's the same listener (safety)
      if (listener === fn) listener = null;
    };
  },
};
