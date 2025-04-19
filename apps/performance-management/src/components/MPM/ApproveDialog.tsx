import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { CheckCircle,} from 'lucide-react';
import React from 'react';

interface ApproveDialogProps {
    isOpen: boolean;
    onClose: () => void;
    notes: string;
    setNotes: (notes: string) => void;
    onApprove: () => void;
    isProcessing: boolean;
}

// Approve Dialog Component
export const ApproveDialog = React.memo(({
    isOpen,
    onClose,
    notes,
    setNotes,
    onApprove,
    isProcessing
}: ApproveDialogProps) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Approve Targets</DialogTitle>
                <DialogDescription>
                    You are about to approve these targets. You can add notes below.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="approvalNotes">
                        Approval Notes (Optional)
                    </label>
                    <textarea
                        id="approvalNotes"
                        className="w-full min-h-[100px] p-2 border rounded-md"
                        placeholder="Add any notes for this approval..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
            </div>

            <DialogFooter>
                <Button
                    variant="outline"
                    onClick={() => {
                        onClose();
                        setNotes('');
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onApprove}
                    disabled={isProcessing}
                    className="bg-[#1B6131] hover:bg-[#46B749]"
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {isProcessing ? 'Processing...' : 'Approve'}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
));
