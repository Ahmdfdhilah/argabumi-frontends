import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Send } from 'lucide-react';
import React from 'react';

interface SubmitDialogProps {
    isOpen: boolean;
    onClose: () => void;
    comments: string;
    setComments: (comments: string) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export const SubmitDialog = React.memo(({
    isOpen,
    onClose,
    comments,
    setComments,
    onSubmit,
    isSubmitting
}: SubmitDialogProps) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Submit Targets</DialogTitle>
                <DialogDescription>
                    Submit these targets for approval. You can add comments below.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="comments">
                        Comments (Optional)
                    </label>
                    <textarea
                        id="comments"
                        className="w-full min-h-[100px] p-2 border rounded-md"
                        placeholder="Add any comments about these targets..."
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
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="bg-[#1B6131] hover:bg-[#46B749]"
                >
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Submitting...' : 'Submit Targets'}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
));///


