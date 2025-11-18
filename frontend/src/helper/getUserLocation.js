/**
 * Helper function to get user's current location
 * Uses browser Geolocation API with reverse geocoding fallback
 * @returns {Promise<Object|null>} Location object with lat, lng, city, state, country or null
 */
export const getUserLocation = () => {
  return new Promise((resolve) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by this browser");
      resolve(null);
      return;
    }

    // Get location with timeout
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Try to get city/state/country from reverse geocoding
          // Using a free reverse geocoding service (OpenStreetMap Nominatim)
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
              {
                headers: {
                  "User-Agent": "LNMIIT-Alumni-Portal/1.0", // Required by Nominatim
                },
              }
            );

            if (response.ok) {
              const data = await response.json();
              const address = data.address || {};

              resolve({
                latitude,
                longitude,
                city: address.city || address.town || address.village || address.county || "",
                state: address.state || "",
                country: address.country || "",
              });
            } else {
              // If reverse geocoding fails, return just coordinates
              resolve({
                latitude,
                longitude,
                city: "",
                state: "",
                country: "",
              });
            }
          } catch (geocodeError) {
            // If reverse geocoding fails, return just coordinates
            console.log("Reverse geocoding failed:", geocodeError);
            resolve({
              latitude,
              longitude,
              city: "",
              state: "",
              country: "",
            });
          }
        } catch (error) {
          console.log("Error processing location:", error);
          resolve(null);
        }
      },
      (error) => {
        // User denied permission or error occurred
        console.log("Geolocation error:", error.message);
        resolve(null);
      },
      {
        timeout: 10000, // 10 seconds timeout
        enableHighAccuracy: false, // Use less accurate but faster method
      }
    );
  });
};

