import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
  } from '@workspace/ui/components/dialog';
  import { Button } from '@workspace/ui/components/button';
  import {  XCircle } from 'lucide-react';
import React from 'react';
    

interface RejectDialogProps {
    isOpen: boolean;
    onClose: () => void;
    notes: string;
    setNotes: (notes: string) => void;
    onReject: () => void;
    isProcessing: boolean;
    title?: string;
    description?: string;
}

// Reject Dialog Component
export const RejectDialog = React.memo(({
    isOpen,
    onClose,
    notes,
    setNotes,
    onReject,
    isProcessing,
    title = 'Reject Targets',
    description = 'You are about to reject these targets. Please provide a reason below.'
}: RejectDialogProps) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>
                    {description}
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="rejectionNotes">
                        Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="rejectionNotes"
                        className="w-full min-h-[100px] p-2 border rounded-md"
                        placeholder="Provide reason for rejection..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        required
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
                    onClick={onReject}
                    disabled={isProcessing || !notes.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white"
                >
                    <XCircle className="mr-2 h-4 w-4" />
                    {isProcessing ? 'Processing...' : 'Reject'}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
));