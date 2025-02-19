async function validateAssociations() {
  // API Endpoints
  const GET_ASSOCIATIONS_URL =
    "https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=666460041702842201f1ce59b820";
  const POST_VALIDATION_URL =
    "https://candidate.hubteam.com/candidateTest/v3/problem/result?userKey=666460041702842201f1ce59b820";

  // Role limits
  const MAX_CONTACTS_PER_ROLE = 5;
  const MAX_ROLES_PER_CONTACT = 2;

  // Define validationResult
  //   var validationResult = { validAssociations: [], invalidAssociations: [] };

  try {
    // Fetch existing and new associations
    const response = await axios.get(GET_ASSOCIATIONS_URL);
    const data = response.data;
    const { existingAssociations, newAssociations } = data;

    // Check HTTP Status Code
    if (response.status !== 200) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    // Validate Content-Type
    const contentType = response.headers["content-type"];
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Invalid response format (Expected JSON)");
    }

    // Handle Empty Response
    if (!data || Object.keys(data).length === 0) {
      throw new Error("Empty response received from API");
    }

    // Handle Pagination
    if (data.nextPage) {
      await validateAssociations(data.nextPage);
    }

    const validAssociations = [];
    const invalidAssociations = [];

    // Create Maps to track role counts and contact roles
    const roleCountMap = new Map(); // Map for role counts (companyId => Map(role => count))
    const contactRoleCountMap = new Map(); // Map for contact roles (contactId => Map(companyId => count))

    // Populate the roleCountMap and contactRoleCountMap with existing associations
    existingAssociations.forEach(({ companyId, role, contactId }) => {
      // Update roleCountMap (companyId => role => count)
      if (!roleCountMap.has(companyId)) {
        roleCountMap.set(companyId, new Map());
      }
      const companyRoleMap = roleCountMap.get(companyId);
      companyRoleMap.set(role, (companyRoleMap.get(role) || 0) + 1);

      // Update contactRoleCountMap (contactId => companyId => count)
      if (!contactRoleCountMap.has(contactId)) {
        contactRoleCountMap.set(contactId, new Map());
      }
      const contactCompanyMap = contactRoleCountMap.get(contactId);
      contactCompanyMap.set(
        companyId,
        (contactCompanyMap.get(companyId) || 0) + 1
      );
    });

    // Validate each new association
    newAssociations.forEach(({ companyId, contactId, role }) => {
      // 1. Check if the association already exists
      const alreadyExists = existingAssociations.some(
        (existing) =>
          existing.companyId === companyId &&
          existing.contactId === contactId &&
          existing.role === role
      );

      if (alreadyExists) {
        invalidAssociations.push({
          companyId,
          contactId,
          role,
          failureReason: "ALREADY_EXISTS",
        });
        return; // Skip further checks if it already exists
      }

      // 2. Check if the new association would exceed the limits
      // For a given (companyId, role), check if we exceed the 5 contact limit
      const companyRoleMap = roleCountMap.get(companyId) || new Map();
      const currentRoleCount = companyRoleMap.get(role) || 0;
      if (currentRoleCount + 1 > 5) {
        invalidAssociations.push({
          companyId,
          contactId,
          role,
          failureReason: "WOULD_EXCEED_LIMIT",
        });
        return;
      }

      // For a given (contactId, companyId), check if the contact has more than 2 roles
      const contactCompanyMap = contactRoleCountMap.get(contactId) || new Map();
      const currentContactRoleCount = contactCompanyMap.get(companyId) || 0;
      if (currentContactRoleCount + 1 > 2) {
        invalidAssociations.push({
          companyId,
          contactId,
          role,
          failureReason: "WOULD_EXCEED_LIMIT",
        });
        return;
      }

      // If all checks pass, the association is valid
      validAssociations.push({ companyId, contactId, role });

      // Update the Maps with the new association
      companyRoleMap.set(role, currentRoleCount + 1);
      contactCompanyMap.set(companyId, currentContactRoleCount + 1);
    });

    // Return the result in the correct format
    var validationResult = {
      validAssociations,
      invalidAssociations,
    };
  } catch (getError) {
    // Handle Fetch errors
    if (getError.response?.status === 400) {
      console.error("Get method - Client error:", getError.message);
    } else if (getError.response?.status >= 500) {
      console.error("Get method - Server error: Contact HubSpot");
    } else {
      console.error("Get method - API Error:", getError.message);
    }
  }

  try {
    // Check structure of validationResult
    if (
      !Array.isArray(validationResult.validAssociations) ||
      !Array.isArray(validationResult.invalidAssociations)
    ) {
      throw new Error(
        "Invalid response format: expected arrays for validAssociations and invalidAssociations"
      );
    }
    console.log("validationResult", validationResult); //🚦
    // Send results back via POST request
    const postResponse = await axios.post(
      POST_VALIDATION_URL,
      validationResult,
      {
        headers: { "Content-Type": "application/json" },
        Accept: "application/json",
      }
    );
    console.log("POST Response Status:", postResponse.status); //🚦
  } catch (postError) {
    if (postError.response?.status === 400) {
      console.log("postError", postError.response.data.errorMessage); //🚦
      console.error("Post method - Client error:", postError.message);
    } else if (postError.response?.status >= 500) {
      console.error("Post method - Server error: Contact HubSpot");
    } else {
      console.error("Post method - API Error:", postError.message);
    }
  }
}

// Execute the validation function
// Time and space complexity: O(n+m) where n = Number of new associations and m = Number of existing associations
validateAssociations();
