import axios from "axios";

async function fetchData(page = 1) {
  const API_URL = `https://api.example.com/data?page=${page}`;

  try {
    const response = await axios.get(API_URL, { timeout: 5000 });

    // ✅ 1. Check HTTP Status Code
    if (response.status !== 200) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    // ✅ 2. Validate Content-Type
    const contentType = response.headers["content-type"];
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Invalid response format (Expected JSON)");
    }

    const data = response.data;

    // ✅ 3. Handle Empty Response
    if (!data || Object.keys(data).length === 0) {
      throw new Error("Empty response received from API");
    }

    // ✅ 4. Verify Response Structure
    if (!Array.isArray(data.items)) {
      throw new Error("Unexpected response structure: 'items' field missing");
    }

    // ✅ 5. Handle Missing or Null Values & Data Type Mismatch
    const validatedItems = data.items.map((item) => ({
      id: typeof item.id === "number" ? item.id : -1, // Default to -1 if ID is missing/invalid
      name: typeof item.name === "string" ? item.name : "Unknown", // Fallback
      price: typeof item.price === "number" ? item.price : 0.0, // Default price
    }));

    console.log("Validated Data:", validatedItems);

    // ✅ 6. Handle Pagination
    if (data.nextPage) {
      console.log("Fetching next page...");
      await fetchData(data.nextPage);
    }

    // Convert object ➡️ Map
    const dataMap = new Map(Object.entries(response.data));
    // iterate over MAp
    for (const [id, item] of dataMap) {
    }
  } catch (error) {
    // ✅ 7. Handle Rate Limiting (429)
    if (error.response?.status === 429) {
      console.warn("Rate limit exceeded! Retrying after 5 seconds...");
      setTimeout(() => fetchData(page), 5000);
    } else {
      console.error("API Error:", error.message);
    }
  }
}
fetchData(); // Call the function
