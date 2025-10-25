"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import QrScanner from "qr-scanner";

export default function QRPage() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const router = useRouter();

  const [scannedText, setScannedText] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    if (uploadMode) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [uploadMode]);

  const decodeAndFetchUser = async (payload) => {
    setLoading(true);
    try {
      const res = await fetch("/api/decodeQr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
      });
      const data = await res.json();
      if (data.user) setUserData(data.user);
      else setUserData(null);
    } catch {
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const scanFrame = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const cropX = video.videoWidth * 0.2;
    const cropY = video.videoHeight * 0.2;
    const cropWidth = video.videoWidth * 0.6;
    const cropHeight = video.videoHeight * 0.6;

    canvas.width = cropWidth;
    canvas.height = cropHeight;
    ctx.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    try {
      const result = await QrScanner.scanImage(canvas, { returnDetailedScanResult: true });
      setScannedText(result.data);
      await decodeAndFetchUser(result.data);
    } catch {
      setScannedText("No QR code detected in scan area");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
      setScannedText(result.data);
      await decodeAndFetchUser(result.data);
    } catch {
      setScannedText("No QR code detected in uploaded image");
    }
  };

  const handleAccept = () => {
    setUserData(null);
    setScannedText("");
    setStatusMsg("✅ Data accepted and reset!");
    setTimeout(() => setStatusMsg(""), 3000);
  };

  const handleFaceScan = () => {
    router.push("/dashboard/scan-face");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 font-sans">
      <h1 className="text-3xl font-bold text-center text-white mb-6 drop-shadow-lg">
        🎯 QR Verification Portal
      </h1>

      {/* Toggle Mode */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setUploadMode(false)}
          className={`px-5 py-2 rounded-lg font-semibold transition ${
            !uploadMode ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-600 text-white"
          }`}
        >
          📷 Scan with Camera
        </button>
        <button
          onClick={() => setUploadMode(true)}
          className={`px-5 py-2 rounded-lg font-semibold transition ${
            uploadMode ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-gray-600 text-white"
          }`}
        >
          🖼️ Upload QR Image
        </button>
      </div>

      {/* Camera Mode */}
      {!uploadMode && (
        <div className="relative w-full max-w-md mb-4">
          <video
            ref={videoRef}
            className="w-full rounded-lg shadow-lg border-2 border-white/20"
            muted
            playsInline
            autoPlay
          />
          <div className="absolute top-1/5 left-1/5 w-3/5 h-3/5 border-2 border-dashed border-white pointer-events-none rounded-lg" />
          <button
            onClick={scanFrame}
            className="mt-3 w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg shadow-md hover:bg-yellow-500 transition"
          >
            {loading ? "Decoding..." : "🔍 Scan QR Now"}
          </button>
        </div>
      )}

      {/* Upload Mode */}
      {uploadMode && (
        <div className="flex justify-center w-full max-w-md mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full py-2 px-3 rounded-lg cursor-pointer bg-white text-black hover:bg-gray-100 transition"
          />
        </div>
      )}

      {/* Scan Results */}
      {scannedText && (
        <div className="w-full max-w-md bg-white p-4 rounded-lg text-black mb-4 shadow-md break-words">
          <p>
            <strong>Scanned QR Text:</strong> {scannedText}
          </p>
        </div>
      )}

      {/* User Info */}
      {userData && (
        <div className="w-full max-w-md bg-green-500 p-4 rounded-lg text-white mb-4 shadow-md">
          <h3 className="text-lg font-semibold mb-2">✅ User Found</h3>
          <p><strong>Name:</strong> {userData.name}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Roll No:</strong> {userData.roll_no}</p>

          <div className="flex justify-between gap-2 mt-4">
            <button
              onClick={handleAccept}
              className="flex-1 bg-gray-800 py-2 rounded-lg hover:bg-gray-900 transition"
            >
              ✅ Accept
            </button>
            <button
              onClick={handleFaceScan}
              className="flex-1 bg-pink-500 py-2 rounded-lg hover:bg-pink-600 transition"
            >
              🔍 Scan Face
            </button>
          </div>
        </div>
      )}

      {statusMsg && <p className="text-yellow-300 mt-3">{statusMsg}</p>}
    </div>
  );
}
