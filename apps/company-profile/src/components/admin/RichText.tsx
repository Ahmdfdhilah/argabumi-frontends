import React, { useRef, useEffect, useState, useCallback } from "react";
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold, Italic, Link as LinkIcon,
    Heading1, Heading2, Heading3, Undo, Redo,
    Trash2, X, Check, AlignLeft, AlignCenter, AlignRight
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@workspace/ui/components/tooltip';
import { cn } from '@workspace/ui/lib/utils';

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

type EditorButtonProps = {
    onClick: () => void;
    isActive?: boolean;
    label: string;
    disabled?: boolean;
    children: React.ReactNode;
};

export const Editor = ({
    value,
    onChange,
    placeholder = 'Write something amazing...',
    className
}: EditorProps) => {
    // Track initial mount and selection state
    const isInitialMount = useRef(true);
    const previousSelectionRef = useRef<{ from: number, to: number } | null>(null);

    // Link dialog state
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [hasSelection, setHasSelection] = useState(false);



    // Clear content dialog state
    const [clearDialogOpen, setClearDialogOpen] = useState(false);

    // Create a stable callback for onChange
    const handleChange = useCallback((html: string) => {
        onChange(html);
    }, [onChange]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline',
                    rel: 'noopener noreferrer',
                }
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
            }),
            Placeholder.configure({
                placeholder,
                showOnlyWhenEditable: true,
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'focus:outline-none w-full min-h-[200px]',
            },
        },
        onUpdate: ({ editor }) => {
            handleChange(editor.getHTML());
        },
        onSelectionUpdate: ({ editor }) => {
            // Save current selection for later use
            const { from, to } = editor.state.selection;
            previousSelectionRef.current = { from, to };

            // Update selection state
            const hasTextSelected = !editor.state.selection.empty;
            setHasSelection(hasTextSelected);

            if (hasTextSelected) {
                const selectedText = editor.state.doc.textBetween(from, to, ' ');
                setLinkText(selectedText);
            }
        },
        onFocus: () => {
            // This ensures focus behavior works correctly
        },
        onBlur: () => {
            // Optional: Store selection on blur for potential recovery
        }
    });


    useEffect(() => {
        if (!editor || !value) return;

        // Process the content to see if there are alignment styles
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = value;

        // Find elements with text-align styles
        const elementsWithAlign = tempDiv.querySelectorAll('[style*="text-align"]');

        if (elementsWithAlign.length > 0) {
            // Set editor content first
            editor.commands.setContent(value);

            // Small delay to ensure content is set before we try to select elements
            setTimeout(() => {
                // For debug purposes
                console.log("Found elements with alignment:", elementsWithAlign.length);

                // Force editor to recognize the alignments by checking DOM
                editor.view.dom.querySelectorAll('[style*="text-align"]').forEach(node => {
                    const alignValue = (node as HTMLElement).style.textAlign;
                    if (alignValue) {
                        // This forces editor to update its internal state
                        const domPos = editor.view.posAtDOM(node, 0);
                        if (domPos !== undefined) {
                            editor.commands.setTextSelection(domPos);
                            editor.commands.setTextAlign(alignValue);
                        }
                    }
                });

                // Restore cursor to beginning after processing
                editor.commands.setTextSelection(0);
            }, 50);
        } else {
            // No alignment found, just set content normally
            editor.commands.setContent(value);
        }
    }, [editor, value]);

    // Handle external value changes (when editing existing content)
    useEffect(() => {
        if (!editor || isInitialMount.current) {
            return;
        }

        const currentContent = editor.getHTML();
        if (value !== currentContent) {
            // Preserve selection if possible
            const selection = previousSelectionRef.current;

            editor.commands.setContent(value, false);

            // Restore selection after content change if it exists
            if (selection) {
                try {
                    editor.commands.setTextSelection(selection);
                } catch (e) {
                    console.log("Could not restore selection");
                }
            }
        }
    }, [editor, value]);

    // Setup editor on mount
    useEffect(() => {
        if (editor && isInitialMount.current) {
            const timer = setTimeout(() => {
                editor.commands.focus('end');
                isInitialMount.current = false;
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [editor]);

    // Handle focus issues
    const ensureFocus = useCallback(() => {
        if (editor && !editor.isFocused) {
            editor.commands.focus();
        }
    }, [editor]);

    // Clear content handler
    const handleClearContent = () => {
        setClearDialogOpen(true);
    };

    const confirmClearContent = () => {
        if (editor) {
            editor.commands.clearContent(true);
            editor.commands.focus();
        }
        setClearDialogOpen(false);
    };

    if (!editor) {
        return null;
    }

    // Format selected text or apply at cursor position
    const applyFormat = (formatFn: () => boolean) => {
        ensureFocus();

        // Get current selection before applying format
        const { from, to } = editor.state.selection;
        const hasTextSelected = from !== to;

        // Apply the formatting
        formatFn();

        // If no text was selected, ensure cursor is still active for typing
        if (!hasTextSelected) {
            editor.commands.focus();
        }
    };

    const openLinkDialog = () => {
        // Store current selection for later use
        previousSelectionRef.current = {
            from: editor.state.selection.from,
            to: editor.state.selection.to
        };

        // Check if there's already a link
        if (editor.isActive('link')) {
            const attrs = editor.getAttributes('link');
            setLinkUrl(attrs.href || '');
        } else {
            setLinkUrl('https://');
        }

        // Store selection text for link text input
        if (!hasSelection) {
            setLinkText('');
        }

        setLinkDialogOpen(true);
    };

    const applyLink = () => {
        // Restore selection if it exists
        const selection = previousSelectionRef.current;
        if (selection && editor) {
            try {
                editor.commands.setTextSelection(selection);
            } catch (e) {
                // If selection can't be restored, just continue
            }
        }

        // Focus editor before applying changes
        ensureFocus();

        if (!linkUrl || linkUrl === 'https://') {
            // Remove link if URL is empty or default
            editor.chain().focus().unsetLink().run();
        } else {
            // If no selection but linkText provided, insert text and make it a link
            if (!hasSelection && linkText) {
                editor.commands.insertContent(linkText);
                editor.commands.setTextSelection({
                    from: editor.state.selection.from - linkText.length,
                    to: editor.state.selection.from
                });
            }

            // Apply link to selection
            editor.chain().focus().setLink({ href: linkUrl }).run();
        }

        setLinkDialogOpen(false);
    };

    const applyHeading = (level: any) => {
        ensureFocus();
        editor.chain().focus().toggleHeading({ level }).run();

        // Ensure cursor remains visible after heading toggle
        const pos = editor.state.selection.from;
        setTimeout(() => {
            editor.commands.setTextSelection(pos);
        }, 10);
    };

    // EditorButton component with tooltip for better UX
    const EditorButton = ({
        onClick,
        isActive = false,
        label,
        disabled = false,
        children
    }: EditorButtonProps) => (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={onClick}
                        className={cn(
                            "p-2 rounded-md transition-colors",
                            isActive
                                ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                                : "hover:bg-gray-100 dark:hover:bg-gray-800",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                        type="button"
                        disabled={disabled}
                        aria-label={label}
                    >
                        {children}
                    </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{label}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );

    const Divider = () => (
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
    );

    return (
        <div className={cn("border rounded-md border-input overflow-hidden", className)}>
            {/* Toolbar */}
            <div className="border-b border-input bg-muted/30 px-3 py-2 flex flex-wrap gap-1">
                {/* Text formatting */}
                <EditorButton
                    onClick={() => applyFormat(() => editor.chain().toggleBold().run())}
                    isActive={editor.isActive('bold')}
                    label="Bold"
                >
                    <Bold className="h-5 w-5" />
                </EditorButton>

                <EditorButton
                    onClick={() => applyFormat(() => editor.chain().toggleItalic().run())}
                    isActive={editor.isActive('italic')}
                    label="Italic"
                >
                    <Italic className="h-5 w-5" />
                </EditorButton>

                <Divider />

                {/* Headings */}
                <EditorButton
                    onClick={() => applyHeading(1)}
                    isActive={editor.isActive('heading', { level: 1 })}
                    label="Heading 1"
                >
                    <Heading1 className="h-5 w-5" />
                </EditorButton>

                <EditorButton
                    onClick={() => applyHeading(2)}
                    isActive={editor.isActive('heading', { level: 2 })}
                    label="Heading 2"
                >
                    <Heading2 className="h-5 w-5" />
                </EditorButton>

                <EditorButton
                    onClick={() => applyHeading(3)}
                    isActive={editor.isActive('heading', { level: 3 })}
                    label="Heading 3"
                >
                    <Heading3 className="h-5 w-5" />
                </EditorButton>

                <Divider />

                {/* Text alignment */}
                <EditorButton
                    onClick={() => applyFormat(() => editor.chain().focus().setTextAlign('left').run())}
                    isActive={editor.isActive({ textAlign: 'left' })}
                    label="Align Left"
                >
                    <AlignLeft className="h-5 w-5" />
                </EditorButton>

                <EditorButton
                    onClick={() => applyFormat(() => editor.chain().focus().setTextAlign('center').run())}
                    isActive={editor.isActive({ textAlign: 'center' })}
                    label="Align Center"
                >
                    <AlignCenter className="h-5 w-5" />
                </EditorButton>

                <EditorButton
                    onClick={() => applyFormat(() => editor.chain().focus().setTextAlign('right').run())}
                    isActive={editor.isActive({ textAlign: 'right' })}
                    label="Align Right"
                >
                    <AlignRight className="h-5 w-5" />
                </EditorButton>

                <Divider />

                {/* Special formats */}
                <EditorButton
                    onClick={openLinkDialog}
                    isActive={editor.isActive('link')}
                    label="Link"
                >
                    <LinkIcon className="h-5 w-5" />
                </EditorButton>

                <Divider />

                {/* Editor actions */}
                <EditorButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    label="Undo"
                >
                    <Undo className="h-5 w-5" />
                </EditorButton>

                <EditorButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    label="Redo"
                >
                    <Redo className="h-5 w-5" />
                </EditorButton>

                <EditorButton
                    onClick={handleClearContent}
                    label="Clear"
                >
                    <Trash2 className="h-5 w-5" />
                </EditorButton>
            </div>

            {/* Editor Content */}
            <EditorContent
                editor={editor}
                className="prose prose-sm dark:prose-invert max-w-none min-h-[300px] p-4"
                onClick={ensureFocus}
            />

            {/* Link Dialog */}
            <Dialog
                open={linkDialogOpen}
                onOpenChange={(open) => {
                    setLinkDialogOpen(open);
                    if (!open) {
                        ensureFocus();
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editor.isActive('link') ? 'Edit Link' : 'Add Link'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {!hasSelection && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="linkText" className="text-right">
                                    Text
                                </Label>
                                <Input
                                    id="linkText"
                                    value={linkText}
                                    onChange={(e) => setLinkText(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Link text"
                                    autoFocus
                                />
                            </div>
                        )}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="linkUrl" className="text-right">
                                URL
                            </Label>
                            <Input
                                id="linkUrl"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://example.com"
                                className="col-span-3"
                                autoFocus={hasSelection}
                            />
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setLinkDialogOpen(false);
                                ensureFocus();
                            }}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={applyLink}
                            disabled={!hasSelection && !linkText}
                        >
                            <Check className="mr-2 h-4 w-4" />
                            {editor.isActive('link') ? 'Update' : 'Add'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Clear Content Confirmation Dialog */}
            <Dialog
                open={clearDialogOpen}
                onOpenChange={(open) => {
                    setClearDialogOpen(open);
                    if (!open) {
                        ensureFocus();
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Clear All Content</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to clear all content? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setClearDialogOpen(false);
                                ensureFocus();
                            }}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmClearContent}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear All
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};