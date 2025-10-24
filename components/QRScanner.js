"use client";
import { useRef, forwardRef } from "react";

const QRScanner = forwardRef(({ videoRef }, ref) => {
  return (
    <video
      ref={videoRef}
      style={{ width: "100%", borderRadius: "8px" }}
      muted
      playsInline
      autoPlay
    />
  );
});

export default QRScanner;
