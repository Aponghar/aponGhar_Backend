const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log("Connecting to database and fetching room images...");
    const [images] = await pool.query("SELECT * FROM room_images");
    console.log(`Found ${images.length} room image records.`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const img of images) {
      const currentRoomIdVal = img.room_id;
      
      // Check if room_id is an integer (e.g. "14", "25")
      if (/^\d+$/.test(currentRoomIdVal)) {
        const roomDbId = parseInt(currentRoomIdVal, 10);
        
        // Find corresponding room by auto-increment id
        const [rooms] = await pool.query("SELECT room_id FROM room WHERE id = ?", [roomDbId]);
        
        if (rooms.length > 0) {
          const correctAlphanumericRoomId = rooms[0].room_id;
          console.log(`Migrating Image ID ${img.id}: Changing room_id from '${currentRoomIdVal}' to '${correctAlphanumericRoomId}'`);
          
          await pool.query("UPDATE room_images SET room_id = ? WHERE id = ?", [correctAlphanumericRoomId, img.id]);
          updatedCount++;
        } else {
          console.warn(`Warning: Image ID ${img.id} has room_id '${currentRoomIdVal}', but no room with auto-increment ID ${roomDbId} exists!`);
          errorCount++;
        }
      } else {
        console.log(`Skipping Image ID ${img.id}: Already has alphanumeric room_id '${currentRoomIdVal}'`);
        skippedCount++;
      }
    }

    console.log("\n=== Migration Completed ===");
    console.log(`Successfully updated: ${updatedCount} records`);
    console.log(`Skipped (already correct): ${skippedCount} records`);
    console.log(`Failed/Orphaned: ${errorCount} records`);

  } catch (err) {
    console.error("Migration failed with error:", err);
  } finally {
    await pool.end();
  }
}

main();
