export interface UserProfile {
  id?: string;
  fullName: string;
  email: string;
  roleName: string;
  avatarUrl?: string;
}

export interface ProfileDropdownProps {
  initialProfile?: UserProfile | null;
  className?: string;
}
