import { redirect } from "next/navigation";

export default function DataAccessManagementPage() {
  redirect("/usermanagement?tab=dataaccess");
}
