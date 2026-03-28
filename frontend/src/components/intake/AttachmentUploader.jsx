import React, { useRef, useState } from 'react';

export default function AttachmentUploader({ files, onChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const pushFiles = (incomingFiles) => {
    const next = [...files, ...Array.from(incomingFiles)];
    onChange(next);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      pushFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (indexToRemove) => {
    onChange(files.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'
        }`}
      >
        <p className="font-semibold text-gray-800">Drop files here or click to upload</p>
        <p className="text-sm text-gray-500 mt-1">Images, PDFs, audio files (optional)</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              pushFiles(e.target.files);
            }
          }}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 bg-white">
              <div>
                <p className="text-sm font-semibold text-gray-800">{file.name}</p>
                <p className="text-xs text-gray-500">{Math.ceil(file.size / 1024)} KB</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-sm text-red-600 font-semibold hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
