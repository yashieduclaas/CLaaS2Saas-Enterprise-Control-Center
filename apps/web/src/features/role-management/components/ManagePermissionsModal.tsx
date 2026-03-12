import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  makeStyles,
} from "@fluentui/react-components";

import type { SecurityRole } from "../types/securityRole";

const useStyles = makeStyles({

  dialog: {
    width: "750px",
    maxWidth: "92vw",
    borderRadius: "18px",
    padding: "28px",
  },

  title: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#1f3b64",
    marginBottom: "12px",
  },

  subInfo: {
   display:"flex",
   alignItems:"center",
    gap:"6px",
    fontSize:"14px",
    color:"#6b7280",
    marginBottom:"20px",
    whiteSpace:"nowrap"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    background:"#f2f4f7",
    padding:"16px",
    fontSize:"14px",
    fontWeight:600,
    color:"#1f3b64",
    borderBottom:"1px solid #e5e7eb",
    textAlign:"center"
  },

  td: {
    padding: "14px",
    fontSize: "14px",
    borderBottom: "1px solid #f1f3f5",
    color: "#374151",
  },

  check: {
    color: "#4caf50",
    fontWeight: 700,
    fontSize: "16px",
  },

  cross: {
    color: "#e57373",
    fontWeight: 700,
    fontSize: "16px",
  },

  statusActive: {
    background: "#e8f5e9",
    color: "#2e7d32",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
  },
  thLeft:{
    textAlign:"left"
}

});

interface Props {
  role: SecurityRole | null;
  onClose: () => void;
}

export function ManagePermissionsModal({ role, onClose }: Props) {

  const styles = useStyles();

  if (!role) return null;

  return (

    <Dialog open={true} onOpenChange={(_, d) => !d.open && onClose()}>

      <DialogSurface className={styles.dialog}>

        <DialogTitle className={styles.title}>
          Manage Permissions for: {role.roleName}
        </DialogTitle>
          {/* Role Info */}
            <div className={styles.subInfo}>
                <span><b>Role Code:</b> {role.roleCode}</span>
                <span className={styles.separator}>|</span>
                <span>
                <b>Module:</b> {role.moduleCode} - {role.moduleName}
                </span>
            </div>
        <DialogBody>

            {/* Table */}
            <div className={styles.tableContainer}>

                <table className={styles.table}>

                <thead>

                    <tr>

                    <th className={`${styles.th} ${styles.thLeft}`}>
                        Solution/Module
                    </th>

                    <th className={`${styles.th} ${styles.thLeft}`}>
                        Role
                    </th>

                    <th className={styles.th}>C</th>
                    <th className={styles.th}>R</th>
                    <th className={styles.th}>U</th>
                    <th className={styles.th}>D</th>
                    <th className={styles.th}>All User</th>
                    <th className={styles.th}>Module Admin</th>
                    <th className={styles.th}>All Admin</th>
                    <th className={styles.th}>Status</th>

                    </tr>

                </thead>

                <tbody>

                    <tr>

                    <td className={styles.tdLeft}>
                        {role.solutionCode}
                        <div className={styles.subText}>
                        {role.moduleCode}
                        </div>
                    </td>

                    <td className={styles.tdLeft}>
                        {role.roleName}
                        <div className={styles.subText}>
                        {role.roleCode}
                        </div>
                    </td>

                    <td className={styles.td}><span className={styles.check}>✔</span></td>
                    <td className={styles.td}><span className={styles.check}>✔</span></td>
                    <td className={styles.td}><span className={styles.check}>✔</span></td>
                    <td className={styles.td}><span className={styles.check}>✔</span></td>
                    <td className={styles.td}><span className={styles.check}>✔</span></td>
                    <td className={styles.td}><span className={styles.check}>✔</span></td>
                    <td className={styles.td}><span className={styles.cross}>✖</span></td>

                    <td className={styles.td}>
                        <span className={styles.status}>Active</span>
                    </td>

                    </tr>

                </tbody>

                </table>

            </div>

        </DialogBody>

      </DialogSurface>

    </Dialog>

  );
}