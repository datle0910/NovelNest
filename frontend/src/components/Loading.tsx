import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-brand-200" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-brand-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
      </div>
    </div>
  );
};

export default Loading;
