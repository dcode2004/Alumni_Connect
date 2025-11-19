"use client";
import React from "react";
import styles from "./hero.module.css";
import Link from "next/link";
import TypeWriter from "../TypeWriter";
import Image from "next/image";

const HeroSectionMain = () => {
  return (
    <>
      <div className={`${styles.hero_main_container} bg-white dark:bg-gray-900 text-black dark:text-white transition-colors duration-300`}>
        <div className={`${styles.container_box} max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center lg:items-start`}>
          {/* Left Section */}
          <div className={`${styles.left_section} flex-1 text-center lg:text-left lg:pr-10`}>
            <h1 className={`${styles.hero_heading} font-extrabold text-4xl lg:text-5xl leading-tight mb-6`}>
              Welcome to LNMIIT <br />
              <span className="text-blue-500 dark:text-blue-400">Alumni Portal</span>
            </h1>
            <p className="text-lg lg:text-xl mb-4 dark:text-gray-200">
              Managed & maintained by <span className="text-blue-500 dark:text-blue-400">LNMIIT</span> students
            </p>
            <TypeWriter />
            <p className={`${styles.hero_text} text-base lg:text-lg mb-8 leading-relaxed dark:text-gray-300`}>
              This platform is designed to keep all LNMIIT students connected in one place. Access semester notes, assignments, and more. Stay connected with seniors, juniors, and classmates.
            </p>
            <div className="flex justify-center lg:justify-start gap-4">
              <Link
                className={`bg-blue-500 text-white px-6 py-3 rounded-full font-semibold text-lg shadow-lg hover:bg-blue-600 transition duration-300`}
                href="/posts"
              >
                Get Started
              </Link>
              <Link
                className="bg-transparent border-2 border-blue-500 text-blue-500 px-6 py-3 rounded-full font-semibold text-lg shadow-lg hover:bg-blue-600 hover:text-white transition duration-300"
                href="/about"
              >
                Learn More
              </Link>
            </div>
          </div>
          {/* Left Section Ends */}

          {/* Right Section */}
          <div className={`${styles.right_section} flex-1 mt-10 lg:mt-0 lg:pl-10`}>
            <div className="relative w-full h-[400px] lg:h-[500px]">
              <Image
                className="rounded-lg object-contain hover:scale-105 transition-transform duration-300"
                src="https://firebasestorage.googleapis.com/v0/b/mca-community.appspot.com/o/images%2Fhomepage-welcome%2Fboy_girl_coding.jpg?alt=media&token=f721236c-1909-4e64-b362-e8c7c1af12ed"
                alt="Welcome to LNMIIT"
                fill
              />
            </div>
          </div>
          {/* Right Section Ends */}
        </div>
      </div>
    </>
  );
};

export default HeroSectionMain;