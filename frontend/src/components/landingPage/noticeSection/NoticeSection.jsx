"use client";
import React from "react";
import styles from "./css/NoticeSection.module.css";
import NoticeCard from "./NoticeCard";
import { motion } from "framer-motion";

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

const NoticeSection = () => {
  return (
    <>
      <hr />
      <motion.div
        className="title"
        variants={titleVariants}
        initial="hide"
        whileInView="show"
        whileOut="hide"
      >
        <div className={styles.notice_section}>
          <h1 className={styles.notice_heading}>Notices</h1>
          <div className="flex flex-wrap justify-between gap-4">
            <NoticeCard
              noticeLink={
                "https://lnmiit.ac.in/academics/academic-documents/#pdf-academic-calendar-2025/"
              }
              notice_name={"Academic Calendar"}
            />
            <NoticeCard
              noticeLink={
                "https://lnmiit.ac.in/academics/academic-documents/#pdf-holiday-calendar-2025/"
              }
              notice_name={"Holiday Calendar"}
            />
            <NoticeCard
              noticeLink={"https://placements.lnmiit.ac.in/statistics/"}
              notice_name={"Placement Stats"}
            />
            <NoticeCard
              noticeLink={"https://lnmiit.ac.in/academics/"}
              notice_name={"Academics"}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default NoticeSection;
