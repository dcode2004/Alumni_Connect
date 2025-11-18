/**
 * Helper function to get location information from IP address
 * Uses ip-api.com free service (no API key required)
 * @param {string} ipAddress - The IP address to geolocate
 * @returns {Promise<Object>} Location object with city, state, country
 */
const http = require("http");

const getLocationFromIP = (ipAddress) => {
  return new Promise((resolve) => {
    try {
      // Remove localhost/private IP addresses
      if (
        !ipAddress ||
        ipAddress === "::1" ||
        ipAddress === "127.0.0.1" ||
        ipAddress.startsWith("192.168.") ||
        ipAddress.startsWith("10.") ||
        ipAddress.startsWith("172.") ||
        ipAddress === "unknown"
      ) {
        // For local development, return default values
        resolve({
          city: "Jaipur",
          state: "Rajasthan",
          country: "India",
        });
        return;
      }

      // Use ip-api.com free service (no API key required, 45 requests/minute limit)
      const url = `http://ip-api.com/json/${ipAddress}?fields=status,message,country,regionName,city`;
      
      // Use http module for compatibility
      http
        .get(url, (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            try {
              const jsonData = JSON.parse(data);

              if (jsonData.status === "success") {
                resolve({
                  city: jsonData.city || "",
                  state: jsonData.regionName || "",
                  country: jsonData.country || "",
                });
              } else {
                // Fallback to empty values if API fails
                resolve({
                  city: "",
                  state: "",
                  country: "",
                });
              }
            } catch (parseError) {
              console.error("Error parsing location data:", parseError);
              resolve({
                city: "",
                state: "",
                country: "",
              });
            }
          });
        })
        .on("error", (error) => {
          console.error("Error getting location from IP:", error);
          // Return empty values on error
          resolve({
            city: "",
            state: "",
            country: "",
          });
        });
    } catch (error) {
      console.error("Error in getLocationFromIP:", error);
      // Return empty values on error
      resolve({
        city: "",
        state: "",
        country: "",
      });
    }
  });
};

module.exports = getLocationFromIP;

