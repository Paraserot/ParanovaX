
"use client";

import { useState, useRef, useCallback } from 'react';
import { UploadCloud, X, File as FileIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in MB
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function FileUpload({ onFileChange, accept = "image/png, image/jpeg, image/gif, application/pdf", maxSize = 5 }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback((selectedFile: File | null) => {
    if (selectedFile) {
        if (selectedFile.size > maxSize * 1024 * 1024) { 
            toast({
                variant: 'destructive',
                title: 'File Too Large',
                description: `Please upload a file smaller than ${maxSize}MB.`,
            });
            return;
        }
        setFile(selectedFile);
        onFileChange(selectedFile);
    }
  }, [onFileChange, toast, maxSize]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    onFileChange(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  if (file) {
    return (
        <div className="p-4 border rounded-lg bg-muted/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <FileIcon className="h-8 w-8 text-primary" />
                <div>
                    <p className="text-sm font-medium truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
            </div>
            <button
                type="button"
                onClick={handleRemoveFile}
                className="text-muted-foreground hover:text-destructive"
            >
                <X className="h-5 w-5" />
            </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        className="hidden"
        accept={accept}
      />
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <UploadCloud className="h-10 w-10" />
        <p className="font-semibold">Drag & drop a file here, or click to select</p>
        <p className="text-xs">Max file size: {maxSize}MB</p>
      </div>
    </div>
  );
}
