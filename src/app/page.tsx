import Link from "next/link";
import { ArrowRight, BookOpen, Users, MapPin } from "lucide-react";
import HeroSection from "@/components/home/HeroSection";

export default function HomePage() {
  return (
    <main className="bg-background text-foreground">
      {/* 1. Menggunakan Hero Section Anda yang sudah ada */}
      <HeroSection />
    </main>
  );
}
