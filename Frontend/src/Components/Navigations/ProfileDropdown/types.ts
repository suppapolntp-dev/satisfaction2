export interface UserProfile {
  id?: string;
  fullName: string;
  email: string;
  roleName: string;
  avatarUrl?: string;
  brandName?: string;
  brandLogoUrl?: string;
  brandId?: string;
  isGuest?: boolean;
}

export interface ProfileDropdownProps {
  initialProfile?: UserProfile | null;
  className?: string;
}
