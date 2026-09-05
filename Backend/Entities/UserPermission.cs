namespace Backend.Entities;

/// <summary>
/// ตาราง user_permissions: ควบคุมสิทธิ์การเปิดดูหน้าจอ Dashboard & Grids 5 ระดับ (1-to-1 กับ User)
/// </summary>
public class UserPermission
{
    // Primary Key และ Foreign Key ชี้ไปที่ User.Id เดียวกัน (1:1 Relationship)
    public Guid UserId { get; set; }

    // สิทธิ์การเปิดดูระดับที่ 1: ภาพรวมองค์กร Super Admin Overview
    public bool CanViewSuperAdminOverview { get; set; } = false;

    // สิทธิ์การเปิดดูระดับที่ 2: ตารางเปรียบเทียบแบรนด์กับภาค (Brand -> Regional Grid)
    public bool CanViewBrandRegionalGrid { get; set; } = false;

    // สิทธิ์การเปิดดูระดับที่ 3: ตารางเปรียบเทียบภาคกับจังหวัด (Regional -> Province Grid)
    public bool CanViewRegionalProvinceGrid { get; set; } = false;

    // สิทธิ์การเปิดดูระดับที่ 4: ตารางเปรียบเทียบจังหวัดกับสาขา (Provincial -> Branch Grid)
    public bool CanViewProvincialBranchGrid { get; set; } = false;

    // สิทธิ์การเปิดดูระดับที่ 5: ตารางคะแนนและสถานะตู้ Kiosk ในสาขา (Branch -> Kiosks Grid)
    public bool CanViewBranchKiosksGrid { get; set; } = false;

    // Navigation Property
    public User? User { get; set; }
}

