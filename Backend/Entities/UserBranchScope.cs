namespace Backend.Entities;

/// <summary>
/// ตาราง user_branch_scopes: กำหนดขอบเขตสิทธิ์สาขา (Branch) ที่ผู้ใช้สามารถเข้าถึงได้
/// (Composite Primary Key: UserId + BranchId)
/// </summary>
public class UserBranchScope
{
    // ผู้ใช้งาน (Foreign Key)
    public Guid UserId { get; set; }
    
    // สาขาที่อนุญาตให้เข้าถึง (Foreign Key เช่น สาขา Central World, สาขา Siam Paragon)
    public Guid BranchId { get; set; }

    // Navigation Properties
    public User? User { get; set; }
    public Branch? Branch { get; set; }
}

