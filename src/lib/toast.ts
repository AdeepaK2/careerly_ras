"use client";

export type ToastType = "success" | "error" | "info" | "warning";

export type ToastInput = {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
};

export type ToastItem = ToastInput & {
  id: string;
  type: ToastType;
  createdAt: number;
};

type Listener = (toasts: ToastItem[]) => void;

const DEFAULT_DURATION = 4200;
let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function emit() {
  listeners.forEach((listener) => listener([...toasts]));
}

function removeToast(id: string) {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function pushToast(input: ToastInput) {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const item: ToastItem = {
    id,
    type: input.type ?? "info",
    title: input.title,
    message: input.message,
    duration: input.duration ?? DEFAULT_DURATION,
    createdAt: Date.now(),
  };

  toasts = [item, ...toasts].slice(0, 4);
  emit();

  if (item.duration && item.duration > 0) {
    const timer = setTimeout(() => removeToast(id), item.duration);
    timers.set(id, timer);
  }

  return id;
}

export function subscribeToasts(listener: Listener) {
  listeners.add(listener);
  listener([...toasts]);
  return () => listeners.delete(listener);
}

export function dismissToast(id: string) {
  removeToast(id);
}

export function toast(message: string, type: ToastType = "info") {
  return pushToast({ message, type });
}

toast.success = (message: string, title = "Success") =>
  pushToast({ message, title, type: "success" });

toast.error = (message: string, title = "Something went wrong") =>
  pushToast({ message, title, type: "error" });

toast.info = (message: string, title = "Notice") =>
  pushToast({ message, title, type: "info" });

toast.warning = (message: string, title = "Please check") =>
  pushToast({ message, title, type: "warning" });

toast.custom = (input: ToastInput) => pushToast(input);
