namespace Backend.Common;

public static class AppConstants
{
    public static class Modules
    {
        public const string Dashboard = "DASHBOARD";
        public const string Satisfaction = "SATISFACTION";
        public const string Organization = "ORGANIZATION";
        public const string Users = "USERS";
        public const string Roles = "ROLES";
        public const string DataAccess = "DATA_ACCESS";
        public const string Events = "EVENTS";
        public const string Audit = "AUDIT";
        public const string Settings = "SETTINGS";
    }

    public static class SettingKeys
    {
        public const string JwtExpiryDays = "JWT_EXPIRY_DAYS";
        public const string OtpExpiryMinutes = "OTP_EXPIRY_MINUTES";
        public const string OtpCooldownSeconds = "OTP_COOLDOWN_SECONDS";
        public const string SystemName = "SYSTEM_NAME";
        public const string KioskTimeoutSeconds = "KIOSK_TIMEOUT_SECONDS";
    }

    public static class Roles
    {
        public const string SuperAdmin = "SuperAdmin";
        public const string AreaManager = "AreaManager";
        public const string RegionalManager = "RegionalManager";
        public const string BranchManager = "BranchManager";
        public const string Staff = "Staff";
    }
}

