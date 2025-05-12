const pool = require("../db"); // Assuming your pool configuration is in ./db.js

// async function findPlacesWithinRadius(
//   centerLat,
//   centerLng,
//   radiusMeters,
//   dept
// ) {
//   try {
//     // Create a PostGIS GEOGRAPHY point object for the center point.
//     // ST_MakePoint expects Longitude, Latitude
//     const centerPoint = `ST_SetSRID(ST_MakePoint(${centerLng}, ${centerLat}), 4326)`;

//     // Execute the query using ST_DWithin
//     // ST_DWithin(geometry1, geometry2, distance_in_meters)
//     const result = await pool.query(
//       `SELECT id, name
//        FROM ${dept}
//        WHERE ST_DWithin(location, ${centerPoint}::geography, $1)`,
//       [radiusMeters] // Parameterized query for the radius
//     );

//     // Return the rows found
//     return result.rows;
//   } catch (error) {
//     console.error("Error finding places within radius:", error);
//     throw error; // Re-throw the error to be handled by the caller
//   }
// }
async function findPlacesWithinRadius(
  centerLat,
  centerLng,
  radiusMeters,
  dept // Assuming dept is the table name (e.g., 'police', 'firebrigade')
) {
  try {
    // Create a PostGIS GEOGRAPHY point object for the center point.
    // ST_MakePoint expects Longitude, Latitude
    const centerPoint = `ST_SetSRID(ST_MakePoint(${centerLng}, ${centerLat}), 4326)`;

    // Execute the query using ST_DWithin and order by distance
    // ST_DWithin(geometry1, geometry2, distance_in_meters) filters results
    // ST_Distance(geometry1, geometry2) calculates the distance in meters for GEOGRAPHY type
    const result = await pool.query(
      `SELECT
         id,
         name,
         -- Calculate and return the distance in meters
         ST_Distance(location, ${centerPoint}::geography) AS distance_meters
       FROM ${dept}
       WHERE ST_DWithin(location, ${centerPoint}::geography, $1)
       ORDER BY
         -- Order the results by the calculated distance (closest first)
         ST_Distance(location, ${centerPoint}::geography)`,
      [radiusMeters] // Parameterized query for the radius
    );

    // Return the rows found, now ordered by distance
    return result.rows[0];
  } catch (error) {
    console.error("Error finding places within radius:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

module.exports = {
  findPlacesWithinRadius,
  // ... other exports from db.js if any
};
