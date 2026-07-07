import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3 my-4 text-sm">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <p className="font-medium">{message}</p>
    </div>
  );
};

export default ErrorMessage;
