import { Suspense } from "react";
import UsermanagementScreen from "@/Screens/Admin/Usermanagement/page";

export default function UserManagementPage() {
  return (
    <Suspense fallback={null}>
      <UsermanagementScreen />
    </Suspense>
  );
}
