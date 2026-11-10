export interface SearchActionItem {
  id: string;
  label: string;
  groupName: string;
  itemName: string;
  route: string;
  shortcut: string;
}

export interface NavbarSearchDropdownProps {
  className?: string;
  placeholder?: string;
}
