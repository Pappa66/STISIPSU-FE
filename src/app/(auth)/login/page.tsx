"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import { HiOutlineMail, HiLockClosed, HiEye, HiEyeOff } from "react-icons/hi";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setIsSuccess(false);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await res.json();

      if (res.ok && data.token) {
        login(data.token);
        setMessage("LOGIN BERHASIL! TUNGGU SEBENTAR ...");
        setIsSuccess(true);
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        if (data.message === "Koneksi Database Terputus, Silakan Coba Beberapa Saat Lagi.") {
            setMessage(data.message);
        } else {
            setMessage(data.message || "Login gagal.");
        }
        setIsSuccess(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setMessage("Terjadi kesalahan pada jaringan. Silakan coba lagi.");
      setIsSuccess(false);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row relative">
      {/* FULLSCREEN LOADING SPINNER */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="relative w-24 h-24">
            <div className="w-full h-full rounded-full border-4 border-t-transparent border-white animate-spin" />
            <Image
              src="/logo-stisip-1.png"
              alt="logo"
              width={36}
              height={36}
              className="absolute inset-0 m-auto"
            />
          </div>
        </div>
      )}

      {/* LEFT SIDE IMAGE */}
      <div className="hidden md:flex w-1/2 bg-white items-center justify-center border-r border-red-200">
        <Image
          src="/illustration-login.png"
          alt="Ilustrasi Login"
          width={450}
          height={450}
          priority
        />
      </div>

      {/* RIGHT FORM SECTION */}
      <div className="w-full md:w-1/2 bg-sky-600 flex items-center justify-center px-6 py-12 md:px-12 md:py-12 min-h-screen">
        <div className="w-full max-w-sm text-white space-y-6">
          <div className="text-center">
            <Image
              src="/logo-stisip-1.png"
              alt="Logo STISIP"
              width={100}
              height={100}
              className="mx-auto mb-2"
              priority
            />
            <h2 className="text-lg font-semibold leading-tight">
              Masuk Ke Sistem Repository Internal
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* EMAIL */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <HiOutlineMail className="text-3xl" />
              </span>
              <input
                type="text"
                placeholder="Email Kampus"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md font-semibold border border-white bg-white bg-opacity-30 pl-13 pr-4 py-3 text-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <HiLockClosed className="text-3xl" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Kata Sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md font-semibold border border-white bg-white bg-opacity-30 pl-13 pr-10 py-3 text-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {showPassword ? (
                  <HiEyeOff className="text-xl" />
                ) : (
                  <HiEye className="text-xl" />
                )}
              </button>
            </div>

            {/* MESSAGE */}
            {message && (
              <p
                className={`text-sm text-center ${
                  isSuccess ? "text-green-200" : "text-red-200"
                }`}
              >
                {message}
              </p>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white rounded-md py-3 font-semibold transition hover:opacity-90 disabled:bg-gray-500"
            >
              Login
            </button>
          </form>

          {/* BACK TO HOME */}
          <div className="text-center mt-2">
            <button
              onClick={() => router.push("/")}
              className="w-full bg-green-800 text-white rounded-md py-3 font-semibold transition hover:opacity-90"
            >
              ← Kembali ke Beranda
            </button>
          </div>

          {/* FOOTER */}
          <p className="mt-6 text-md text-center leading-relaxed text-white">
            Laman ini digunakan untuk Sivitas Akademika <br />
            STISIP Syamsul Ulum mengelola dokumen <br />
            pada sistem repository internal
          </p>
        </div>
      </div>
    </main>
  );
}

