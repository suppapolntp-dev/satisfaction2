using Microsoft.EntityFrameworkCore;
using Backend.Entities;

namespace Backend.Data;

/// <summary>
/// AppDbContext: ศูนย์กลางการเชื่อมต่อและควบคุมฐานข้อมูล PostgreSQL ด้วย EF Core
/// ทำหน้าที่แมป Entity Models เข้ากับตารางจริง และจัดการ Transaction / SaveChanges
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // 1. Organization & Master Data
    public DbSet<Region> Regions => Set<Region>();
    public DbSet<Province> Provinces => Set<Province>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<BranchBrand> BranchBrands => Set<BranchBrand>();
    public DbSet<Kiosk> Kiosks => Set<Kiosk>();

    // 2. Security, RBAC & Scopes
    public DbSet<SystemModule> SystemModules => Set<SystemModule>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserPermission> UserPermissions => Set<UserPermission>();
    public DbSet<UserSession> UserSessions => Set<UserSession>();
    public DbSet<UserOtp> UserOtps => Set<UserOtp>();
    public DbSet<UserBrandScope> UserBrandScopes => Set<UserBrandScope>();
    public DbSet<UserRegionScope> UserRegionScopes => Set<UserRegionScope>();
    public DbSet<UserProvinceScope> UserProvinceScopes => Set<UserProvinceScope>();
    public DbSet<UserBranchScope> UserBranchScopes => Set<UserBranchScope>();

    // 3. Transactions, Events & System
    public DbSet<SatisfactionVote> SatisfactionVotes => Set<SatisfactionVote>();
    public DbSet<SatisfactionConfig> SatisfactionConfigs => Set<SatisfactionConfig>();
    public DbSet<EventCategory> EventCategories => Set<EventCategory>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<EventTargetBranch> EventTargetBranches => Set<EventTargetBranch>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<AuditDiffDetail> AuditDiffDetails => Set<AuditDiffDetail>();
    public DbSet<ApiServiceHealth> ApiServiceHealths => Set<ApiServiceHealth>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // -------------------------------------------------------------
        // ตั้งชื่อตารางให้ตรงกับ schema.sql (snake_case)
        // -------------------------------------------------------------
        modelBuilder.Entity<Region>().ToTable("regions");
        modelBuilder.Entity<Province>().ToTable("provinces");
        modelBuilder.Entity<Brand>().ToTable("brands");
        modelBuilder.Entity<Branch>().ToTable("branches");
        modelBuilder.Entity<BranchBrand>().ToTable("branch_brands");
        modelBuilder.Entity<Kiosk>().ToTable("kiosks");
        modelBuilder.Entity<SystemModule>().ToTable("system_modules");
        modelBuilder.Entity<Role>().ToTable("roles");
        modelBuilder.Entity<RolePermission>().ToTable("role_permissions");
        modelBuilder.Entity<User>().ToTable("users");
        modelBuilder.Entity<UserPermission>().ToTable("user_permissions");
        modelBuilder.Entity<UserSession>().ToTable("user_sessions");
        modelBuilder.Entity<UserOtp>().ToTable("user_otps");
        modelBuilder.Entity<UserBrandScope>().ToTable("user_brand_scopes");
        modelBuilder.Entity<UserRegionScope>().ToTable("user_region_scopes");
        modelBuilder.Entity<UserProvinceScope>().ToTable("user_province_scopes");
        modelBuilder.Entity<UserBranchScope>().ToTable("user_branch_scopes");
        modelBuilder.Entity<SatisfactionVote>().ToTable("satisfaction_votes");
        modelBuilder.Entity<SatisfactionConfig>().ToTable("satisfaction_config");
        modelBuilder.Entity<EventCategory>().ToTable("event_categories");
        modelBuilder.Entity<Event>().ToTable("events");
        modelBuilder.Entity<EventTargetBranch>().ToTable("event_target_branches");
        modelBuilder.Entity<Notification>().ToTable("notifications");
        modelBuilder.Entity<AuditLog>().ToTable("audit_logs");
        modelBuilder.Entity<AuditDiffDetail>().ToTable("audit_diff_details");
        modelBuilder.Entity<ApiServiceHealth>().ToTable("api_service_health");
        modelBuilder.Entity<SystemSetting>().ToTable("system_settings");

        // -------------------------------------------------------------
        // กำหนด Composite Primary Keys สำหรับตาราง Junction
        // -------------------------------------------------------------
        modelBuilder.Entity<BranchBrand>()
            .HasKey(bb => new { bb.BranchId, bb.BrandId });

        modelBuilder.Entity<RolePermission>()
            .HasKey(rp => new { rp.RoleId, rp.ModuleId });

        modelBuilder.Entity<UserBrandScope>()
            .HasKey(ubs => new { ubs.UserId, ubs.BrandId });

        modelBuilder.Entity<UserRegionScope>()
            .HasKey(urs => new { urs.UserId, urs.RegionId });

        modelBuilder.Entity<UserProvinceScope>()
            .HasKey(ups => new { ups.UserId, ups.ProvinceId });

        modelBuilder.Entity<UserBranchScope>()
            .HasKey(ubs => new { ubs.UserId, ubs.BranchId });

        modelBuilder.Entity<EventTargetBranch>()
            .HasKey(etb => new { etb.EventId, etb.BranchId });

        modelBuilder.Entity<UserPermission>()
            .HasKey(up => up.UserId);

        modelBuilder.Entity<SystemSetting>()
            .HasKey(ss => ss.SettingKey);

        // -------------------------------------------------------------
        // การแปลง Enum ให้เก็บเป็น String หรือ Int ในฐานข้อมูล
        // -------------------------------------------------------------
        modelBuilder.Entity<SatisfactionVote>()
            .Property(v => v.Sentiment)
            .HasConversion<string>();

        modelBuilder.Entity<User>()
            .Property(u => u.TierLevel)
            .HasConversion<string>();

        modelBuilder.Entity<Kiosk>()
            .Property(k => k.Status)
            .HasConversion<string>();
    }

    /// <summary>
    /// ดักจับทุกครั้งที่มีการ Save ข้อมูล เพื่ออัปเดตเวลา UpdatedAt อัตโนมัติในทุก BaseEntity
    /// </summary>
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is BaseEntity && (e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach (var entityEntry in entries)
        {
            var entity = (BaseEntity)entityEntry.Entity;
            entity.UpdatedAt = DateTime.UtcNow;

            if (entityEntry.State == EntityState.Added)
            {
                entity.CreatedAt = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}

