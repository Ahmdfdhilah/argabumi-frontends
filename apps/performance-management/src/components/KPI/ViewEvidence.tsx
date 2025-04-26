import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { Download, FileText, Eye } from 'lucide-react';
import { useToast } from '@workspace/ui/components/sonner';
import { evidenceService, KPIEvidence } from '@/services/evidenceService';
import { format } from 'date-fns';

interface ViewEvidenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  evidences: KPIEvidence[];
  // submissionId: number;
}

const ViewEvidenceDialog: React.FC<ViewEvidenceDialogProps> = ({
  isOpen,
  onClose,
  evidences,
  // submissionId
}) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState<Record<number, boolean>>({});

  const fileTypeIconMap: Record<string, React.ReactNode> = {
    'pdf': <FileText className="h-5 w-5 text-red-500" />,
    'doc': <FileText className="h-5 w-5 text-blue-500" />,
    'docx': <FileText className="h-5 w-5 text-blue-500" />,
    'xls': <FileText className="h-5 w-5 text-green-500" />,
    'xlsx': <FileText className="h-5 w-5 text-green-500" />,
    'jpg': <FileText className="h-5 w-5 text-purple-500" />,
    'jpeg': <FileText className="h-5 w-5 text-purple-500" />,
    'png': <FileText className="h-5 w-5 text-purple-500" />
  };

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const getFileIcon = (filename: string): React.ReactNode => {
    const extension = getFileExtension(filename);
    return fileTypeIconMap[extension] || <FileText className="h-5 w-5 text-gray-500" />;
  };

  const handleDownload = async (evidence: KPIEvidence) => {
    setIsDownloading({ ...isDownloading, [evidence.evidence_id]: true });

    try {
      const blob = await evidenceService.downloadEvidence(evidence.evidence_id);

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = evidence.evidence_file_name;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'File downloaded successfully',
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading({ ...isDownloading, [evidence.evidence_id]: false });
    }
  };

  const handlePreview = (evidence: KPIEvidence) => {
    // Create file URL for preview
    const fileUrl = evidenceService.getEvidenceFileUrl(evidence.evidence_file_path);
    window.open(fileUrl, '_blank');
  };

  const canPreviewFile = (filename: string): boolean => {
    const extension = getFileExtension(filename);
    return ['pdf', 'jpg', 'jpeg', 'png'].includes(extension);
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg w-full max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Evidence Files
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-80 overflow-y-auto">
            {evidences.length > 0 ? (
              evidences.map((evidence) => (
                <div
                  key={evidence.evidence_id}
                  className="py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex-shrink-0 hidden sm:block">
                      {getFileIcon(evidence.evidence_file_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center sm:hidden mb-1">
                        <div className="flex-shrink-0 mr-2">
                          {getFileIcon(evidence.evidence_file_name)}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(evidence.evidence_upload_date)}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-all sm:break-normal sm:truncate" title={evidence.evidence_file_name}>
                          {evidence.evidence_file_name.length > 25 ? evidence.evidence_file_name.slice(0, 25) + '...' : evidence.evidence_file_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                          Uploaded on {formatDate(evidence.evidence_upload_date)}
                        </p>
                        {evidence.evidence_description && (
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 break-words">
                            {evidence.evidence_description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex gap-2 justify-end">
                      {canPreviewFile(evidence.evidence_file_name) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-600"
                          onClick={() => handlePreview(evidence)}
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Preview</span>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600"
                        onClick={() => handleDownload(evidence)}
                        disabled={isDownloading[evidence.evidence_id]}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                No evidence files found
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewEvidenceDialog;