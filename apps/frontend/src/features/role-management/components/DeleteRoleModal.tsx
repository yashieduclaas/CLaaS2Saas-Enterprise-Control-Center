import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  Button,
  makeStyles
} from "@fluentui/react-components";

import type { SecurityRole } from "../types/securityRole";

const useStyles = makeStyles({

  dialog:{
    width:"400px",
    padding:"24px"
  },

  text:{
    fontSize:"14px",
    marginTop:"10px"
  }

});

interface Props{
  role: SecurityRole;
  onClose: ()=>void;
  onConfirm: ()=>void;
}

export function DeleteRoleModal({role,onClose,onConfirm}:Props){

  const styles = useStyles();

  const handleConfirm = () => {
    onConfirm(); 
    onClose();  
  };

  return(

    <Dialog open={true} onOpenChange={(_,d)=>!d.open && onClose()}>

      <DialogSurface className={styles.dialog}>

        <DialogTitle>
          Delete Role
        </DialogTitle>

        <DialogBody>

          <div className={styles.text}>
            Are you sure you want to delete the role <strong>{role.roleName}</strong>?
          </div>

          <DialogActions>

            <Button appearance="secondary" onClick={onClose}>
              Cancel
            </Button>

            <Button appearance="primary" onClick={handleConfirm}>
              OK
            </Button>

          </DialogActions>

        </DialogBody>

      </DialogSurface>

    </Dialog>

  );

}