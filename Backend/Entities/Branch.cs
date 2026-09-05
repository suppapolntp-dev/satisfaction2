namespace Backend.Entities;

/// <summary>
/// ตาราง branches: ข้อมูลสาขาหน้าร้าน (เช่น สาขา Central World, สาขา Siam Paragon)
/// </summary>
public class Branch : BaseEntity
{
    public string BranchCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    
    // สาขานี้ตั้งอยู่ในจังหวัดใด
    public Guid ProvinceId { get; set; }
    
    // จำนวนตู้ Kiosk ในสาขานี้
    public int KioskCount { get; set; } = 0;
    
    public string Status { get; set; } = "Active"; // Active, Inactive
    
    // สำหรับ Soft Delete
    public DateTime? DeletedAt { get; set; }

    // Navigation Properties (ความสัมพันธ์)
    public Province? Province { get; set; } // จังหวัดที่สาขาตั้งอยู่
    
    // แบรนด์ที่เปิดขายในสาขานี้ (รองรับ 1 สาขา มีหลายแบรนด์)
    public ICollection<BranchBrand> BranchBrands { get; set; } = new List<BranchBrand>();
    
    // ตู้ประเมิน Kiosk ทั้งหมดในสาขานี้
    public ICollection<Kiosk> Kiosks { get; set; } = new List<Kiosk>();
    
    // โหวตความพึงพอใจทั้งหมดที่เกิดขึ้นที่สาขานี้
    public ICollection<SatisfactionVote> SatisfactionVotes { get; set; } = new List<SatisfactionVote>();
    
    // สิทธิ์ผู้ใช้ที่ดูแลสาขานี้ (เช่น Branch Staff, Branch Manager)
    public ICollection<UserBranchScope> UserBranchScopes { get; set; } = new List<UserBranchScope>();
    
    // กิจกรรม/แคมเปญที่จัดในสาขานี้
    public ICollection<EventTargetBranch> EventTargetBranches { get; set; } = new List<EventTargetBranch>();
    
    // การแจ้งเตือนที่ส่งถึงสาขานี้
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    // ผู้สร้างและผู้แก้ไข
    public User? Creator { get; set; }
    public User? Updater { get; set; }
}

