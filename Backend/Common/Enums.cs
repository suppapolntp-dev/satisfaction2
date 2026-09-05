namespace Backend.Common;

public enum TierLevel
{
    SuperAdmin = 1,
    Brand = 2,
    Region = 3,
    Province = 4,
    Branch = 5,
    CustomScope = 6
}

public enum SentimentType
{
    Positive = 1,
    Neutral = 2,
    Negative = 3
}

public enum KioskStatus
{
    Online = 1,
    Offline = 2,
    Maintenance = 3
}

public enum ActionType
{
    Create,
    Update,
    Delete,
    Export,
    Login,
    Logout,
    Vote,
    VerifyOtp
}

public enum OtpStatus
{
    Pending = 1,
    Verified = 2,
    Expired = 3,
    Failed = 4
}

