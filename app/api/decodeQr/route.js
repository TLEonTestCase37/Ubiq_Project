// app/api/decodeQr/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import CryptoJS from "crypto-js";

// AES secret key (must match QR generator)
const SECRET_KEY = "MY_SECRET_KEY_123";

export async function POST(req) {
  try {
    const { payload } = await req.json(); // match the frontend key
    if (!payload) {
      return NextResponse.json({ error: "No encoded text provided" }, { status: 400 });
    }

    // Decrypt QR payload using AES
    let qrKey;
    try {
      const bytes = CryptoJS.AES.decrypt(payload, SECRET_KEY);
      qrKey = bytes.toString(CryptoJS.enc.Utf8);
      if (!qrKey) throw new Error("Decryption failed");
    } catch (err) {
      console.error("AES decryption error:", err);
      return NextResponse.json({ error: "Invalid QR code" }, { status: 400 });
    }

    // Query Supabase for the user
    const { data, error } = await supabase
      .from("users")
      .select("name, email, roll_no")
      .eq("qr_key", qrKey)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: data });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
