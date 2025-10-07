import { dfsLocations, dfsSerpEndpoints } from "@/lib/dataforseo";

// Test DataForSEO connection
export async function testDataForSEOConnection() {
  console.log("Testing DataForSEO connection...");
  
  try {
    // Test 1: Get locations (free endpoint)
    console.log("Testing locations endpoint...");
    const locations = await dfsLocations();
    console.log("✅ Locations test passed:", locations.status_code);
    
    // Test 2: Get SERP endpoints (free endpoint)
    console.log("Testing SERP endpoints...");
    const endpoints = await dfsSerpEndpoints();
    console.log("✅ SERP endpoints test passed:", endpoints.status_code);
    
    return {
      success: true,
      message: "DataForSEO connection successful!",
      tests: [
        { name: "Locations", status: locations.status_code },
        { name: "SERP Endpoints", status: endpoints.status_code }
      ]
    };
    
  } catch (error: any) {
    console.error("❌ DataForSEO connection failed:", error);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
}

// Usage example:
// testDataForSEOConnection().then(result => console.log(result));
