"use client";
import React, { useContext, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import styles from "./page.module.css";
import { Button, TextField } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import Loading from "../../components/common/Loading";
import loadingAndAlertContext from "@/context/loadingAndAlert/loadingAndAlertContext";
import RegistrationContext from "@/context/registration/registrationContext";
import validate from "./validate";

const Login = () => {
  const router = useRouter(); // Initialize useRouter

  // ----- CONTEXT APIS -------
  const { setLoading, createAlert, loading } = useContext(loadingAndAlertContext);
  const { googleSignIn, signInManually } = useContext(RegistrationContext);

  // ---- STATES -----
  const [loginDetails, setLoginDetails] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setLoginDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLoginManually = async () => {
    const isError = validate(loginDetails);
    if (isError.error) {
      createAlert("warning", isError.message);
    } else {
      setLoading(true);
      const isSigned = await signInManually(loginDetails);
      setLoading(false);
      if (isSigned.resetDetails) {
        setLoginDetails({ email: "", password: "" });
        createAlert("success", "Login successful!");
        router.push("/"); // Redirect to the home page
      } else {
        createAlert("error", "Invalid credentials!");
      }
    }
  };

  const handleLoginUsingGoogle = async () => {
    setLoading(true);
    const isSignedIn = await googleSignIn();
    setLoading(false);
    if (isSignedIn) {
      createAlert("success", "Google login successful!");
      router.push("/"); // Redirect to the home page
    } else {
      createAlert("error", "Google login failed!");
    }
  };

  return (
    <>
      <section className={styles.page_section}>
        {/* ---- Loading ----- */}
        {loading && <Loading />}
        <div className={styles.login_main_container}>
          <div className={styles.login_box}>
            <h1 className={styles.login_heading}>Welcome Back!</h1>
            <p className={styles.login_subheading}>
              Login to access your alumni portal
            </p>

            {/* Google Sign-In */}
            <div className={styles.google_signin_box}>
              <Button
                className={styles.google_button}
                onClick={handleLoginUsingGoogle}
              >
                <Image
                  className={styles.google_icon}
                  src={
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAjVBMVEVHcEz////9/f38/Pz////4+fn9/f38/P3v8PH19vb///////87q1n8wAnrSz5HifXqOijsUUMfpUYvfvQwqVhDhvRnm/bg7ur74eDykIrznpj609DI5c/uZUj/78rG2PyzzPKJyJj5zMn/++37xSf81XhqsFCa0KV1v4f0kCGvtTCCyJyXt/hyofZDj9Yia4J9AAAAC3RSTlMAojhxnKGw/RkrfoV/rhcAAAFQSURBVDiNlVPZYoMgENQYRCIgclRNNKlpm/T+/88rl3jmofPEMuPu7LpE0X+wO8RpGh9222wW5wFxtuYntJUsaATzBSCaFV/SBhMryF9dm46xrjn5cMzh8p9KRsuypJSVTgLn/o6stKAa7Gqv9r6/kadMQ/NHX8R1u7f5Dc+aGsK6CbxPYY+dLk9rd12PnYQWz6SjbEJMW03M4Y2Qj2ZjFslg4ZUQcrZXTwMug4nUHDRPXqxAFBpKKfFsovSBwGiCYFFCGKiiEKHEYPLza/T2owpRDSaRa/MmeTXwla4j7AmFQd0kxtIrYKEK9R0G5Uy0HGPM+wrC6i41L+A4avez7kYhuYbO9ess+p8VARv0RuEgue0xB/OFaaX5GEvJsTMTFsYX0ZJ3XQP3rQ8nu7+5tLO1ztZrv3w7YM6DaIUMhCwQbDw9+z4SkKYgQdvsA/wBrYgleUhdXncAAAAASUVORK5CYII="
                  }
                  alt="google icon"
                  width={30}
                  height={30}
                />
                Sign in with Google
              </Button>
            </div>

            <div className={styles.or_divider}>Or</div>

            {/* Manual Login */}
            <div className={styles.manual_login_box}>
              <TextField
                className={styles.input_field}
                name="email"
                label="Email"
                type="email"
                variant="outlined"
                value={loginDetails.email}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                className={styles.input_field}
                name="password"
                label="Password"
                type="password"
                variant="outlined"
                value={loginDetails.password}
                onChange={handleChange}
                fullWidth
              />
              <Button
                className={styles.login_button}
                onClick={handleLoginManually}
              >
                Login
              </Button>
            </div>

            <p className={styles.register_prompt}>
              New user?{" "}
              <Link href="/registration" className={styles.register_link}>
                Register now!
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;