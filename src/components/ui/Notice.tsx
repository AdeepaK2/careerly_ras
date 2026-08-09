"use client";

import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

type NoticeType = "success" | "error" | "info" | "warning";

type NoticeProps = {
  type?: NoticeType;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
};

const styles: Record<NoticeType, string> = {
  success:
    "border-[#8243ff]/20 bg-gradient-to-r from-[#8243ff]/10 via-violet-50 to-white text-gray-800",
  error: "border-rose-200 bg-gradient-to-r from-rose-50 via-fuchsia-50/40 to-white text-rose-900",
  info: "border-indigo-200 bg-gradient-to-r from-indigo-50 via-purple-50/50 to-white text-indigo-950",
  warning:
    "border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50/40 to-white text-amber-950",
};

const iconWrap: Record<NoticeType, string> = {
  success: "bg-[#8243ff]/15 text-[#8243ff]",
  error: "bg-rose-100 text-rose-600",
  info: "bg-indigo-100 text-indigo-600",
  warning: "bg-amber-100 text-amber-600",
};

function Icon({ type }: { type: NoticeType }) {
  const className = "w-4 h-4";
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

export default function Notice({
  type = "info",
  title,
  children,
  onClose,
  className = "",
}: NoticeProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm ${styles[type]} ${className}`}
      role="status"
    >
      <div className="flex gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${iconWrap[type]}`}
        >
          <Icon type={type} />
        </div>
        <div className="min-w-0 flex-1">
          {title ? <p className="text-sm font-semibold">{title}</p> : null}
          <div className={`text-sm ${title ? "mt-0.5 opacity-90" : ""}`}>{children}</div>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-current/50 transition hover:bg-white/70 hover:text-current"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
