namespace Backend.Entities;

/// <summary>
/// ตาราง branch_brands: ตารางเชื่อม (Junction Table) ระหว่าง Branch กับ Brand
/// เพื่อรองรับโมเดล Dual-Brand / Co-Location (เช่น 1 สาขามีทั้ง Mister Donut และ Arigato)
/// </summary>
public class BranchBrand
{
    // Composite Primary Key (BranchId + BrandId)
    public Guid BranchId { get; set; }
    public Guid BrandId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public Branch? Branch { get; set; }
    public Brand? Brand { get; set; }
}

