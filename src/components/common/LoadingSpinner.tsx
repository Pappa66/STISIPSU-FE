"use client";

import React from "react";
import Image from "next/image";

interface LoadingSpinnerProps {
  fullscreen?: boolean;
  withLogo?: boolean;
}

export default function LoadingSpinner({
  fullscreen = true,
  withLogo = true,
}: LoadingSpinnerProps) {
  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
          : "flex items-center justify-center"
      }
    >
      <div className="relative">
        <div className="h-16 w-16 md:h-20 md:w-20 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
        {withLogo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/logo-stisip-1.png"
              alt="Logo STISIP"
              width={50}
              height={50}
              className="rounded-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
