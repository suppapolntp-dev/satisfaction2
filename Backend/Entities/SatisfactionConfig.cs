namespace Backend.Entities;

/// <summary>
/// ตาราง satisfaction_config: เก็บการตั้งค่าหน้าจอ Kiosk UI (เก็บเป็น JSONB ใน PostgreSQL)
/// เช่น คำถามประเมิน, ข้อความขอบคุณ, สีธีม, ดีเลย์เวลานับถอยหลัง
/// </summary>
public class SatisfactionConfig
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // ข้อมูลการตั้งค่ารูปแบบ JSON (เช่น คำถาม, สีธีม, โลโก้)
    public string Config { get; set; } = "{}";
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // ผู้ที่แก้ไขการตั้งค่าล่าสุด (Foreign Key)
    public Guid? UpdatedBy { get; set; }

    // Navigation Property
    public User? Updater { get; set; }
}

