// url=https://www.figma.com/design/XEDWIaiMgrKxx41k8MDhf1/User-Management-Table-Tab-Pills?node-id=0:1
// source=Frontend/src/Components/Tables/UserTable/UserTable.tsx
// component=UserTable
import figma from "figma";

const instance = figma.selectedInstance;

const isLoading = instance.getBoolean("Loading");
const showActions = instance.getBoolean("Show Actions", { true: true, false: false });

export default {
  example: figma.code`
    <UserTable
      users={users}
      isLoading={${isLoading}}
      onAddUser={handleOpenCreateModal}
      onEditUser={handleOpenEditModal}
      onToggleStatus={handleToggleStatus}
      onDeleteUser={handleRequestDelete}
    />
  `,
  imports: ['import UserTable from "@/Components/Tables/UserTable"'],
  id: "user-table",
  metadata: {
    nestable: true,
    props: {
      isLoading,
      showActions,
    },
  },
};
