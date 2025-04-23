"use client";
import React from "react";
import Link from "next/link";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-10">
      {/* Top Section */}
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-6">
        {/* About Section */}
        <div>
          <img
            src="/images/LNMIIT_Logo.webp"
            alt="LNMIIT Logo"
            className="w-24 mb-4"
          />
          <p className="text-sm leading-relaxed">
            Welcome to the LNMIIT Alumni Portal. This platform is designed to
            foster connections between alumni and current students, enabling
            collaboration, mentorship, and growth.
          </p>
        </div>

        {/* Website Links */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">On This Website</h4>
          <div className="flex space-x-8">
            {/* First List */}
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-blue-400">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/batch" className="hover:text-blue-400">
                  Batch
                </Link>
              </li>
              <li>
                <Link href="/posts" className="hover:text-blue-400">
                  Posts
                </Link>
              </li>
            </ul>
            {/* Second List */}
            <ul className="space-y-2">
              <li>
                <Link href="/gallery" className="hover:text-blue-400">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-400">
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Important Links */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Important Links</h4>
          <ul className="space-y-2">
            <li>
              <Link
                href="https://lnmiit.ac.in/"
                target="_blank"
                className="hover:text-blue-400 flex items-center"
              >
                LNMIIT Website <OpenInNewIcon className="ml-1 text-sm" />
              </Link>
            </li>
            <li>
              <Link
                href="https://erp.lnmiit.ac.in/mis/"
                target="_blank"
                className="hover:text-blue-400 flex items-center"
              >
                LNMIIT MIS Portal <OpenInNewIcon className="ml-1 text-sm" />
              </Link>
            </li>
            <li>
              <Link
                href="https://www.linkedin.com/school/lnmiitofficial/"
                target="_blank"
                className="hover:text-blue-400 flex items-center"
              >
                LNMIIT LinkedIn Page <OpenInNewIcon className="ml-1 text-sm" />
              </Link>
            </li>
            <li>
              <Link
                href="https://x.com/lnmiit_official/"
                target="_blank"
                className="hover:text-blue-400 flex items-center"
              >
                LNMIIT X Page <OpenInNewIcon className="ml-1 text-sm" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Section */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
          <p className="text-sm mb-2">
            For any technical issues, contact:
          </p>
          <ul className="space-y-2">
            <li>22ucs062@lnmiit.ac.in</li>
            <li>22ucs127@lnmiit.ac.in</li>
            <li>22ucs112@lnmiit.ac.in</li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-700 mt-8 pt-4 text-center">
        <p className="text-sm">
          Copyright © {currentYear} LNMIIT Alumni Portal. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
