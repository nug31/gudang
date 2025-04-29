import React from "react";
import { Link } from "react-router-dom";
import { Mail, Globe, Linkedin, Phone, Info } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "../icons";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1e2532] text-white relative z-20 shadow-lg mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <img
                src="/images/logo.png"
                alt="Gudang Mitra"
                className="h-10 w-10 bg-white p-1 rounded"
              />
              <span className="ml-2 text-xl font-bold">Gudang Mitra</span>
            </div>
            <p className="text-gray-400 text-sm">
              Gudang Web for efficient
              <br />
              resource tracking and allocation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
              QUICK LINKS
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/request"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  New Request
                </Link>
              </li>
              <li>
                <Link
                  to="/history"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Request History
                </Link>
              </li>
              <li>
                <Link
                  to="/inventory"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Inventory
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact and Follow */}
          <div className="grid grid-cols-1 gap-8">
            {/* Contact */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
                CONTACT
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-400">
                  <Phone className="h-4 w-4 mr-2" />
                  <a
                    href="tel:+6281316052316"
                    className="hover:text-white transition-colors"
                  >
                    +62 8131 6052 316
                  </a>
                </li>
                <li className="flex items-center text-gray-400">
                  <Mail className="h-4 w-4 mr-2" />
                  <a
                    href="mailto:jsnugroho31@gmail.com"
                    className="hover:text-white transition-colors"
                  >
                    jsnugroho31@gmail.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Follow */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
                FOLLOW
              </h3>
              <div className="flex space-x-4">
                <a
                  href="https://www.linkedin.com/in/jsn-nugroho"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://www.instagram.com/j.s_nugroho"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Instagram"
                >
                  <InstagramIcon size={20} />
                </a>
                <a
                  href="https://wa.me/6281316052316"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  title="WhatsApp"
                >
                  <WhatsAppIcon size={20} />
                </a>
                <a
                  href="https://www.smkmitraindustri.sch.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Website"
                >
                  <Globe className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} Gudang Mitra
          </p>
          <div className="flex items-center text-blue-400 text-sm mt-4 md:mt-0">
            <Info className="h-4 w-4 mr-1" />
            <span>Developed by Jsn Nugroho</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
