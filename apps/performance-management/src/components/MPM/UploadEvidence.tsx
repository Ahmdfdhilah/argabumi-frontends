import { useState, useRef } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { Upload, FileText, X } from 'lucide-react';
import { evidenceService } from '@/services/evidenceService';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';

interface UploadEvidenceDialogProps {
  isOpen: boolean;
  submissionId: number;
  onClose: () => void;
}

const UploadEvidenceDialog: React.FC<UploadEvidenceDialogProps> = ({
  isOpen,
  submissionId,
  onClose,
}) => {
  const [description, setDescription] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setDescription('');
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload PDF, Image, Word, or Excel files.');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await evidenceService.uploadEvidence(
        submissionId,
        selectedFile,
        description || undefined
      );
      if (response) {
        window.location.reload();
      }

      handleClose();
    } catch (error) {
      console.error('Error uploading evidence:', error);
      setError('Failed to upload evidence file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Function to truncate filename if it's too long
  const truncateFilename = (filename: string, maxLength: number = 20): string => {
    if (filename.length <= maxLength) return filename;
    
    const extension = filename.split('.').pop() || '';
    const name = filename.substring(0, filename.lastIndexOf('.'));
    
    // If name is already short, just return the original filename
    if (name.length <= maxLength - (extension.length + 1)) {
      return filename;
    }
    
    // Otherwise truncate the name and add extension
    return `${name.substring(0, maxLength - (extension.length + 4))}...${extension ? `.${extension}` : ''}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Upload Evidence
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive" className="break-words">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide a brief description of the evidence"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file" className="text-gray-700 dark:text-gray-300">
              Evidence File <span className="text-red-500">*</span>
            </Label>
            <div className="flex flex-col gap-3">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 dark:hover:border-gray-500">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />

                {!selectedFile ? (
                  <div
                    className="cursor-pointer w-full flex flex-col items-center justify-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 mb-2" />
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      PDF, Word, Excel or Image files (max 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <div className="flex items-center min-w-0 flex-1 mr-2">
                      <FileText className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate" title={selectedFile.name}>
                          {truncateFilename(selectedFile.name, 25)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={removeSelectedFile}
                      className="text-gray-500 hover:text-red-500 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {!selectedFile && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" /> Select File
                </Button>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            className="bg-[#46B749] hover:bg-[#3a9e3c] text-white w-full sm:w-auto"
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Evidence'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadEvidenceDialog;