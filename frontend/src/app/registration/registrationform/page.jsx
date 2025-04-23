"use client";
// eslint-disable-next-line react/no-unescaped-entities
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "../../../components/common/Loading";
import styles from "./css/page.module.css";
import {
  Avatar,
  Button,
  Checkbox,
  FilledInput,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  sortedStates,
  fieldOfInterest,
  bachelorCourses,
  assignedTag,
} from "./formSelectOption";
import UserTypeForm from "./UserTypeForm";
import validateFormData from "./verifyFormData";
import RegistrationContext from "@/context/registration/registrationContext";
import loadingAndAlertContext from "@/context/loadingAndAlert/loadingAndAlertContext";
import Alert from "@/components/common/Alert";
import batchStates from "@/context/batch/batchContext";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const RegistrationForm = () => {
  const {
    registeringUser,
    setRegisteringUser,
    setUser,
    googleSignUp,
    user,
    registerNewUser,
  } = useContext(RegistrationContext);
  const { setLoading, setAlert, loading, alert } = useContext(
    loadingAndAlertContext
  );
  const { batchLists } = useContext(batchStates);
  // console.log(batchLists);
  // registeringUser = 42 or 41
  // user = allDetails of user --> user.email is email id of user
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const [isChecked, setIsChecked] = useState(false);
  const [details, setDetails] = useState({
    batch: "No batch selected",
    email: "",
    password: "",
    fullName: "",
    homeState: "No state selected",
    company: "",
    role: ""
  });

  //user will automatically redirect if not done previous two step
  useEffect(() => {
    if (user === null) {
      router.push("/registration");
    } else {
      setDetails((prev) => {
        return { ...prev, email: `${user.email}` };
      });
    }
  }, [user]);

  // handle onchange to modify form data
  const handleChange = (e) => {
    setDetails((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  //handle checkbox
  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  // handle submit
  const handleSubmit = (formData) => {
    // First validate basic required fields
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

    // Only validate job details if not latest batch
    const selectedBatch = batchLists?.find(b => b.batchNum === parseInt(formData.batch));
    const isLatestBatch = selectedBatch?.isLatest;

    if (!isLatestBatch && formData.company === "") {
      setAlert({
        alert: true,
        alertType: "warning",
        alertMessage: "Enter your company name",
      });
      return;
    }
    if (!isLatestBatch && formData.role === "") {
      setAlert({
        alert: true,
        alertType: "warning",
        alertMessage: "Enter your role in company",
      });
      return;
    }

    // If checkbox not checked
    if (!isChecked) {
      setAlert({
        alert: true,
        alertType: "warning",
        alertMessage: "Please Agree to share you personal information!",
      });
      return;
    }

    // All validations passed, proceed with registration
    setLoading(true);
    const resetDetails = registerNewUser(formData);

    if (resetDetails.resetDetails) {
      // set all to default values
      setIsChecked(false);
      setDetails(details);
    }
  };

  return (
    <>
      <section className="page_section">
        {user != null ? (
          <>
            {/* ---- Loading -----  */}
            {loading && <Loading />}

            <div className={styles.registration_main_container}>
              {/* top heading of form */}
              <div className={styles.register_top_container}>
                <h5 className="text-sky-500 text-lg font-semibold">
                  Registration form.
                </h5>
              </div>

              {/* actual form inputs */}
              <div className={styles.form_input_container}>
                {/* Box 1 */}
                <div className={`${styles.input_box} ${styles.input_box1}`}>
                  {/* ---BATCH--- */}
                  <TextField
                    className={styles.input_field}
                    name="batch"
                    value={details.batch}
                    style={{ margin: "0.5rem" }}
                    onChange={handleChange}
                    select
                    label="Batch"
                    variant="filled"
                    fullWidth
                  >
                    <MenuItem
                      style={{ zIndex: "1001" }}
                      value={"No batch selected"}
                    >
                      No batch selected
                    </MenuItem>
                    {batchLists != null &&
                      batchLists.reverse().map((batch, index) => (
                        <MenuItem
                          style={{ zIndex: "1001" }}
                          key={index}
                          value={batch.batchNum}
                        >
                          {batch.batchNum}
                        </MenuItem>
                      ))}
                  </TextField>

                  {/* ---EMAIL---- */}
                  <TextField
                    style={{ margin: "0.5rem" }}
                    className={styles.input_field}
                    name="email"
                    onChange={handleChange}
                    required
                    fullWidth
                    label="Email"
                    value={details.email}
                    variant="filled"
                    placeholder="ex: rollno@lnmiit.ac.in"
                    disabled
                  />
                  {/* ---- Full name ---- */}
                  <TextField
                    className={styles.input_field}
                    style={{ margin: "0.5rem" }}
                    name="fullName"
                    value={details.fullName}
                    onChange={handleChange}
                    required
                    fullWidth
                    label="Full name"
                    variant="filled"
                    placeholder="Your name"
                  />
                  {/* ---PASSWORD---- */}
                  <FormControl
                    sx={{ m: 1, width: "25ch", width: "100%" }}
                    className={styles.input_field}
                    variant="filled"
                  >
                    <InputLabel htmlFor="filled-adornment-password">
                      Password
                    </InputLabel>
                    <FilledInput
                      id="filled-adornment-password"
                      type={showPassword ? "text" : "password"}
                      fullWidth
                      value={details.password}
                      name="password"
                      onChange={handleChange}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </FormControl>

                  {/* --- Home state --- */}
                  <TextField
                    className={styles.input_field}
                    style={{ margin: "0.5rem" }}
                    name="homeState"
                    value={details.homeState}
                    onChange={handleChange}
                    required
                    fullWidth
                    select
                    label="Home state"
                    variant="filled"
                    helperText="To know classmates from same town"
                  >
                    <MenuItem
                      style={{ zIndex: "1001" }}
                      value="No state selected"
                    >
                      No state selected
                    </MenuItem>
                    {sortedStates.map((state, index) => (
                      <MenuItem
                        style={{ zIndex: "1001" }}
                        key={index}
                        value={state}
                      >
                        {state}
                      </MenuItem>
                    ))}
                    <MenuItem style={{ zIndex: "1001" }} value="outer state">
                      Outer state
                    </MenuItem>
                  </TextField>

                  {/* --- Company --- */}
                  <TextField
                    className={styles.input_field}
                    style={{ margin: "0.5rem" }}
                    name="company"
                    value={details.company}
                    onChange={handleChange}
                    fullWidth
                    label="Company"
                    variant="filled"
                    placeholder="Your company name"
                    disabled={details.batch === "No batch selected" || batchLists?.find(b => b.batchNum === details.batch)?.isLatest}
                    required={!batchLists?.find(b => b.batchNum === details.batch)?.isLatest}
                  />

                  {/* --- Role --- */}
                  <TextField
                    className={styles.input_field}
                    style={{ margin: "0.5rem" }}
                    name="role"
                    value={details.role}
                    onChange={handleChange}
                    fullWidth
                    label="Role"
                    variant="filled"
                    placeholder="Your role in company"
                    disabled={details.batch === "No batch selected" || batchLists?.find(b => b.batchNum === details.batch)?.isLatest}
                    required={!batchLists?.find(b => b.batchNum === details.batch)?.isLatest}
                  />
                </div>
              </div>

              {/* actual form inputs ends */}
              <div style={{ margin: "0.5rem" }}>
                <FormControlLabel
                  required
                  control={
                    <Checkbox
                      checked={isChecked}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="I agree!"
                />
                <Typography>
                  I am aware that I am registering to the LNMIIT community
                  website which is completely managed by only LNMIIT students. It
                  is not linked to LNMIIT College or CSE department officially.
                </Typography>
                <br />
                <Button
                  onClick={() => {
                    handleSubmit(details);
                  }}
                  className={styles.submit_button}
                  variant="contained"
                  component="label"
                  style={{
                    backgroundColor: "green",
                    width: "200px",
                    height: "3rem",
                  }}
                >
                  Register
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Loading />
        )}
      </section>
    </>
  );
};

export default RegistrationForm;