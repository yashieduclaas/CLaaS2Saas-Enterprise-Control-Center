// features/user-enrichment/components/AddUserModal.tsx
// Add New User modal — minimal working version.

import {
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
} from '@fluentui/react-components';

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function AddUserModal({ open, onClose }: Props) {
    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogContent>
                        <p>Modal is working</p>
                    </DialogContent>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
