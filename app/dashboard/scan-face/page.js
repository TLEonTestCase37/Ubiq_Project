"use client";
import { useRef, useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import { supabase } from "@/lib/supabaseClient";

export default function FaceChecker() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [loadingModels, setLoadingModels] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [matchedUser, setMatchedUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      setLoadingModels(false);
    };
    loadModels();
  }, []);

  // Load users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("name, email, roll_no, face_vector");
      if (error) console.error("Failed to fetch users:", error);
      else setAllUsers(data);
    };
    fetchUsers();
  }, []);

  // Start camera
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

  const computeDistance = (emb1, emb2) => {
    let sum = 0;
    for (let i = 0; i < emb1.length; i++) {
      const diff = emb1[i] - emb2[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  };

  const detectAndMatch = async (imageSource) => {
    setProcessing(true);
    setMessage("");
    setMatchedUser(null);

    try {
      const detection = await faceapi
        .detectSingleFace(imageSource, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setMessage("❌ No face detected.");
        setProcessing(false);
        return;
      }

      const embedding = Array.from(detection.descriptor);
      let bestMatch = null;
      let minDistance = Infinity;

      allUsers.forEach((user) => {
        if (!user.face_vector) return;
        const distance = computeDistance(embedding, user.face_vector);
        if (distance < minDistance) {
          minDistance = distance;
          bestMatch = user;
        }
      });

      if (minDistance < 0.6 && bestMatch) {
        setMatchedUser(bestMatch);
        setMessage("✅ Match found!");
      } else {
        setMessage("❌ No matching user found.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error during detection.");
    }

    setProcessing(false);
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    await detectAndMatch(canvas);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = await faceapi.bufferToImage(file);
    await detectAndMatch(img);
  };

  if (loadingModels)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-700 font-sans text-white">
        <p className="text-lg font-semibold animate-pulse">Loading face models...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 w-full max-w-md text-white border border-white/20 animate-fadeIn">
        <h1 className="text-3xl font-bold mb-6 text-center font-mono drop-shadow-lg">
          🔍 Face Checker
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
            onClick={handleCapture}
            disabled={processing}
            className={`w-full py-3 rounded-2xl font-semibold text-white shadow-lg transition-all duration-200 ${
              processing ? "bg-gray-400 cursor-not-allowed" : "bg-pink-500 hover:bg-pink-600 hover:scale-105"
            }`}
          >
            {processing ? "Processing..." : "Scan from Camera"}
          </button>

          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="w-full py-3 rounded-2xl bg-white/10 border border-white/20 text-white text-sm text-center cursor-pointer transition-all duration-200 hover:bg-white/20"
          />
        </div>

        {matchedUser && (
          <div className="mt-4 text-center text-green-200 font-medium text-lg font-mono animate-pulse space-y-1">
            <p>✅ Name: {matchedUser.name}</p>
            <p>📧 Email: {matchedUser.email}</p>
            <p>🎓 Roll No: {matchedUser.roll_no}</p>
          </div>
        )}

        {message && <p className="mt-3 text-center font-medium">{message}</p>}
      </div>
 </div>
  );
}
