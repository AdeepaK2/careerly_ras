"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import {
  dismissToast,
  subscribeToasts,
  type ToastItem,
  type ToastType,
} from "@/lib/toast";

const styles: Record<
  ToastType,
  { bar: string; iconWrap: string; icon: string; glow: string }
> = {
  success: {
    bar: "from-[#8243ff] to-violet-500",
    iconWrap: "bg-[#8243ff]/15 text-[#8243ff]",
    icon: "text-[#8243ff]",
    glow: "shadow-[0_12px_40px_-12px_rgba(130,67,255,0.55)]",
  },
  error: {
    bar: "from-rose-500 to-fuchsia-500",
    iconWrap: "bg-rose-500/10 text-rose-600",
    icon: "text-rose-600",
    glow: "shadow-[0_12px_40px_-12px_rgba(244,63,94,0.45)]",
  },
  info: {
    bar: "from-[#8243ff] to-indigo-500",
    iconWrap: "bg-indigo-500/10 text-indigo-600",
    icon: "text-indigo-600",
    glow: "shadow-[0_12px_40px_-12px_rgba(99,102,241,0.45)]",
  },
  warning: {
    bar: "from-amber-400 to-orange-500",
    iconWrap: "bg-amber-500/10 text-amber-600",
    icon: "text-amber-600",
    glow: "shadow-[0_12px_40px_-12px_rgba(245,158,11,0.45)]",
  },
};

function ToastIcon({ type }: { type: ToastType }) {
  const className = `w-5 h-5 ${styles[type].icon}`;
  switch (type) {
    case "success":
      return <CheckCircle2 className={className} />;
    case "error":
      return <XCircle className={className} />;
    case "warning":
      return <AlertTriangle className={className} />;
    default:
      return <Info className={className} />;
  }
}

function ToastCard({ item }: { item: ToastItem }) {
  const style = styles[item.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className={`pointer-events-auto relative w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-white/60 bg-white/90 backdrop-blur-xl ${style.glow}`}
      role="status"
      aria-live="polite"
    >
      <div className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${style.bar}`} />
      <div className="flex gap-3 p-4 pl-5">
        <div
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.iconWrap}`}
        >
          <ToastIcon type={item.type} />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          {item.title ? (
            <p className="text-sm font-semibold text-gray-900">{item.title}</p>
          ) : null}
          <p className={`text-sm text-gray-600 ${item.title ? "mt-0.5" : ""}`}>
            {item.message}
          </p>
        </div>
        <button
          type="button"
          onClick={() => dismissToast(item.id)}
          className="rounded-lg p-1 text-gray-400 transition hover:bg-purple-50 hover:text-[#8243ff]"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="h-0.5 w-full bg-purple-50">
        <motion.div
          className={`h-full bg-gradient-to-r ${style.bar}`}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{
            duration: (item.duration ?? 4200) / 1000,
            ease: "linear",
          }}
        />
      </div>
    </motion.div>
  );
}

export default function ToastViewport() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => subscribeToasts(setItems), []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex flex-col items-center gap-3 px-4 sm:items-end sm:pr-6">
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <ToastCard key={item.id} item={item} />
        ))}
      </AnimatePresence>
    </div>
  );
}
