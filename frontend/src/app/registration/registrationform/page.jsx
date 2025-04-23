"use client";
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "../../../components/common/Loading";
import styles from "../register.module.css";
import {
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  TextField,
} from "@mui/material";
import RegistrationContext from "@/context/registration/registrationContext";
import loadingAndAlertContext from "@/context/loadingAndAlert/loadingAndAlertContext";
import { sortedStates } from "./formSelectOption";

const RegistrationForm = () => {
  const {
    registeringUser,
    setRegisteringUser,
    setUser,
    googleSignUp,
    user,
    registerNewUser,
  } = useContext(RegistrationContext);
  const { setLoading, setAlert, loading } = useContext(loadingAndAlertContext);
  const router = useRouter();

  const [isChecked, setIsChecked] = useState(false);
  const [details, setDetails] = useState({
    batch: "No batch selected",
    email: "",
    password: "",
    fullName: "",
    homeState: "No state selected",
    company: "",
    role: "",
  });

  useEffect(() => {
    if (user === null) {
      router.push("/registration");
    } else {
      setDetails((prev) => ({
        ...prev,
        email: `${user.email}`,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const handleSubmit = (formData) => {
    if (formData.batch === "No batch selected") {
      setAlert({
        alert: true,
        alertType: "warning",
        alertMessage: "Enter your batch",
      });
      return;
    }
    if (formData.fullName === "") {
      setAlert({
        alert: true,
        alertType: "warning",
        alertMessage: "Enter your full name",
      });
      return;
    }
    if (formData.password.length < 5) {
      setAlert({
        alert: true,
        alertType: "warning",
        alertMessage: "Enter a valid password",
      });
      return;
    }
    if (formData.homeState === "No state selected") {
      setAlert({
        alert: true,
        alertType: "warning",
        alertMessage: "Enter home state",
      });
      return;
    }
    if (!isChecked) {
      setAlert({
        alert: true,
        alertType: "warning",
        alertMessage: "Please agree to share your personal information!",
      });
      return;
    }

    setLoading(true);
    const resetDetails = registerNewUser(formData);

    if (resetDetails.resetDetails) {
      setIsChecked(false);
      setDetails({
        batch: "No batch selected",
        email: "",
        password: "",
        fullName: "",
        homeState: "No state selected",
        company: "",
        role: "",
      });
    }
  };

  return (
    <section className={styles.page_section}>
      {user != null ? (
        <>
          {loading && <Loading />}
          <h1 className={styles.register_heading}>Registration Form</h1>
          <p className={styles.register_subheading}>
            Fill in the details below to register
          </p>

          <div className={styles.form_input_container}>
            <TextField
              className={styles.input_field}
              name="batch"
              value={details.batch}
              onChange={handleChange}
              select
              label="Batch"
              variant="filled"
              fullWidth
            >
              <MenuItem value="No batch selected">No batch selected</MenuItem>
              {sortedStates.map((state, index) => (
                <MenuItem key={index} value={state}>
                  {state}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              className={styles.input_field}
              name="email"
              value={details.email}
              label="Email"
              variant="filled"
              fullWidth
              disabled
            />

            <TextField
              className={styles.input_field}
              name="fullName"
              value={details.fullName}
              onChange={handleChange}
              label="Full Name"
              variant="filled"
              fullWidth
            />

            <TextField
              className={styles.input_field}
              name="password"
              value={details.password}
              onChange={handleChange}
              label="Password"
              type="password"
              variant="filled"
              fullWidth
            />

            <TextField
              className={styles.input_field}
              name="homeState"
              value={details.homeState}
              onChange={handleChange}
              select
              label="Home State"
              variant="filled"
              fullWidth
            >
              <MenuItem value="No state selected">No state selected</MenuItem>
              {sortedStates.map((state, index) => (
                <MenuItem key={index} value={state}>
                  {state}
                </MenuItem>
              ))}
            </TextField>
          </div>

          <FormControlLabel
            control={
              <Checkbox
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
            }
            label="I agree!"
          />

          <Button
            onClick={() => handleSubmit(details)}
            variant="contained"
            className={styles.submit_button}
          >
            Register
          </Button>
        </>
      ) : (
        <Loading />
      )}
    </section>
  );
};

export default RegistrationForm;
