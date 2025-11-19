"use client";
import React from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Define the variants for the title animation
const titleVariants = {
  hide: {
    y: 100,
    opacity: 0,
  },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
    },
  },
};

const MemoriesSection = () => {
  // Sample images for the carousel
  const images = [
    "/images/img1.jpg",
    "/images/img2.jpg",
    "/images/img3.jpg",
    "/images/img4.jpg",
  ];

  // Slick carousel settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1, // Default to 1 image
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  };

  return (
    <section className="relative text-white py-10 px-5 md:px-10 lg:px-20">
      <hr />
      <br />
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-20 h-20 bg-purple-400 rounded-full blur-2xl opacity-30"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-400 rounded-full blur-3xl opacity-30"></div>

      <div className="relative z-10 text-black dark:text-white">
        <h1 className="text-3xl md:text-4xl text-center mb-5 dark:text-white">
          Cherished Memories
        </h1>
        <motion.div
          className="title"
          variants={titleVariants}
          initial="hide"
          whileInView="show"
          whileOut="hide"
        >
          <div className="w-full flex justify-center items-center relative">
            <Slider {...settings} className="w-full max-w-4xl">
              {images.map((image, index) => (
                <div key={index} className="p-2">
                  <img
                    src={image}
                    alt={`Memory ${index + 1}`}
                    className="w-full h-[300px] sm:h-[250px] md:h-[300px] lg:h-[350px] xl:h-[400px] object-cover rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
                  />
                </div>
              ))}
            </Slider>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MemoriesSection;