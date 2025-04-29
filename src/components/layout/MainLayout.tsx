import React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { Footer } from "./Footer";
import { SimpleBackground } from "../ui/SimpleBackground";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* Simple background */}
      <SimpleBackground className="opacity-80" />

      <Header />
      {/* Add padding-top to account for fixed header height */}
      <div className="flex flex-grow relative z-10 pt-16">
        <Sidebar />
        <MobileNav />
        <main className="flex-1 p-6 max-w-7xl mx-auto">{children}</main>
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};
