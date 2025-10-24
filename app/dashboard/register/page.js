"use client";
import { useRef, useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import { supabase } from "@/lib/supabaseClient";
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY;
export default function FaceRegister() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [loadingModels, setLoadingModels] = useState(true);
  const [processingCapture, setProcessingCapture] = useState(false);
  const [processingRegister, setProcessingRegister] = useState(false);
  const [embedding, setEmbedding] = useState(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", email: "", roll_no: "" });
  const [encryptedPayload, setEncryptedPayload] = useState("");

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      setLoadingModels(false);
    };
    loadModels();
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.warn("Camera not available:", err);
      }
    };
    startCamera();
  }, []);

  const captureEmbedding = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setProcessingCapture(true);
    setMessage("");

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const detection = await faceapi
        .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setMessage("❌ No face detected. Try again.");
        setProcessingCapture(false);
        return;
      }

      setEmbedding(Array.from(detection.descriptor));
      setMessage("✅ Face captured! Fill the form to register.");
    } catch (err) {
      console.error(err);
      setMessage("❌ Face detection failed.");
    }

    setProcessingCapture(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProcessingCapture(true);
    setMessage("");

    try {
      const img = await faceapi.bufferToImage(file);

      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setMessage("❌ No face detected in uploaded image.");
        setProcessingCapture(false);
        return;
      }

      setEmbedding(Array.from(detection.descriptor));
      setMessage("✅ Face detected! Fill the form to register.");
    } catch (err) {
      console.error(err);
      setMessage("❌ Face detection failed.");
    }

    setProcessingCapture(false);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const generateRandomString = (length = 24) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let r = "";
    for (let i = 0; i < length; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
    return r;
  };

  const handleRegister = async () => {
    if (!embedding || !form.name || !form.email || !form.roll_no) {
      setMessage("❌ Fill all fields and capture face.");
      return;
    }

    setProcessingRegister(true);
    setMessage("");

    const plainKey = generateRandomString();

    try {
      const { error } = await supabase.from("users").insert([
        {
          ...form,
          face_vector: embedding,
          qr_key: plainKey,
        },
      ]);

      if (error) throw error;

      const encrypted = CryptoJS.AES.encrypt(plainKey, SECRET_KEY).toString();
      setEncryptedPayload(encrypted);
      setMessage("✅ Registered successfully! Use the encrypted text below for the QR.");

      setForm({ name: "", email: "", roll_no: "" });
      setEmbedding(null);
    } catch (err) {
      console.error(err);
      setMessage("❌ Registration failed.");
    }

    setProcessingRegister(false);
  };

  if (loadingModels)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white font-sans">
        <p className="text-lg font-semibold animate-pulse">Loading face models...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 w-full max-w-md text-white border border-white/20 animate-fadeIn">
        <h1 className="text-3xl font-bold mb-5 text-center font-mono drop-shadow-lg">
          🎯 Face Registration
        </h1>

        <video
          ref={videoRef}
          autoPlay
          width={400}
          height={300}
          className="rounded-xl shadow-lg border-2 border-white/20 mx-auto mb-4 transition-transform duration-200 hover:scale-105"
        />
        <canvas ref={canvasRef} className="hidden" />

        <div className="flex flex-col gap-3">
          <button
            onClick={captureEmbedding}
            disabled={processingCapture}
            className={`w-full py-3 rounded-2xl font-semibold text-white shadow-lg transition-all duration-200 ${processingCapture ? "bg-gray-400 cursor-not-allowed" : "bg-pink-500 hover:bg-pink-600 hover:scale-105"
              }`}
          >
            {processingCapture ? "Processing..." : "Capture Face from Camera"}
          </button>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="w-full py-3 rounded-2xl bg-white/10 border border-white/20 text-white text-sm text-center cursor-pointer transition-all duration-200 hover:bg-white/20"
          />
        </div>

        {embedding && (
          <div className="mt-5 space-y-3 animate-fadeIn">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
            />
            <input
              type="text"
              name="roll_no"
              placeholder="Roll Number"
              value={form.roll_no}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
            />
            <button
              onClick={handleRegister}
              disabled={processingRegister}
              className={`w-full py-3 mt-2 rounded-2xl font-semibold transition-all duration-200 ${processingRegister ? "bg-gray-400 cursor-not-allowed text-white" : "bg-green-500 hover:bg-green-600 hover:scale-105 text-white"
                }`}
            >
              {processingRegister ? "Registering..." : "Register & Generate QR Key"}
            </button>
          </div>
        )}

        {encryptedPayload && (
          <div className="mt-5 bg-white/10 p-4 rounded-xl border border-white/20 break-words animate-fadeIn">
            <strong>Encrypted QR Key:</strong>
            <code className="block mt-1 text-xs">{encryptedPayload}</code>
          </div>
        )}

        {message && <p className="mt-3 text-center font-medium">{message}</p>}
      </div>


    </div>
  );
}
