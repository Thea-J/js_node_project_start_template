import axios from "axios";

async function createItem(itemData) {
  const API_URL = "https://api.example.com/items";

  try {
    const response = await axios.post(API_URL, itemData, {
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    // ✅ 1. Check HTTP Status Code
    if (response.status !== 201) {
      throw new Error(`Unexpected HTTP Status: ${response.status}`);
    }

    // ✅ 2. Validate Content-Type
    const contentType = response.headers["content-type"];
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Invalid response format (Expected JSON)");
    }

    const data = response.data;

    // ✅ 3. Handle Empty Response
    if (!data || Object.keys(data).length === 0) {
      throw new Error("Empty response received after POST request");
    }

    // ✅ 4. Verify Response Structure
    if (!data.id || typeof data.id !== "number") {
      throw new Error("Invalid response: Missing or incorrect 'id' field");
    }

    console.log("Item successfully created:", data);
    return data;
  } catch (error) {
    // ✅ 5. Handle Rate Limiting (429)
    if (error.response?.status === 429) {
      console.warn("Rate limit exceeded! Retrying after 5 seconds...");
      setTimeout(() => createItem(itemData), 5000);
    }
    // ✅ 6. Handle Client Errors (400 series)
    else if (error.response?.status === 400) {
      console.error("Bad Request: Check your input data", error.response.data);
    }
    // ✅ 7. Handle Server Errors (500 series)
    else if (error.response?.status >= 500) {
      console.error("Server Error! Try again later.", error.response.data);
    }
    // ✅ 8. Handle Network Issues
    else {
      console.error("Network or unexpected error:", error.message);
    }
  }
}
createItem({ name: "New Item", price: 99.99 }); // Example usage
