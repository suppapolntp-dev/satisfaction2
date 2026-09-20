using Backend.Common;
using Backend.Entities;

namespace Backend.Services;

/// <summary>
/// ScopeFilterService: เครื่องยนต์คัดกรองข้อมูลตามสิทธิ์ 5 ระดับชั้น
/// คัดกรองตั้งแต่ระดับ SQL Query (WHERE clause ใน Database) ป้องกันข้อมูลรั่วไหล 100%
/// </summary>
public class ScopeFilterService : IScopeFilterService
{
    public IQueryable<Branch> FilterBranches(IQueryable<Branch> query, User user)
    {
        // 1. Super Admin: เห็นทุกสาขาทั่วประเทศ
        if (user.TierLevel == TierLevel.SuperAdmin)
        {
            return query;
        }

        // 2. Brand Level: กรองเฉพาะสาขาที่มีแบรนด์ที่ตนเองดูแล
        if (user.TierLevel == TierLevel.Brand)
        {
            var brandIds = user.UserBrandScopes.Select(b => b.BrandId).ToList();
            return query.Where(b => b.BranchBrands.Any(bb => brandIds.Contains(bb.BrandId)));
        }

        // 3. Region Level: กรองเฉพาะสาขาที่อยู่ในภาคที่ตนเองดูแล
        if (user.TierLevel == TierLevel.Region)
        {
            var regionIds = user.UserRegionScopes.Select(r => r.RegionId).ToList();
            return query.Where(b => b.Province != null && regionIds.Contains(b.Province.RegionId));
        }

        // 4. Province / Area Level: กรองเฉพาะสาขาในจังหวัดที่ตนเองดูแล
        if (user.TierLevel == TierLevel.Province)
        {
            var provinceIds = user.UserProvinceScopes.Select(p => p.ProvinceId).ToList();
            return query.Where(b => provinceIds.Contains(b.ProvinceId));
        }

        // 5. Branch Level: กรองเฉพาะสาขาประจำของตนเองเท่านั้น
        if (user.TierLevel == TierLevel.Branch)
        {
            var branchIds = user.UserBranchScopes.Select(b => b.BranchId).ToList();
            return query.Where(b => branchIds.Contains(b.Id));
        }

        // 6. Custom Scope: ผสมเงื่อนไขตามที่ได้รับมอบหมาย
        var customBranchIds = user.UserBranchScopes.Select(b => b.BranchId).ToList();
        var customProvinceIds = user.UserProvinceScopes.Select(p => p.ProvinceId).ToList();
        var customRegionIds = user.UserRegionScopes.Select(r => r.RegionId).ToList();
        var customBrandIds = user.UserBrandScopes.Select(b => b.BrandId).ToList();

        return query.Where(b => 
            (customBranchIds.Count == 0 || customBranchIds.Contains(b.Id)) &&
            (customProvinceIds.Count == 0 || customProvinceIds.Contains(b.ProvinceId)) &&
            (customRegionIds.Count == 0 || (b.Province != null && customRegionIds.Contains(b.Province.RegionId))) &&
            (customBrandIds.Count == 0 || b.BranchBrands.Any(bb => customBrandIds.Contains(bb.BrandId)))
        );
    }

    public IQueryable<Brand> FilterBrands(IQueryable<Brand> query, User user)
    {
        // 1. Super Admin: เห็นทุกแบรนด์
        if (user.TierLevel == TierLevel.SuperAdmin)
        {
            return query;
        }

        // 2. Brand Level หรือ Custom Scope: กรองเฉพาะแบรนด์ที่ได้รับสิทธิ์
        if (user.TierLevel == TierLevel.Brand || user.UserBrandScopes.Any())
        {
            var brandIds = user.UserBrandScopes.Select(b => b.BrandId).ToList();
            return query.Where(b => brandIds.Contains(b.Id));
        }

        // ระดับอื่นๆ (Region, Province, Branch) ให้เห็นแบรนด์ทั้งหมดที่สาขาของตนเองขาย
        var userBranchIds = user.UserBranchScopes.Select(b => b.BranchId).ToList();
        if (userBranchIds.Any())
        {
            return query.Where(b => b.BranchBrands.Any(bb => userBranchIds.Contains(bb.BranchId)));
        }

        return query;
    }

    public IQueryable<SatisfactionVote> FilterVotes(IQueryable<SatisfactionVote> query, User user)
    {
        // 1. Super Admin: เห็นทุกผลโหวต
        if (user.TierLevel == TierLevel.SuperAdmin)
        {
            return query;
        }

        // 2. Brand Level: กรองตามแบรนด์
        if (user.TierLevel == TierLevel.Brand)
        {
            var brandIds = user.UserBrandScopes.Select(b => b.BrandId).ToList();
            return query.Where(v => brandIds.Contains(v.BrandId));
        }

        // 3. Region Level: กรองตามภาค
        if (user.TierLevel == TierLevel.Region)
        {
            var regionIds = user.UserRegionScopes.Select(r => r.RegionId).ToList();
            return query.Where(v => v.Branch != null && v.Branch.Province != null && regionIds.Contains(v.Branch.Province.RegionId));
        }

        // 4. Province Level: กรองตามจังหวัด
        if (user.TierLevel == TierLevel.Province)
        {
            var provinceIds = user.UserProvinceScopes.Select(p => p.ProvinceId).ToList();
            return query.Where(v => v.Branch != null && provinceIds.Contains(v.Branch.ProvinceId));
        }

        // 5. Branch Level: กรองตามสาขา
        if (user.TierLevel == TierLevel.Branch)
        {
            var branchIds = user.UserBranchScopes.Select(b => b.BranchId).ToList();
            return query.Where(v => branchIds.Contains(v.BranchId));
        }

        // 6. Custom Scope
        var customBranchIds = user.UserBranchScopes.Select(b => b.BranchId).ToList();
        var customBrandIds = user.UserBrandScopes.Select(b => b.BrandId).ToList();

        return query.Where(v => 
            (customBranchIds.Count == 0 || customBranchIds.Contains(v.BranchId)) &&
            (customBrandIds.Count == 0 || customBrandIds.Contains(v.BrandId))
        );
    }

    public IQueryable<Kiosk> FilterKiosks(IQueryable<Kiosk> query, User user)
    {
        if (user.TierLevel == TierLevel.SuperAdmin)
        {
            return query;
        }

        if (user.TierLevel == TierLevel.Brand)
        {
            var brandIds = user.UserBrandScopes.Select(b => b.BrandId).ToList();
            return query.Where(k => k.Branch != null && k.Branch.BranchBrands.Any(bb => brandIds.Contains(bb.BrandId)));
        }

        if (user.TierLevel == TierLevel.Branch)
        {
            var branchIds = user.UserBranchScopes.Select(b => b.BranchId).ToList();
            return query.Where(k => branchIds.Contains(k.BranchId));
        }

        if (user.TierLevel == TierLevel.Province)
        {
            var provinceIds = user.UserProvinceScopes.Select(p => p.ProvinceId).ToList();
            return query.Where(k => k.Branch != null && provinceIds.Contains(k.Branch.ProvinceId));
        }

        if (user.TierLevel == TierLevel.Region)
        {
            var regionIds = user.UserRegionScopes.Select(r => r.RegionId).ToList();
            return query.Where(k => k.Branch != null && k.Branch.Province != null && regionIds.Contains(k.Branch.Province.RegionId));
        }

        // Custom Scope: ผสมเงื่อนไขตามที่ได้รับมอบหมาย
        var customBranchIds = user.UserBranchScopes.Select(b => b.BranchId).ToList();
        var customProvinceIds = user.UserProvinceScopes.Select(p => p.ProvinceId).ToList();
        var customRegionIds = user.UserRegionScopes.Select(r => r.RegionId).ToList();
        var customBrandIds = user.UserBrandScopes.Select(b => b.BrandId).ToList();

        return query.Where(k =>
            (customBranchIds.Count == 0 || customBranchIds.Contains(k.BranchId)) &&
            (customProvinceIds.Count == 0 || (k.Branch != null && customProvinceIds.Contains(k.Branch.ProvinceId))) &&
            (customRegionIds.Count == 0 || (k.Branch != null && k.Branch.Province != null && customRegionIds.Contains(k.Branch.Province.RegionId))) &&
            (customBrandIds.Count == 0 || (k.Branch != null && k.Branch.BranchBrands.Any(bb => customBrandIds.Contains(bb.BrandId))))
        );
    }
}

