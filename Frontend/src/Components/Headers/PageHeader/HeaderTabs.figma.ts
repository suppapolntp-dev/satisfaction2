// url=https://www.figma.com/design/XEDWIaiMgrKxx41k8MDhf1/User-Management-Table-Tab-Pills?node-id=0:1
// source=Frontend/src/Components/Headers/PageHeader/HeaderTabs.tsx
// component=HeaderTabs
import figma from "figma";

const instance = figma.selectedInstance;

const activeTab = instance.getString("Active Tab");

export default {
  example: figma.code`
    <HeaderTabs
      tabs={[
        { id: "users", label: "User Accounts (บัญชีผู้ใช้)", badge: 24 },
        { id: "dataaccess", label: "Data Access Scope (ขอบเขตข้อมูล)" },
      ]}
      activeTab="${activeTab}"
      onTabChange={handleTabChange}
    />
  `,
  imports: ['import HeaderTabs from "@/Components/Headers/PageHeader/HeaderTabs"'],
  id: "header-tabs",
  metadata: {
    nestable: true,
  },
};
