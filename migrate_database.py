"""
Database migration script to add 'name' column to cameras table
"""
import sqlite3
import os

DB_PATH = "attendance_system.db"

def migrate_database():
    """Add name column to cameras table and populate with default values"""
    
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found: {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    try:
        # Check if name column already exists
        c.execute("PRAGMA table_info(cameras)")
        columns = [row[1] for row in c.fetchall()]
        
        if 'name' in columns:
            print("✅ Column 'name' already exists in cameras table")
            return
        
        print("🔧 Adding 'name' column to cameras table...")
        
        # Add the name column (SQLite doesn't support ALTER TABLE ADD COLUMN with NOT NULL and no default)
        # So we add it as nullable first
        c.execute("ALTER TABLE cameras ADD COLUMN name TEXT")
        
        # Update existing rows with default names based on camera_id
        c.execute("SELECT camera_id, ip_address FROM cameras")
        existing_cameras = c.fetchall()
        
        for camera_id, ip_address in existing_cameras:
            # Generate a name based on IP or camera_id
            if ip_address.startswith('http'):
                name = f"Camera-{camera_id}-IP"
            elif ip_address.isdigit():
                name = f"Webcam-{ip_address}"
            else:
                name = f"Camera-{camera_id}"
            
            c.execute("UPDATE cameras SET name = ? WHERE camera_id = ?", (name, camera_id))
            print(f"   Updated camera_id={camera_id} with name='{name}'")
        
        conn.commit()
        print("✅ Migration completed successfully!")
        
        # Show updated table
        c.execute("SELECT * FROM cameras")
        cameras = c.fetchall()
        if cameras:
            print("\n📋 Updated cameras table:")
            for cam in cameras:
                print(f"   ID: {cam[0]}, IP: {cam[1]}, Name: {cam[2]}")
        else:
            print("\n📋 No cameras in database yet")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
