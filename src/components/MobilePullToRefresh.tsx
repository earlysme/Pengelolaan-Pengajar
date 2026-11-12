"use client";

import { useEffect, useState, useRef } from "react";

export default function MobilePullToRefresh() {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const startYRef = useRef(0);
  const pullingRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);

  const THRESHOLD = 65; // Jarak tarikan (px) untuk memicu refresh

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Deteksi apakah perangkat menggunakan layar sentuh / mobile
    const checkTouch = () => {
      return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches
      );
    };

    if (!checkTouch()) return;
    setIsTouchDevice(true);

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY <= 2 && !isRefreshingRef.current) {
        startYRef.current = e.touches[0].clientY;
        pullingRef.current = true;
      } else {
        pullingRef.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pullingRef.current || isRefreshingRef.current) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startYRef.current;

      // Hanya proses jika pengguna menarik ke bawah saat di paling atas
      if (deltaY > 0 && window.scrollY <= 0) {
        // Efek redaman (damping) fisika ala iOS/Threads
        const damped = Math.min(Math.pow(deltaY, 0.85) * 1.5, 95);
        pullDistanceRef.current = damped;
        setPullDistance(damped);
      } else {
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (!pullingRef.current || isRefreshingRef.current) return;
      pullingRef.current = false;

      if (pullDistanceRef.current >= THRESHOLD) {
        // Trigger refresh
        isRefreshingRef.current = true;
        setIsRefreshing(true);
        setPullDistance(55); // Tahan posisi indikator selama proses reload

        // Trigger reload web seperti pull-to-refresh native
        setTimeout(() => {
          window.location.reload();
        }, 600);
      } else {
        // Lepas kembali jika belum mencapai batas threshold
        setPullDistance(0);
        pullDistanceRef.current = 0;
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, []);

  if (!isTouchDevice || (pullDistance === 0 && !isRefreshing)) {
    return null;
  }

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const strokeDashoffset = 100 - progress * 100;
  const rotationDeg = isRefreshing ? 0 : pullDistance * 4.5;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none flex justify-center items-start transition-transform ease-out"
      style={{
        transform: `translateY(${pullDistance > 0 ? pullDistance : 0}px)`,
        transitionDuration: pullingRef.current ? "0ms" : "320ms",
      }}
    >
      <div className="relative -top-12 flex items-center justify-center w-12 h-12 rounded-full bg-white/95 backdrop-blur-md shadow-[0_6px_20px_rgba(23,63,58,0.18)] border border-[#173F3A]/15 transition-all">
        {/* Lingkaran progress putaran SVG (ala Threads) */}
        <svg
          className={`absolute inset-0 w-full h-full p-1.5 -rotate-90 ${
            isRefreshing ? "animate-spin" : ""
          }`}
          viewBox="0 0 36 36"
        >
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="#173F3A"
            strokeOpacity={isRefreshing ? "0.15" : "0.1"}
            strokeWidth="2.5"
          />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="#173F3A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="100"
            strokeDashoffset={isRefreshing ? "30" : strokeDashoffset}
            className="transition-all duration-75"
          />
        </svg>

        {/* Logo Gen Plasma yang berputar halus seiring tarikan jari */}
        <div
          className={`relative z-10 flex items-center justify-center ${
            isRefreshing ? "animate-pulse" : ""
          }`}
          style={{
            transform: `rotate(${rotationDeg}deg) scale(${0.7 + progress * 0.3})`,
            transition: pullingRef.current ? "none" : "transform 0.25s ease-out",
          }}
        >
          <img
            src="/logo.svg"
            alt="Refreshing..."
            className="w-5 h-5 object-contain select-none pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}
