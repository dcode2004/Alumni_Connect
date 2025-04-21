"use client";
import React from "react";
import Carousel from "nuka-carousel";
import Image from "next/image";
import styles from "./hero.module.css";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

const CarouselComponent = ({ className }) => {
  const defaultControlsConfig = {
    nextButtonText: <NavigateNextIcon />,
    prevButtonText: <ArrowBackIosNewIcon />,
    pagingDotsStyle: {
      margin: "0 5px",
      fill: "#3584FC",
    },
    pagingDotsContainerClassName: `${styles.paging_dot_container}`,
  };

  return (
    <div className={`${className} ${styles.carousel_container}`}>
      <Carousel
        autoplay
        wrapAround
        defaultControlsConfig={defaultControlsConfig}
        autoplayInterval={3000}
        pauseOnHover
        speed={700}
      >
        <Image
          className={`${styles.hero_section_image} hover:scale-105 transition-transform duration-300`}
          src="/images/college_event1.jpg"
          width={580}
          height={300}
          alt="College Event 1"
        />
        <Image
          className={`${styles.hero_section_image} hover:scale-105 transition-transform duration-300`}
          src="/images/college_event2.jpg"
          width={580}
          height={300}
          alt="College Event 2"
        />
        <Image
          className={`${styles.hero_section_image} hover:scale-105 transition-transform duration-300`}
          src="/images/college_event3.jpg"
          width={580}
          height={300}
          alt="College Event 3"
        />
        <Image
          className={`${styles.hero_section_image} hover:scale-105 transition-transform duration-300`}
          src="/images/college_event4.jpg"
          width={580}
          height={300}
          alt="College Event 4"
        />
      </Carousel>
    </div>
  );
};

export default CarouselComponent;