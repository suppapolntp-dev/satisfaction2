using Microsoft.EntityFrameworkCore;
using Backend.Common;
using Backend.Entities;

namespace Backend.Data.Seeds;

/// <summary>
/// DbInitializer: หยอดข้อมูลเริ่มต้น (Seed Data) ลงใน Database เมื่อเริ่มระบบครั้งแรก
/// </summary>
public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // สร้างตารางใน Database อัตโนมัติถ้ายังไม่มี
        await context.Database.EnsureCreatedAsync();

        // 1. หยอด System Modules (ทั้ง 9 เมนูหลัก และฟังก์ชันย่อยแบบ Tree Hierarchy)
        var moduleDefinitions = new List<(string Code, string Label, string? Description, short Order, List<(string Code, string Label, string? Description, short Order)> Children)>
        {
            ("DASHBOARD", "dashboard (แดชบอร์ดและการวิเคราะห์)", "แดชบอร์ดแสดงผลรวมและแนวโน้ม CSAT", 1, new()
            {
                ("DASHBOARD_FILTER", "filter", "ตัวกรองข้อมูลและช่วงเวลา", 1),
                ("DASHBOARD_TIMELINE", "Sentiment Score Timeline", "กราฟแนวโน้มความพึงพอใจตามไทม์ไลน์", 2),
                ("DASHBOARD_ANALYSES", "Analyses tabpill", "แท็บเจาะลึกสถิติและการวิเคราะห์", 3),
            }),
            ("SATISFACTION", "satisfaction (ผลโหวตความพึงพอใจ)", "ข้อมูลคะแนนความพึงพอใจและการประเมินลูกค้า", 2, new()
            {
                ("SATISFACTION_FEED", "Live Vote Ingestion Feed", "ฟีดข้อมูลผลโหวตแบบเรียลไทม์", 1),
                ("SATISFACTION_BREAKDOWN", "Branch CSAT Breakdown", "รายงานคะแนนแยกตามสาขา", 2),
                ("SATISFACTION_COMMENTS", "Customer Feedback & Voice", "ความคิดเห็นและข้อเสนอแนะลูกค้า", 3),
            }),
            ("ORGANIZATION", "brands (จัดการแบรนด์และสาขา)", "บริหารจัดการแบรนด์ สาขา และตู้ประเมิน", 3, new()
            {
                ("BRANDS_CATALOG", "Brand Catalog & Info", "จัดการข้อมูลแบรนด์ในเครือ", 1),
                ("BRANDS_BRANCHES", "Branch Outlets Directory", "จัดการข้อมูลสาขาและพิกัด", 2),
                ("BRANDS_KIOSKS", "Kiosk Touchscreen Binding", "ผูกและควบคุมเครื่องคีออสหน้าร้าน", 3),
            }),
            ("USERS", "users (จัดการผู้ใช้งาน)", "รายชื่อผู้ใช้งานและกำหนดสิทธิ์ผู้ใช้", 4, new()
            {
                ("USERS_DIRECTORY", "User Accounts Directory", "รายชื่อบัญชีผู้ใช้งานระบบ", 1),
                ("USERS_SCOPE", "5-Tier Scope Hierarchy Access", "การจัดสรรขอบเขตข้อมูลรายบุคคล", 2),
                ("USERS_SECURITY", "MFA & Password Security", "รีเซ็ตรหัสผ่านและตั้งค่าความปลอดภัย", 3),
            }),
            ("ROLES", "roles (จัดการบทบาทและสิทธิ์)", "กำหนดและจัดการบทบาทผู้ใช้งานในระบบ", 5, new()
            {
                ("ROLES_LIST", "System Roles Directory", "กำหนดและจัดการบทบาทผู้ใช้งาน", 1),
                ("ROLES_MATRIX", "Granular Permission Matrix", "กำหนดสิทธิ์ระดับฟังก์ชัน (Tree Access)", 2),
            }),
            ("DATA_ACCESS", "data_access (จัดการขอบเขตข้อมูล Scope)", "ขอบเขตการเข้าถึงข้อมูลตามลำดับขั้น 5 ระดับ", 6, new()
            {
                ("DATA_ACCESS_SCOPES", "User Scope Assignments", "มอบหมายและจัดการขอบเขตข้อมูล 5 ระดับ", 1),
                ("DATA_ACCESS_PERMISSIONS", "Tier Grid Matrix", "สิทธิ์การมองเห็นแดชบอร์ดรายระดับ", 2),
            }),
            ("EVENTS", "event (ปฏิทินกิจกรรมและแคมเปญ)", "ปฏิทินกิจกรรม แคมเปญการตลาด และการตรวจสอบสาขา", 7, new()
            {
                ("EVENTS_CALENDAR_VIEW", "calendar view", "มุมมองปฏิทินตารางกิจกรรม", 1),
                ("EVENTS_CAMPAIGNS", "Events & Campaigns", "จัดการกิจกรรม แคมเปญ และโปรโมชั่น", 2),
            }),
            ("AUDIT", "audit (ประวัติการทำงาน Audit Logs)", "บันทึกประวัติการเปลี่ยนแปลงและการเข้าสู่ระบบ", 8, new()
            {
                ("AUDIT_AUTH_LOGS", "Authentication & Login Logs", "บันทึกการเข้าสู่ระบบและ SMS OTP", 1),
                ("AUDIT_ACTIVITY", "Operation Change Trail", "ประวัติการแก้ไขข้อมูลสำคัญในระบบ", 2),
            }),
            ("SETTINGS", "settings (ตั้งค่าระบบ)", "ตั้งค่าความปลอดภัยและเกณฑ์มาตรฐาน CSAT", 9, new()
            {
                ("SETTINGS_SECURITY", "Security & SMS OTP Rules", "นโยบายความปลอดภัยและ Session", 1),
                ("SETTINGS_BENCHMARKS", "CSAT Benchmark Thresholds", "เกณฑ์คะแนนชี้วัดความพึงพอใจ", 2),
            }),
        };

        foreach (var def in moduleDefinitions)
        {
            var parent = await context.SystemModules.FirstOrDefaultAsync(m => m.ModuleCode == def.Code);
            if (parent == null)
            {
                parent = new SystemModule
                {
                    ModuleCode = def.Code,
                    ModuleLabel = def.Label,
                    Description = def.Description,
                    DisplayOrder = def.Order,
                    ParentId = null
                };
                await context.SystemModules.AddAsync(parent);
                await context.SaveChangesAsync();
            }
            else
            {
                parent.ModuleLabel = def.Label;
                parent.Description = def.Description;
                parent.DisplayOrder = def.Order;
                parent.ParentId = null;
                await context.SaveChangesAsync();
            }

            foreach (var childDef in def.Children)
            {
                var child = await context.SystemModules.FirstOrDefaultAsync(m => m.ModuleCode == childDef.Code);
                if (child == null)
                {
                    child = new SystemModule
                    {
                        ModuleCode = childDef.Code,
                        ModuleLabel = childDef.Label,
                        Description = childDef.Description,
                        DisplayOrder = childDef.Order,
                        ParentId = parent.Id
                    };
                    await context.SystemModules.AddAsync(child);
                }
                else
                {
                    child.ModuleLabel = childDef.Label;
                    child.Description = childDef.Description;
                    child.DisplayOrder = childDef.Order;
                    child.ParentId = parent.Id;
                }
            }
            await context.SaveChangesAsync();
        }

        // 2. หยอด Roles เริ่มต้น
        var rolesToEnsure = new List<(string Code, string Name, string Desc)>
        {
            ("SUPER_ADMIN", "Super Admin (ผู้ดูแลระบบสูงสุด)", "เข้าถึงได้ทุกข้อมูลและจัดการได้ทุกโมดูลในระบบ"),
            ("BRAND_MANAGER", "Brand Manager (ผู้บริหารแบรนด์)", "ดูแลและวิเคราะห์ข้อมูลเฉพาะแบรนด์ที่ได้รับมอบหมาย"),
            ("REGIONAL_MANAGER", "Regional Manager (ผู้จัดการภาค)", "ดูแลและวิเคราะห์ข้อมูลสาขาในเขตภาคที่รับผิดชอบ"),
            ("AREA_MANAGER", "Area Manager (ผู้จัดการเขต)", "ดูแลสาขาและตู้ Kiosk ในจังหวัด/พื้นที่รับผิดชอบ"),
            ("BRANCH_STAFF", "Branch Staff (พนักงานประจำสาขา)", "ดูผลคะแนนและจัดการตู้ Kiosk ประจำสาขาของตนเอง")
        };

        var seededRoles = new List<Role>();
        foreach (var r in rolesToEnsure)
        {
            var existingRole = await context.Roles.FirstOrDefaultAsync(ro => ro.RoleCode == r.Code);
            if (existingRole == null)
            {
                existingRole = new Role
                {
                    RoleCode = r.Code,
                    RoleName = r.Name,
                    RoleDescription = r.Desc,
                    RoleStatus = "Active",
                    IsSystemDefault = true
                };
                await context.Roles.AddAsync(existingRole);
                await context.SaveChangesAsync();
            }
            seededRoles.Add(existingRole);
        }

        // หยอด RolePermissions สำหรับทุก Role และทุกโมดูล
        var allSystemModules = await context.SystemModules.ToListAsync();
        foreach (var role in seededRoles)
        {
            var existingPerms = await context.RolePermissions.Where(rp => rp.RoleId == role.Id).ToListAsync();
            foreach (var mod in allSystemModules)
            {
                if (existingPerms.Any(rp => rp.ModuleId == mod.Id)) continue;

                bool isSuperAdmin = role.RoleCode == "SUPER_ADMIN";
                bool isBrandManager = role.RoleCode == "BRAND_MANAGER";
                bool isRegionalOrArea = role.RoleCode == "REGIONAL_MANAGER" || role.RoleCode == "AREA_MANAGER";
                bool isStaff = role.RoleCode == "BRANCH_STAFF";

                bool canView = false;
                bool canCreate = false;
                bool canUpdate = false;
                bool canDelete = false;
                bool canExport = false;

                if (isSuperAdmin)
                {
                    canView = canCreate = canUpdate = canDelete = canExport = true;
                }
                else if (isBrandManager)
                {
                    bool isSettingsOrRoles = mod.ModuleCode.StartsWith("SETTINGS") || mod.ModuleCode.StartsWith("ROLES");
                    canView = true;
                    canCreate = !isSettingsOrRoles;
                    canUpdate = !isSettingsOrRoles;
                    canDelete = mod.ModuleCode == "EVENTS_CAMPAIGNS";
                    canExport = true;
                }
                else if (isRegionalOrArea)
                {
                    bool isSystemMgmt = mod.ModuleCode.StartsWith("SETTINGS") || mod.ModuleCode.StartsWith("ROLES") || mod.ModuleCode.StartsWith("DATA_ACCESS");
                    canView = !isSystemMgmt;
                    canCreate = false;
                    canUpdate = false;
                    canDelete = false;
                    canExport = canView;
                }
                else if (isStaff)
                {
                    bool isSatisfaction = mod.ModuleCode.StartsWith("SATISFACTION");
                    canView = isSatisfaction;
                    canCreate = isSatisfaction;
                }

                await context.RolePermissions.AddAsync(new RolePermission
                {
                    RoleId = role.Id,
                    ModuleId = mod.Id,
                    CanView = canView,
                    CanCreate = canCreate,
                    CanUpdate = canUpdate,
                    CanDelete = canDelete,
                    CanExport = canExport
                });
            }
            await context.SaveChangesAsync();
        }

        // 3. หยอดผู้ใช้ Super Admin คนแรก
        if (!await context.Users.AnyAsync())
        {
            var superAdminRole = await context.Roles.FirstAsync(r => r.RoleCode == "SUPER_ADMIN");
            
            // เข้ารหัส Password: "Admin@123456" ด้วย BCrypt
            var passwordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123456");

            var adminUser = new User
            {
                UserCode = "SA-001",
                FirstName = "System",
                LastName = "Administrator",
                Email = "admin@satisfaction.local",
                Phone = "0812345678",
                PasswordHash = passwordHash,
                RoleId = superAdminRole.Id,
                TierLevel = TierLevel.SuperAdmin,
                Status = "Active",
                IsMfaEnabled = false
            };

            await context.Users.AddAsync(adminUser);
            await context.SaveChangesAsync();

            // กำหนดสิทธิ์ Dashboard 5 ระดับให้ Super Admin มองเห็นได้ทั้งหมด
            await context.UserPermissions.AddAsync(new UserPermission
            {
                UserId = adminUser.Id,
                CanViewSuperAdminOverview = true,
                CanViewBrandRegionalGrid = true,
                CanViewRegionalProvinceGrid = true,
                CanViewProvincialBranchGrid = true,
                CanViewBranchKiosksGrid = true
            });
            await context.SaveChangesAsync();
        }

        // 4. หยอดโครงสร้างภูมิศาสตร์เริ่มต้น (Regions & Provinces)
        if (!await context.Regions.AnyAsync())
        {
            var centralRegion = new Region { Name = "ภาคกลาง", DisplayOrder = 1 };
            var northRegion = new Region { Name = "ภาคเหนือ", DisplayOrder = 2 };
            var southRegion = new Region { Name = "ภาคใต้", DisplayOrder = 3 };
            var northeastRegion = new Region { Name = "ภาคตะวันออกเฉียงเหนือ", DisplayOrder = 4 };
            var eastRegion = new Region { Name = "ภาคตะวันออก", DisplayOrder = 5 };

            await context.Regions.AddRangeAsync(centralRegion, northRegion, southRegion, northeastRegion, eastRegion);
            await context.SaveChangesAsync();

            // หยอดจังหวัดตัวอย่าง
            await context.Provinces.AddRangeAsync(
                new Province { RegionId = centralRegion.Id, Name = "กรุงเทพมหานคร" },
                new Province { RegionId = centralRegion.Id, Name = "นนทบุรี" },
                new Province { RegionId = northRegion.Id, Name = "เชียงใหม่" },
                new Province { RegionId = northRegion.Id, Name = "เชียงราย" },
                new Province { RegionId = southRegion.Id, Name = "ภูเก็ต" },
                new Province { RegionId = southRegion.Id, Name = "สุราษฎร์ธานี" },
                new Province { RegionId = northeastRegion.Id, Name = "ขอนแก่น" },
                new Province { RegionId = northeastRegion.Id, Name = "นครราชสีมา" },
                new Province { RegionId = eastRegion.Id, Name = "ชลบุรี" }
            );
            await context.SaveChangesAsync();
        }

        // 5. หยอดแบรนด์เริ่มต้น (Brands)
        if (!await context.Brands.AnyAsync())
        {
            await context.Brands.AddRangeAsync(
                new Brand
                {
                    BrandCode = "MISTER_DONUT",
                    BrandName = "Mister Donut",
                    Category = "Bakery & Sweets",
                    BrandIconName = "donut_large",
                    BrandLogoUrl = "/images/brands/mister-donut.svg",
                    ParentCompanyName = "Enterprise Group"
                },
                new Brand
                {
                    BrandCode = "KFC",
                    BrandName = "KFC",
                    Category = "Quick Service Restaurant",
                    BrandIconName = "restaurant",
                    BrandLogoUrl = "/images/brands/kfc.svg",
                    ParentCompanyName = "Enterprise Group"
                },
                new Brand
                {
                    BrandCode = "OOTOYA",
                    BrandName = "Ootoya",
                    Category = "Japanese Casual Dining",
                    BrandIconName = "ramen_dining",
                    BrandLogoUrl = "/images/brands/ootoya.svg",
                    ParentCompanyName = "Enterprise Group"
                },
                new Brand
                {
                    BrandCode = "PEPPER_LUNCH",
                    BrandName = "Pepper Lunch",
                    Category = "Japanese Fast Casual",
                    BrandIconName = "dinner_dining",
                    BrandLogoUrl = "/images/brands/pepper-lunch.svg",
                    ParentCompanyName = "Enterprise Group"
                },
                new Brand
                {
                    BrandCode = "AUNTIE_ANNES",
                    BrandName = "Auntie Anne's",
                    Category = "Pretzel & Bakery",
                    BrandIconName = "bakery_dining",
                    BrandLogoUrl = "/images/brands/auntie-annes.svg",
                    ParentCompanyName = "Enterprise Group"
                },
                new Brand
                {
                    BrandCode = "ARIGATO",
                    BrandName = "Arigato",
                    Category = "Coffee & Beverage",
                    BrandIconName = "local_cafe",
                    BrandLogoUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMAyJ2wGea0fdN47kjswpn2Y7F1hmfItxNkdbPfEYC1Y2QhWztiVwMptRb&s=10",
                    ParentCompanyName = "Enterprise Group"
                }
            );
            await context.SaveChangesAsync();
        }

        // 6. หยอด System Settings เริ่มต้น
        if (!await context.SystemSettings.AnyAsync())
        {
            await context.SystemSettings.AddRangeAsync(
                new SystemSetting
                {
                    SettingKey = AppConstants.SettingKeys.JwtExpiryDays,
                    SettingValue = "{\"days\": 1}"
                },
                new SystemSetting
                {
                    SettingKey = AppConstants.SettingKeys.OtpExpiryMinutes,
                    SettingValue = "{\"minutes\": 3}"
                },
                new SystemSetting
                {
                    SettingKey = AppConstants.SettingKeys.OtpCooldownSeconds,
                    SettingValue = "{\"seconds\": 60}"
                },
                new SystemSetting
                {
                    SettingKey = AppConstants.SettingKeys.SystemName,
                    SettingValue = "{\"name\": \"Enterprise CSAT Management Platform\"}"
                }
            );
            await context.SaveChangesAsync();
        }

        // 7. หยอดสาขาตัวอย่าง 5 สาขาต่อทุกแบรนด์ (รวม 30 สาขา) และตู้ Kiosk ประจำสาขา
        if (!await context.Branches.AnyAsync())
        {
            var bkk = await context.Provinces.FirstAsync(p => p.Name == "กรุงเทพมหานคร");
            var nonthaburi = await context.Provinces.FirstAsync(p => p.Name == "นนทบุรี");
            var chiangmai = await context.Provinces.FirstAsync(p => p.Name == "เชียงใหม่");
            var phuket = await context.Provinces.FirstAsync(p => p.Name == "ภูเก็ต");
            var chonburi = await context.Provinces.FirstAsync(p => p.Name == "ชลบุรี");
            var khonkaen = await context.Provinces.FirstAsync(p => p.Name == "ขอนแก่น");

            var allBrands = await context.Brands.ToListAsync();
            var kfc = allBrands.First(b => b.BrandCode == "KFC");
            var donut = allBrands.First(b => b.BrandCode == "MISTER_DONUT");
            var ootoya = allBrands.First(b => b.BrandCode == "OOTOYA");
            var pepper = allBrands.First(b => b.BrandCode == "PEPPER_LUNCH");
            var anne = allBrands.First(b => b.BrandCode == "AUNTIE_ANNES");
            var arigato = allBrands.First(b => b.BrandCode == "ARIGATO");

            var branchesToSeed = new List<(string Code, string Name, Guid ProvId, int Kiosks, List<Brand> Brands)>
            {
                // KFC (5 Branches)
                ("KFC-BKK-01", "KFC สาขา สยามพารากอน", bkk.Id, 3, new List<Brand> { kfc }),
                ("KFC-BKK-02", "KFC สาขา เซ็นทรัล ลาดพร้าว", bkk.Id, 4, new List<Brand> { kfc }),
                ("KFC-CNX-01", "KFC สาขา เซ็นทรัล เชียงใหม่", chiangmai.Id, 3, new List<Brand> { kfc }),
                ("KFC-HKT-01", "KFC สาขา เซ็นทรัล ภูเก็ต ฟลอเรสต้า", phuket.Id, 2, new List<Brand> { kfc }),
                ("KFC-CBI-01", "KFC สาขา เซ็นทรัล พัทยา บีช", chonburi.Id, 3, new List<Brand> { kfc }),

                // Mister Donut (5 Branches) - สาขาฟิวเจอร์พาร์คเป็น Co-Location ร่วมกับ Arigato
                ("MDO-BKK-01", "Mister Donut สาขา เซ็นทรัลเวิลด์", bkk.Id, 2, new List<Brand> { donut }),
                ("MDO-NON-01", "Mister Donut & Arigato สาขา ฟิวเจอร์พาร์ค รังสิต", nonthaburi.Id, 4, new List<Brand> { donut, arigato }),
                ("MDO-CNX-01", "Mister Donut สาขา เซ็นทรัล แอร์พอร์ต เชียงใหม่", chiangmai.Id, 2, new List<Brand> { donut }),
                ("MDO-KKN-01", "Mister Donut สาขา เซ็นทรัล ขอนแก่น", khonkaen.Id, 2, new List<Brand> { donut }),
                ("MDO-CBI-01", "Mister Donut สาขา เซ็นทรัล ชลบุรี", chonburi.Id, 2, new List<Brand> { donut }),

                // Ootoya (5 Branches)
                ("OOT-BKK-01", "Ootoya สาขา เอ็มควอเทียร์", bkk.Id, 3, new List<Brand> { ootoya }),
                ("OOT-BKK-02", "Ootoya สาขา เซ็นทรัล ชิดลม", bkk.Id, 2, new List<Brand> { ootoya }),
                ("OOT-CNX-01", "Ootoya สาขา เซ็นทรัล เฟสติวัล เชียงใหม่", chiangmai.Id, 2, new List<Brand> { ootoya }),
                ("OOT-CBI-01", "Ootoya สาขา เซ็นทรัล ศรีราชา", chonburi.Id, 2, new List<Brand> { ootoya }),
                ("OOT-KKN-01", "Ootoya สาขา เซ็นทรัล ขอนแก่น", khonkaen.Id, 2, new List<Brand> { ootoya }),

                // Pepper Lunch (5 Branches)
                ("PPL-BKK-01", "Pepper Lunch สาขา เทอร์มินอล 21 อโศก", bkk.Id, 3, new List<Brand> { pepper }),
                ("PPL-BKK-02", "Pepper Lunch สาขา เซ็นทรัล พระราม 9", bkk.Id, 3, new List<Brand> { pepper }),
                ("PPL-CNX-01", "Pepper Lunch สาขา เมญ่า เชียงใหม่", chiangmai.Id, 2, new List<Brand> { pepper }),
                ("PPL-HKT-01", "Pepper Lunch สาขา จังซีลอน ภูเก็ต", phuket.Id, 2, new List<Brand> { pepper }),
                ("PPL-CBI-01", "Pepper Lunch สาขา เซ็นทรัล พัทยา", chonburi.Id, 2, new List<Brand> { pepper }),

                // Auntie Anne's (5 Branches)
                ("ATN-BKK-01", "Auntie Anne's สาขา สยามเซ็นเตอร์", bkk.Id, 2, new List<Brand> { anne }),
                ("ATN-BKK-02", "Auntie Anne's สาขา เมกาบางนา", bkk.Id, 3, new List<Brand> { anne }),
                ("ATN-CNX-01", "Auntie Anne's สาขา เซ็นทรัล เชียงใหม่", chiangmai.Id, 2, new List<Brand> { anne }),
                ("ATN-HKT-01", "Auntie Anne's สาขา เซ็นทรัล ภูเก็ต", phuket.Id, 2, new List<Brand> { anne }),
                ("ATN-CBI-01", "Auntie Anne's สาขา เซ็นทรัล ชลบุรี", chonburi.Id, 2, new List<Brand> { anne }),

                // Arigato (5 Branches)
                ("ARI-BKK-01", "Arigato Coffee สาขา ซีพีทาวเวอร์ สีลม", bkk.Id, 2, new List<Brand> { arigato }),
                ("ARI-BKK-02", "Arigato สาขา สามย่าน มิตรทาวน์", bkk.Id, 3, new List<Brand> { arigato }),
                ("ARI-CNX-01", "Arigato สาขา นิมมานเหมินท์ เชียงใหม่", chiangmai.Id, 2, new List<Brand> { arigato }),
                ("ARI-CBI-01", "Arigato สาขา พัทยากลาง", chonburi.Id, 2, new List<Brand> { arigato }),
                ("ARI-NON-01", "Arigato Coffee สาขา เซ็นทรัล แจ้งวัฒนะ", nonthaburi.Id, 2, new List<Brand> { arigato })
            };

            foreach (var item in branchesToSeed)
            {
                var branch = new Branch
                {
                    BranchCode = item.Code,
                    Name = item.Name,
                    ProvinceId = item.ProvId,
                    KioskCount = item.Kiosks,
                    Status = "Active"
                };

                await context.Branches.AddAsync(branch);
                await context.SaveChangesAsync();

                // ผูกแบรนด์กับสาขา
                foreach (var brand in item.Brands)
                {
                    await context.BranchBrands.AddAsync(new BranchBrand
                    {
                        BranchId = branch.Id,
                        BrandId = brand.Id
                    });
                }

                // สร้างตู้ Kiosk ประจำสาขา
                for (int k = 1; k <= item.Kiosks; k++)
                {
                    await context.Kiosks.AddAsync(new Kiosk
                    {
                        BranchId = branch.Id,
                        KioskCode = $"{item.Code}-K{k:D2}",
                        KioskName = $"ตู้ประเมินความพึงพอใจ {k} ({item.Name})",
                        Status = KioskStatus.Online
                    });
                }
            }

            await context.SaveChangesAsync();
        }

        // 8. หยอดผู้ใช้ทดสอบระดับต่างๆ (Brand Managers, RM, AM, Staff, Custom Scope)
        if (await context.Users.CountAsync() <= 1)
        {
            var brandManagerRole = await context.Roles.FirstAsync(r => r.RoleCode == "BRAND_MANAGER");
            var regionalManagerRole = await context.Roles.FirstAsync(r => r.RoleCode == "REGIONAL_MANAGER");
            var areaManagerRole = await context.Roles.FirstAsync(r => r.RoleCode == "AREA_MANAGER");
            var staffRole = await context.Roles.FirstAsync(r => r.RoleCode == "BRANCH_STAFF");

            var allBrands = await context.Brands.ToListAsync();
            var allRegions = await context.Regions.ToListAsync();
            var allProvinces = await context.Provinces.ToListAsync();
            var allBranches = await context.Branches.ToListAsync();

            var defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123456");

            // 8.1 ผู้บริหารแบรนด์ (Brand Managers)
            var bmMisterDonut = new User
            {
                UserCode = "BM-DONUT",
                FirstName = "สมชาย",
                LastName = "โดนัททาวน์",
                Email = "donut.bm@satisfaction.local",
                Phone = "0821112233",
                PasswordHash = defaultPasswordHash,
                RoleId = brandManagerRole.Id,
                TierLevel = TierLevel.Brand,
                Status = "Active"
            };

            var bmKfc = new User
            {
                UserCode = "BM-KFC",
                FirstName = "ธนภัทร",
                LastName = "ชิคเก้นคิง",
                Email = "kfc.bm@satisfaction.local",
                Phone = "0823334455",
                PasswordHash = defaultPasswordHash,
                RoleId = brandManagerRole.Id,
                TierLevel = TierLevel.Brand,
                Status = "Active"
            };

            var bmOotoya = new User
            {
                UserCode = "BM-OOTOYA",
                FirstName = "กิตติพงษ์",
                LastName = "เจแปนคาเฟ่",
                Email = "ootoya.bm@satisfaction.local",
                Phone = "0825556677",
                PasswordHash = defaultPasswordHash,
                RoleId = brandManagerRole.Id,
                TierLevel = TierLevel.Brand,
                Status = "Active"
            };

            await context.Users.AddRangeAsync(bmMisterDonut, bmKfc, bmOotoya);
            await context.SaveChangesAsync();

            // ผูก Brand Scope
            var donutBrand = allBrands.First(b => b.BrandCode == "MISTER_DONUT");
            var kfcBrand = allBrands.First(b => b.BrandCode == "KFC");
            var ootoyaBrand = allBrands.First(b => b.BrandCode == "OOTOYA");

            await context.UserBrandScopes.AddRangeAsync(
                new UserBrandScope { UserId = bmMisterDonut.Id, BrandId = donutBrand.Id },
                new UserBrandScope { UserId = bmKfc.Id, BrandId = kfcBrand.Id },
                new UserBrandScope { UserId = bmOotoya.Id, BrandId = ootoyaBrand.Id }
            );

            // 8.2 ผู้จัดการภาค (Regional Managers: RM)
            var centralRegion = allRegions.First(r => r.Name == "ภาคกลาง");
            var northRegion = allRegions.First(r => r.Name == "ภาคเหนือ");
            var southRegion = allRegions.First(r => r.Name == "ภาคใต้");

            var rmCentral = new User
            {
                UserCode = "RM-CENTRAL",
                FirstName = "ประสิทธิ์",
                LastName = "มหาธานี",
                Email = "rm.central@satisfaction.local",
                Phone = "0831118899",
                PasswordHash = defaultPasswordHash,
                RoleId = regionalManagerRole.Id,
                TierLevel = TierLevel.Region,
                Status = "Active"
            };

            var rmNorth = new User
            {
                UserCode = "RM-NORTH",
                FirstName = "นพพร",
                LastName = "พายัพวัฒนา",
                Email = "rm.north@satisfaction.local",
                Phone = "0832228899",
                PasswordHash = defaultPasswordHash,
                RoleId = regionalManagerRole.Id,
                TierLevel = TierLevel.Region,
                Status = "Active"
            };

            var rmSouth = new User
            {
                UserCode = "RM-SOUTH",
                FirstName = "วิทูรย์",
                LastName = "ทักษิณสถิต",
                Email = "rm.south@satisfaction.local",
                Phone = "0833338899",
                PasswordHash = defaultPasswordHash,
                RoleId = regionalManagerRole.Id,
                TierLevel = TierLevel.Region,
                Status = "Active"
            };

            await context.Users.AddRangeAsync(rmCentral, rmNorth, rmSouth);
            await context.SaveChangesAsync();

            // ผูก Region Scope
            await context.UserRegionScopes.AddRangeAsync(
                new UserRegionScope { UserId = rmCentral.Id, RegionId = centralRegion.Id },
                new UserRegionScope { UserId = rmNorth.Id, RegionId = northRegion.Id },
                new UserRegionScope { UserId = rmSouth.Id, RegionId = southRegion.Id }
            );

            // 8.3 ผู้จัดการเขต (Area Managers: AM)
            var bkkProv = allProvinces.First(p => p.Name == "กรุงเทพมหานคร");
            var cnxProv = allProvinces.First(p => p.Name == "เชียงใหม่");
            var hktProv = allProvinces.First(p => p.Name == "ภูเก็ต");

            var amBkk = new User
            {
                UserCode = "AM-BKK-01",
                FirstName = "ชานนท์",
                LastName = "มหานครเขต 1",
                Email = "am.bkk@satisfaction.local",
                Phone = "0841113344",
                PasswordHash = defaultPasswordHash,
                RoleId = areaManagerRole.Id,
                TierLevel = TierLevel.Province,
                Status = "Active"
            };

            var amCnx = new User
            {
                UserCode = "AM-CNX-01",
                FirstName = "ศุภชัย",
                LastName = "ล้านนาเขต 1",
                Email = "am.cnx@satisfaction.local",
                Phone = "0842223344",
                PasswordHash = defaultPasswordHash,
                RoleId = areaManagerRole.Id,
                TierLevel = TierLevel.Province,
                Status = "Active"
            };

            var amHkt = new User
            {
                UserCode = "AM-HKT-01",
                FirstName = "ธีรพงศ์",
                LastName = "อันดามันเขต 1",
                Email = "am.hkt@satisfaction.local",
                Phone = "0843333344",
                PasswordHash = defaultPasswordHash,
                RoleId = areaManagerRole.Id,
                TierLevel = TierLevel.Province,
                Status = "Active"
            };

            await context.Users.AddRangeAsync(amBkk, amCnx, amHkt);
            await context.SaveChangesAsync();

            // ผูก Province Scope
            await context.UserProvinceScopes.AddRangeAsync(
                new UserProvinceScope { UserId = amBkk.Id, ProvinceId = bkkProv.Id },
                new UserProvinceScope { UserId = amCnx.Id, ProvinceId = cnxProv.Id },
                new UserProvinceScope { UserId = amHkt.Id, ProvinceId = hktProv.Id }
            );

            // 8.4 พนักงานสาขา (Branch Staff) และผู้ดูแลสาขา Co-location (2 แบรนด์)
            var colocationBranch = allBranches.FirstOrDefault(b => b.BranchCode == "MDO-NON-01");
            var paragonBranch = allBranches.FirstOrDefault(b => b.BranchCode == "KFC-BKK-01");

            var staffColocation = new User
            {
                UserCode = "STF-COLOC-01",
                FirstName = "อภิสิทธิ์",
                LastName = "ดูโอ้สโตร์",
                Email = "staff.futurepark@satisfaction.local",
                Phone = "0851115566",
                PasswordHash = defaultPasswordHash,
                RoleId = staffRole.Id,
                TierLevel = TierLevel.Branch,
                Status = "Active"
            };

            var staffParagon = new User
            {
                UserCode = "STF-KFC-01",
                FirstName = "วรรณพร",
                LastName = "พารากอนแคร์",
                Email = "staff.paragon@satisfaction.local",
                Phone = "0852225566",
                PasswordHash = defaultPasswordHash,
                RoleId = staffRole.Id,
                TierLevel = TierLevel.Branch,
                Status = "Active"
            };

            await context.Users.AddRangeAsync(staffColocation, staffParagon);
            await context.SaveChangesAsync();

            if (colocationBranch != null)
            {
                await context.UserBranchScopes.AddAsync(new UserBranchScope
                {
                    UserId = staffColocation.Id,
                    BranchId = colocationBranch.Id
                });
            }

            if (paragonBranch != null)
            {
                await context.UserBranchScopes.AddAsync(new UserBranchScope
                {
                    UserId = staffParagon.Id,
                    BranchId = paragonBranch.Id
                });
            }

            await context.SaveChangesAsync();
        }

        // 9. หยอด Event Categories และกิจกรรมจำลอง
        if (!await context.EventCategories.AnyAsync())
        {
            var catCampaign = new EventCategory { CategoryCode = "CAMPAIGN", CategoryLabel = "แคมเปญการตลาด", DisplayOrder = 1 };
            var catMaintenance = new EventCategory { CategoryCode = "MAINTENANCE", CategoryLabel = "ซ่อมบำรุงและอัปเกรด", DisplayOrder = 2 };
            var catFirmware = new EventCategory { CategoryCode = "FIRMWARE", CategoryLabel = "อัปเดตระบบ Kiosk", DisplayOrder = 3 };
            var catCalibration = new EventCategory { CategoryCode = "CALIBRATION", CategoryLabel = "ปรับจูนอุปกรณ์", DisplayOrder = 4 };
            var catAudit = new EventCategory { CategoryCode = "AUDIT", CategoryLabel = "ตรวจประเมินสาขา (Audit)", DisplayOrder = 5 };

            await context.EventCategories.AddRangeAsync(catCampaign, catMaintenance, catFirmware, catCalibration, catAudit);
            await context.SaveChangesAsync();

            var kfcBrand = await context.Brands.FirstOrDefaultAsync(b => b.BrandCode == "KFC");
            var mdoBrand = await context.Brands.FirstOrDefaultAsync(b => b.BrandCode == "MDO");
            var aanBrand = await context.Brands.FirstOrDefaultAsync(b => b.BrandCode == "AAN");

            var sampleEvents = new List<Event>
            {
                new()
                {
                    EventCode = "EVT-2026-0001",
                    EventName = "แคมเปญวันเด็ก แจกไอศกรีมและของขวัญ",
                    EventDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(3)),
                    StartTime = new TimeOnly(10, 0),
                    EndTime = new TimeOnly(16, 0),
                    BrandId = kfcBrand?.Id,
                    EventLocation = "ทุกสาขากรุงเทพฯ และปริมณฑล",
                    CategoryId = catCampaign.Id,
                    EventStatus = "Upcoming",
                    Description = "กิจกรรมพิเศษต้อนรับวันเด็กแห่งชาติ",
                    KioskThemeOverride = "ธีมวันเด็กสดใส (Kids Joy Theme)",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    EventCode = "EVT-2026-0002",
                    EventName = "ตรวจมาตรฐานความสะอาดและสุขอนามัย Q1",
                    EventDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
                    StartTime = new TimeOnly(9, 0),
                    EndTime = new TimeOnly(17, 0),
                    BrandId = mdoBrand?.Id,
                    EventLocation = "สาขาโซนภาคกลางและนนทบุรี",
                    CategoryId = catAudit.Id,
                    EventStatus = "Upcoming",
                    Description = "การตรวจประเมินสุขอนามัยหน้าร้านและครัวประจำไตรมาสที่ 1",
                    CreatedAt = DateTime.UtcNow
                },
                new()
                {
                    EventCode = "EVT-2026-0003",
                    EventName = "อัปเดต Firmware ตู้ Kiosk ประจำสาขาเซ็นทรัลเวิลด์",
                    EventDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-2)),
                    StartTime = new TimeOnly(22, 0),
                    EndTime = new TimeOnly(23, 30),
                    BrandId = aanBrand?.Id,
                    EventLocation = "Central World ชั้น 3",
                    CategoryId = catFirmware.Id,
                    EventStatus = "Completed",
                    Description = "อัปเกรดซอฟต์แวร์ประเมินความพึงพอใจเวอร์ชัน 2.4.0",
                    CreatedAt = DateTime.UtcNow.AddDays(-3)
                }
            };

            await context.Events.AddRangeAsync(sampleEvents);
            await context.SaveChangesAsync();
        }

        // 10. หยอดตู้ Kiosk ประจำสาขา
        if (!await context.Kiosks.AnyAsync())
        {
            var branches = await context.Branches.Take(10).ToListAsync();
            var kiosks = new List<Kiosk>();

            foreach (var branch in branches)
            {
                kiosks.Add(new Kiosk
                {
                    KioskCode = $"KS-{branch.BranchCode}-01",
                    KioskName = $"ตู้ประเมินหน้าร้าน {branch.Name} จุดที่ 1",
                    BranchId = branch.Id,
                    Status = KioskStatus.Online,
                    LastPingAt = DateTime.UtcNow.AddMinutes(-new Random().Next(1, 10)),
                    CreatedAt = DateTime.UtcNow.AddDays(-30)
                });

                kiosks.Add(new Kiosk
                {
                    KioskCode = $"KS-{branch.BranchCode}-02",
                    KioskName = $"ตู้ประเมินเคาน์เตอร์รับสินค้า {branch.Name} จุดที่ 2",
                    BranchId = branch.Id,
                    Status = branch.BranchCode.Contains("05") ? KioskStatus.Maintenance : KioskStatus.Online,
                    LastPingAt = DateTime.UtcNow.AddMinutes(-new Random().Next(1, 30)),
                    CreatedAt = DateTime.UtcNow.AddDays(-30)
                });
            }

            await context.Kiosks.AddRangeAsync(kiosks);
            await context.SaveChangesAsync();
        }

        // 11. หยอดผลโหวตความพึงพอใจจำลอง (SatisfactionVotes)
        if (!await context.SatisfactionVotes.AnyAsync())
        {
            var branchesWithBrands = await context.Branches
                .Include(b => b.BranchBrands)
                .Include(b => b.Kiosks)
                .Take(8)
                .ToListAsync();

            var votes = new List<SatisfactionVote>();
            var random = new Random(42);

            foreach (var branch in branchesWithBrands)
            {
                var primaryBrand = branch.BranchBrands.FirstOrDefault()?.BrandId;
                if (!primaryBrand.HasValue) continue;

                var kiosk = branch.Kiosks.FirstOrDefault();

                // สร้างโหวตย้อนหลัง 14 วัน
                for (int day = 0; day < 14; day++)
                {
                    var voteDate = DateTime.UtcNow.AddDays(-day);
                    int count = random.Next(15, 45);

                    for (int i = 0; i < count; i++)
                    {
                        var dice = random.Next(100);
                        var sentiment = dice < 82 ? SentimentType.Positive : (dice < 93 ? SentimentType.Neutral : SentimentType.Negative);

                        votes.Add(new SatisfactionVote
                        {
                            BranchId = branch.Id,
                            BrandId = primaryBrand.Value,
                            KioskId = kiosk?.Id,
                            Sentiment = sentiment,
                            VotedAt = voteDate.AddHours(random.Next(10, 21)).AddMinutes(random.Next(0, 60)),
                            ClientIp = "192.168.1." + random.Next(10, 250)
                        });
                    }
                }
            }

            await context.SatisfactionVotes.AddRangeAsync(votes);
            await context.SaveChangesAsync();
        }

        // 12. หยอดการแจ้งเตือนจำลอง (Notifications)
        if (!await context.Notifications.AnyAsync())
        {
            var firstBranch = await context.Branches.FirstOrDefaultAsync();

            var notifications = new List<Notification>
            {
                new()
                {
                    Title = "แจ้งเตือนระดับ CSAT ต่ำกว่าเกณฑ์มาตรฐาน",
                    NotificationType = "Alert",
                    Description = "คะแนนความพึงพอใจลดลงเหลือ 78.5% ในช่วงเวลาเร่งด่วน 12:00 - 13:30 น. แนะนำให้ตรวจสอบจุดบริการแคชเชียร์",
                    Priority = "High",
                    IsRead = false,
                    TargetBranchId = firstBranch?.Id,
                    CreatedAt = DateTime.UtcNow.AddHours(-2)
                },
                new()
                {
                    Title = "ตู้ Kiosk หมายเลข KS-MDO-NON-01 ออฟไลน์",
                    NotificationType = "Alert",
                    Description = "ไม่พบสัญญาณ Heartbeat จากตู้ประเมินเกิน 15 นาที กรุณาตรวจสอบสาย LAN หรือการเชื่อมต่อ Wi-Fi",
                    Priority = "High",
                    IsRead = false,
                    TargetBranchId = firstBranch?.Id,
                    CreatedAt = DateTime.UtcNow.AddHours(-5)
                },
                new()
                {
                    Title = "ข้อเสนอแนะลูกค้า: การบริการรวดเร็วและพนักงานยิ้มแย้ม",
                    NotificationType = "Feedback",
                    Description = "ลูกค้าประเมินระดับดีเยี่ยมและให้คำชมเชยพนักงานประจำสาขาผ่านตู้ประเมิน",
                    Priority = "Low",
                    IsRead = true,
                    ReadAt = DateTime.UtcNow.AddHours(-6),
                    TargetBranchId = firstBranch?.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-1)
                },
                new()
                {
                    Title = "ระบบอัปเดตรายงานสรุปผลประจำสัปดาห์เรียบร้อยแล้ว",
                    NotificationType = "System",
                    Description = "รายงานผลการประเมินความพึงพอใจระดับเครือ CRG ประจำสัปดาห์พร้อมให้ดาวน์โหลดในหน้าจัดการรายงาน",
                    Priority = "Medium",
                    IsRead = true,
                    ReadAt = DateTime.UtcNow.AddDays(-1),
                    CreatedAt = DateTime.UtcNow.AddDays(-2)
                }
            };

            await context.Notifications.AddRangeAsync(notifications);
            await context.SaveChangesAsync();
        }

        // 13. หยอดสถานะการทำงานระบบ (ApiServiceHealth)
        if (!await context.ApiServiceHealths.AnyAsync())
        {
            var healths = new List<ApiServiceHealth>
            {
                new()
                {
                    ServiceCode = "CORE_API",
                    ServiceName = "Core Web API (ASP.NET Core 9)",
                    Endpoint = "/api/dashboard",
                    Status = "Operational",
                    UptimePercent = 99.98m,
                    LatencyMs = 42,
                    ErrorRatePercent = 0.01m,
                    LastCheckedAt = DateTime.UtcNow
                },
                new()
                {
                    ServiceCode = "POSTGRES_DB",
                    ServiceName = "PostgreSQL Database Cluster",
                    Endpoint = "tcp://db:5432",
                    Status = "Operational",
                    UptimePercent = 99.99m,
                    LatencyMs = 12,
                    ErrorRatePercent = 0.00m,
                    LastCheckedAt = DateTime.UtcNow
                },
                new()
                {
                    ServiceCode = "KIOSK_INGESTION",
                    ServiceName = "Kiosk Touch Ingestion Gateway",
                    Endpoint = "/api/satisfaction/vote",
                    Status = "Operational",
                    UptimePercent = 99.95m,
                    LatencyMs = 35,
                    ErrorRatePercent = 0.02m,
                    LastCheckedAt = DateTime.UtcNow
                },
                new()
                {
                    ServiceCode = "AUTH_IDENTITY",
                    ServiceName = "JWT Identity & Scope Governance",
                    Endpoint = "/api/auth/verify",
                    Status = "Operational",
                    UptimePercent = 100.00m,
                    LatencyMs = 28,
                    ErrorRatePercent = 0.00m,
                    LastCheckedAt = DateTime.UtcNow
                }
            };

            await context.ApiServiceHealths.AddRangeAsync(healths);
            await context.SaveChangesAsync();
        }

        // 14. หยอดประวัติการทำงานจำลอง (AuditLogs)
        if (!await context.AuditLogs.AnyAsync())
        {
            var adminUser = await context.Users.FirstOrDefaultAsync(u => u.UserCode == "ADM001");

            var log1 = new AuditLog
            {
                OccurredAt = DateTime.UtcNow.AddHours(-3),
                ActorUserId = adminUser?.Id,
                ActorNameSnapshot = "ธนภัทร วงศ์พิพัฒน์",
                ActorRoleSnapshot = "Super Admin (ผู้ดูแลระบบสูงสุด)",
                ActionType = "UPDATE",
                TargetEntity = "SystemConfig",
                Description = "ปรับเกณฑ์แจ้งเตือน CSAT ขั้นต่ำจาก 75% เป็น 80%",
                Status = "SUCCESS",
                IpAddress = "192.168.1.50"
            };
            log1.DiffDetails.Add(new AuditDiffDetail { FieldName = "AlertThreshold", BeforeValue = "75%", AfterValue = "80%" });

            var log2 = new AuditLog
            {
                OccurredAt = DateTime.UtcNow.AddDays(-1),
                ActorUserId = adminUser?.Id,
                ActorNameSnapshot = "ธนภัทร วงศ์พิพัฒน์",
                ActorRoleSnapshot = "Super Admin (ผู้ดูแลระบบสูงสุด)",
                ActionType = "CREATE",
                TargetEntity = "Branch",
                Description = "เพิ่มสาขาใหม่ Central World (CRG Co-Location)",
                Status = "SUCCESS",
                IpAddress = "192.168.1.50"
            };

            await context.AuditLogs.AddRangeAsync(log1, log2);
            await context.SaveChangesAsync();
        }
    }
}

