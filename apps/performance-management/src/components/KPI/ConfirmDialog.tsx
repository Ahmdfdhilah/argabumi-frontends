import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { CheckCircle } from 'lucide-react';
import React from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    isProcessing: boolean;
    title: string;
    description: string;
}

// Confirm Dialog Component
export const ConfirmDialog = React.memo(({
    isOpen,
    onClose,
    onConfirm,
    isProcessing,
    title,
    description
}: ConfirmDialogProps) => {
    // Handle the confirmation action
    const handleConfirm = async () => {
        try {
            // Call the onConfirm function passed from parent
            await onConfirm();
            // Dialog should be closed by the parent component after successful operation
        } catch (error) {
            console.error("Error in confirmation action:", error);
            // Error handling is done in the parent component
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            // Only allow closing if not processing
            if (!isProcessing && !open) {
                onClose();
            }
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isProcessing}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="bg-[#1B6131] hover:bg-[#46B749]"
                    >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {isProcessing ? 'Processing...' : 'Confirm'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});