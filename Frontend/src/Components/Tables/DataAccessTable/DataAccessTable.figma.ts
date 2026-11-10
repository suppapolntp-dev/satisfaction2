// url=https://www.figma.com/design/XEDWIaiMgrKxx41k8MDhf1/User-Management-Table-Tab-Pills?node-id=3:3
// source=Frontend/src/Components/Tables/DataAccessTable/DataAccessTable.tsx
// component=DataAccessTable
import figma from "figma";

const instance = figma.selectedInstance;

const isLoading = instance.getBoolean("Loading");
const scopeTitle = instance.getString("Scope Title");

export default {
  example: figma.code`
    <DataAccessTable
      users={users}
      isLoading={${isLoading}}
      scopeTitle="${scopeTitle}"
      onAddScope={handleOpenAddScopeModal}
      onAddUser={handleOpenAddUserModal}
      onEditUser={handleEditUser}
      onDeleteUser={handleDeleteUser}
    />
  `,
  imports: ['import DataAccessTable from "@/Components/Tables/DataAccessTable"'],
  id: "data-access-table",
  metadata: {
    nestable: true,
    props: {
      isLoading,
      scopeTitle,
    },
  },
};
