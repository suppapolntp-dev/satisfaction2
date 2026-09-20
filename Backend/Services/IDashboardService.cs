using Backend.Common;
using Backend.DTOs.Dashboard;
using Backend.Entities;

namespace Backend.Services;

/// <summary>
/// Interface สัญญาการทำงานของระบบ Dashboard & Analytics
/// </summary>
public interface IDashboardService
{
    // คำนวณภาพรวมคะแนน CSAT และจำนวนโหวตตามสิทธิ์ Scope ของ User
    Task<ApiResponse<DashboardOverviewDto>> GetOverviewAsync(User user, DateTime? startDate = null, DateTime? endDate = null, Guid? brandId = null);
    
    // ดึงข้อมูลแนวโน้มกราฟ (รายชั่วโมง / รายวัน / รายเดือน)
    Task<ApiResponse<List<TrendChartDto>>> GetTrendChartAsync(User user, string interval = "daily", DateTime? startDate = null, DateTime? endDate = null, Guid? brandId = null);
    
    // ดึงข้อมูลตาราง Grid แต่ละระดับ (Brand, Region, Province, Branch, Kiosk)
    Task<ApiResponse<List<TierGridRowDto>>> GetTierGridAsync(User user, string tierType, DateTime? startDate = null, DateTime? endDate = null, Guid? brandId = null);
    
    // ดึงผลโหวตล่าสุดแบบ Realtime Feed (เช่น 20 รายการล่าสุด)
    Task<ApiResponse<List<LiveVoteFeedDto>>> GetLiveVotesAsync(User user, int limit = 20, Guid? brandId = null);
}

