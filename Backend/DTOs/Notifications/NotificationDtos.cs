namespace Backend.DTOs.Notifications;

/// <summary>
/// DTO สำหรับการแจ้งเตือนในระบบ (ตรงกับ SystemNotificationItem ใน Frontend)
/// </summary>
public class NotificationDto
{
    public string NotificationId { get; set; } = string.Empty;
    public string NotificationTitle { get; set; } = string.Empty;
    public string NotificationType { get; set; } = "Alert"; // Alert, Feedback, System
    public string NotificationTimeText { get; set; } = string.Empty;
    public string NotificationDescription { get; set; } = string.Empty;
    public bool IsNotificationRead { get; set; }
    public string TargetBranchName { get; set; } = string.Empty;
    public string TargetBranchCode { get; set; } = string.Empty;
    public string NotificationPriority { get; set; } = "Medium"; // High, Medium, Low
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Request DTO สำหรับสร้างการแจ้งเตือนใหม่
/// </summary>
public class CreateNotificationRequest
{
    public string Title { get; set; } = string.Empty;
    public string NotificationType { get; set; } = "Alert";
    public string Description { get; set; } = string.Empty;
    public Guid? TargetBranchId { get; set; }
    public Guid? RecipientUserId { get; set; }
    public string Priority { get; set; } = "Medium";
}

