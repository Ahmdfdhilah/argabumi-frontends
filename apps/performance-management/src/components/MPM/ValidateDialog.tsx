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

interface ValidateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    comments: string;
    setComments: (comments: string) => void;
    onValidate: () => void;
    isProcessing: boolean;
}

// Validate Dialog Component
export const ValidateDialog = React.memo(({
    isOpen,
    onClose,
    comments,
    setComments,
    onValidate,
    isProcessing
}: ValidateDialogProps) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Validate Targets</DialogTitle>
                <DialogDescription>
                    You are about to validate these approved targets. You can add comments below.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="validationComments">
                        Validation Comments (Optional)
                    </label>
                    <textarea
                        id="validationComments"
                        className="w-full min-h-[100px] p-2 border rounded-md"
                        placeholder="Add any comments for this validation..."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                    />
                </div>
            </div>

            <DialogFooter>
                <Button
                    variant="outline"
                    onClick={() => {
                        onClose();
                        setComments('');
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onValidate}
                    disabled={isProcessing}
                    className="bg-[#1B6131] hover:bg-[#46B749]"
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {isProcessing ? 'Processing...' : 'Validate'}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
));