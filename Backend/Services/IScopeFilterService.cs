using Backend.Entities;

namespace Backend.Services;

/// <summary>
/// Interface สัญญาการทำงานของ 5-Tier Data Access Scope Filter
/// ทำหน้าที่คัดกรองข้อมูลในระดับ Database Query (IQueryable) ตามสิทธิ์ของผู้ใช้
/// </summary>
public interface IScopeFilterService
{
    // คัดกรองรายการสาขาตามสิทธิ์ 5 ระดับ
    IQueryable<Branch> FilterBranches(IQueryable<Branch> query, User user);
    
    // คัดกรองรายการแบรนด์ตามสิทธิ์ 5 ระดับ
    IQueryable<Brand> FilterBrands(IQueryable<Brand> query, User user);
    
    // คัดกรองผลคะแนนโหวตความพึงพอใจตามสิทธิ์ 5 ระดับ
    IQueryable<SatisfactionVote> FilterVotes(IQueryable<SatisfactionVote> query, User user);
    
    // คัดกรองตู้ Kiosk ตามสิทธิ์ 5 ระดับ
    IQueryable<Kiosk> FilterKiosks(IQueryable<Kiosk> query, User user);
}

