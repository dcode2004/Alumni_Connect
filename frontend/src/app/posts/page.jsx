"use client";
import React, { useContext, useEffect } from 'react'
import Feed from "@/components/feed/Feed";
import Loading from "@/components/common/Loading";
import ActiveUserAndLoginStatusContext from "@/context/activeUserAndLoginStatus/activeUserAndLoginStatusContext";
import loadingAndAlertContext from '@/context/loadingAndAlert/loadingAndAlertContext';
import { useRouter } from "next/navigation";

const Posts = () => {
  const { loginStatus, activeUser } = useContext(ActiveUserAndLoginStatusContext);
  const { createAlert } = useContext(loadingAndAlertContext);
  const router = useRouter();

  // redirects user if user is not logged in
  useEffect(() => {
    if (loginStatus === false) {
      router.push("/login", undefined, {shallow: true});
      return;
    }
    if (loginStatus === true && activeUser !== null && activeUser.status === 0) {
      // user registered but not verified.
      createAlert("warning", "You can access posts only after your account gets verified!");
      router.push("/", undefined, {shallow: true});
    }
  }, [loginStatus, activeUser]);

  return (
    <>
      {(loginStatus) && (activeUser !== null) && (activeUser.status === 1) ? (
        <section className="page_section">
          <Feed />
        </section>
      ) : (
        <section className="page_section">
          <Loading />
        </section>
      )}
    </>
  );
};

export default Posts; 