namespace Backend.Entities;

/// <summary>
/// คลาสแม่ (Base Class) สำหรับ Entity ทุกตัวที่มี Audit fields พื้นฐาน
/// </summary>
public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public Guid? CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }
}

