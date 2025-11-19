"use client";
import React from "react";
import ActiveUserAndLoginStatusContext from "@/context/activeUserAndLoginStatus/activeUserAndLoginStatusContext";
import { useContext, useState, useEffect } from "react";
import batchContext from "@/context/batch/batchContext";
import { useRouter } from "next/navigation";
import Loading from "@/components/common/Loading";
import StudentCard from "./StudentCard";
import styles from "./page.module.css"
import sortStudentInRoll from "./sortStudentsInNames";
import PageNotFound from "@/components/common/PageNotFound"
import loadingAndAlertContext from '@/context/loadingAndAlert/loadingAndAlertContext';
import { TextField, MenuItem, Select, FormControl, InputLabel, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Page = ({ params }) => {
  const router = useRouter();
  // const paramBatchNum = params.batchNum; // page route number
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;


  // ----  CONTEXT APIS -----
  const { loginStatus, activeUser, fetchActiveUser } = useContext(
    ActiveUserAndLoginStatusContext
  );
  const { batches, fetchAllBatch } = useContext(batchContext);
  const {createAlert} = useContext(loadingAndAlertContext);

  // ---- STATES -------
  const [isPageExist, setIsPageExist] = useState(null);
  const [students, setStudents] = useState(null);
  const [batchRoute, setBatchRoute] = useState(params.batchNum);
  const [batchId, setBatchId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("name");
  const [filteredStudents, setFilteredStudents] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (batches != null) {
      for (let i = 0; i < batches.length; i++) {
        if (batches[i].batchNum.toString() === batchRoute) {
          setIsPageExist(true);
          setBatchId(batches[i]._id);
          break;
        } else if (i === batches.length - 1) {
          setIsPageExist(false);
        }
      }
    }

  })


  useEffect(() => {
    fetchActiveUser(); // use to every page to check user login status
    fetchAllBatch();
    if (loginStatus === false) {
      router.push("/login");
    }

    if (loginStatus === true && activeUser !== null && activeUser.status === 0 ) {
      // user registered but not verified.
      createAlert("warning", "You can access students page only after your account get verified!");
      router.push("/" , undefined, {shallow: true});
    }
  }, []);

  const getBatchStudents = async () => {
    const token = localStorage.getItem("token");
    const url = `${baseUrl}/api/batch/${batchId}/fetchStudents`; // fetch students by their batch Id
    if (isPageExist && token) {
      // ----- fetchAPi ----
      const fetchStudents = await fetch(url, {
        method: "GET",
        headers: {
          token,
        },
      });
      const response = await fetchStudents.json();
      if (response.success) {
        setStudents(sortStudentInRoll(response.students));
      }
    } else {
      fetchActiveUser();
    }
  };

  useEffect(() => {
    getBatchStudents();
  }, [isPageExist]);

  // Filter students based on search term and filter type
  useEffect(() => {
    if (!students) return;
    
    const filtered = students.filter(student => {
      const searchLower = searchTerm.toLowerCase();
      
      switch (filterType) {
        case "name":
          return student.userDetails.name.toLowerCase().includes(searchLower);
        case "company":
          return student.jobDetails.company.toLowerCase().includes(searchLower);
        case "role":
          return student.jobDetails.role.toLowerCase().includes(searchLower);
        case "field":
          return student.fieldOfInterest.toLowerCase().includes(searchLower);
        case "state":
          return student.userDetails.homeState.toLowerCase().includes(searchLower);
        case "location":
          // Filter by current location (city, state, or country)
          const currentLocation = student.lastLogin?.location;
          if (!currentLocation) return false;
          const locationString = `${currentLocation.city || ""} ${currentLocation.state || ""} ${currentLocation.country || ""}`.toLowerCase();
          return locationString.includes(searchLower);
        default:
          return true;
      }
    });
    
    setFilteredStudents(filtered);
  }, [searchTerm, filterType, students]);

  return (
    <>
      {loginStatus ? (
        <section className="page_section">
          {/* {isPageExist === false && <h1>Page not found</h1>} */}
          {isPageExist === false && <PageNotFound />}
          {isPageExist && (
            <div className={styles.students_container_box} >
              {/* --- BATCH STUDENTS CONTAINER ---- */}
              <h1 className={`${styles.batch_student_heading} dark:text-white transition-colors duration-300`} >{`${batchRoute} batch students`}</h1>
              
              {/* Search and Filter Section */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
                <FormControl className="min-w-[200px]">
                  <InputLabel>Filter By</InputLabel>
                  <Select
                    value={filterType}
                    label="Filter By"
                    onChange={(e) => setFilterType(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="company">Company</MenuItem>
                    <MenuItem value="role">Role</MenuItem>
                    <MenuItem value="field">Field of Interest</MenuItem>
                    <MenuItem value="state">Home State</MenuItem>
                    <MenuItem value="location">Current Location</MenuItem>
                  </Select>
                </FormControl>
                
                <Box className="flex-grow relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <TextField
                    placeholder={`Search by ${filterType}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    size="small"
                    InputProps={{
                      sx: { paddingLeft: '40px' }
                    }}
                  />
                </Box>
                
                {searchTerm && (
                  <div className="text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap transition-colors duration-300">
                    Found: {filteredStudents?.length || 0} students
                  </div>
                )}
              </div>

              {students != null && students.length === 0 && <h1 className="text-lg dark:text-white transition-colors duration-300" >No students registered yet</h1>}
              <div className={styles.only_students_box} >
                {students != null ?
                  (filteredStudents || students).map((student, index) => {
                    return (
                      <StudentCard student={student} cardType="student" key={index} />
                    )
                  })
                  :
                  <>
                    {Array.from({ length: 10 }, (_, index) => (
                      <div key={index}>
                        <StudentCard cardType="skeleton" />
                      </div>
                    ))}
                  </>
                }
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="page_section">
          <Loading />
        </section>
      )}
    </>
  );
};

export default Page;
