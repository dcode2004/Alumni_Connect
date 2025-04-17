"use client";
import React from "react";
import styles from "./footer.module.css";
import Link from "next/link";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const disableLink = (event) => {
    event.preventDefault();
  };
  return (
    <>
      <div className={styles.footer_section}>
        {/* --------Footer top section ----------- */}
        <div className={styles.footer_top}>
          {/* 1st div */}
          <div className={`${styles.footer_item} ${styles.footer_item1} `}>
            <h4 className={styles.footer_link_heading}>LNMIIT Alumni Portal</h4>
            <p>
              Welcome to LNMIIT Alumni Portal Page. This page is designed in view of
              junior for interacting with seniors. They can also view various
              resources inlcuding notes.
            </p>
          </div>

          {/* 2nd div */}
          <div className={`${styles.footer_item} ${styles.footer_item2} `}>
            <h4 className={styles.footer_link_heading}>On this website</h4>
            <div className={styles.dual_links_box}>
              {/* link -left*/}
              <ul>
                <li>
                  <Link href={"/"}>Home</Link>
                </li>
                <li>
                  <Link href={"/batch"}>Batch</Link>
                </li>
                <li>
                  <Link href={"/notes"}>Notes</Link>
                </li>
                <li>
                  <Link href={"/gallery"}>Gallery</Link>
                </li>
              </ul>
              {/* links - right*/}
              <ul>
                <li>
                  <Link href={"/about"}>About </Link>
                </li>
                <li>
                  <Link
                    target="_blank"
                    href={"https://firebasestorage.googleapis.com/v0/b/mca-community.appspot.com/o/documents%2Fhowto%2Fdocument.pdf?alt=media&token=9bdc2dc2-04c1-4273-8fb9-0479b077b490"}
                  >
                    Docs
                  </Link>
                </li>
                <li>
                  <p
                  // after this link is done remove p & add Link
                    href={"/events"}
                    className={styles.disabled_link_text}
                    onClick={disableLink}
                  >
                    Events
                  </p>
                </li>

              </ul>
            </div>
          </div>
          {/* 2nd div complete */}

          {/* 3rd div */}
          <div className={`${styles.footer_item} ${styles.footer_item3} `}>
            <h4 className={styles.footer_link_heading}>Important Links</h4>
            <ul>
              <li>
                <Link target="_blank" href={"https://lnmiit.ac.in/"}>
                  LNMIIT Website{" "}
                  <OpenInNewIcon className={styles.font_size_inherit} />{" "}
                </Link>
              </li>
              <li>
                <Link target="_blank" href={"https://erp.lnmiit.ac.in/mis/"}>
                  LNMIIT MIS Portal{" "}
                  <OpenInNewIcon className={styles.font_size_inherit} />{" "}
                </Link>
              </li>
              <li>
                <Link
                  target="_blank"
                  href={
                    "https://www.linkedin.com/school/lnmiitofficial/"
                  }
                >
                  LNMIIT LinkedIn Page{" "}
                  <OpenInNewIcon className={styles.font_size_inherit} />
                </Link>
              </li>
              <li>
                <Link
                  target="_blank"
                  href={"https://x.com/lnmiit_official/"}
                >
                  LNMIIT X Page{" "}
                  <OpenInNewIcon className={styles.font_size_inherit} />{" "}
                </Link>
              </li>
            </ul>
          </div>

          {/* 4th div */}
          <div className={`${styles.footer_item} ${styles.footer_item4} `}>
            <h4 className={`${styles.footer_link_heading} !mb-0`}>Contact Us</h4>
            <ul>
              <li>
                <p className={styles.technical_issue_text}>
                  For any technical issues contact below:-
                </p>
              </li>
              <li>
                <p>22ucs062@lnmiit.ac.in</p>
              </li>
              <li>
                <p>22ucs127@lnmiit.ac.in</p>
              </li>
              <li>
                <p>22ucs112@lnmiit.ac.in</p>
              </li>
            </ul>
          </div>
        </div>

        {/* --------Footer bottom section ----------- */}
        {/* <hr style={{backgroundColor:"grey", height:"1px"}} /> */}
        <div className={styles.footer_bottom}>
          <p>
            Copyrights ©{`${currentYear}`} LNMIIT Alumni Portal. All rights reserved.{" "}
          </p>
        </div>
      </div>
    </>
  );
};

export default Footer;
