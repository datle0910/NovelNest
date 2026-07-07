import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'detail' | 'table' | 'hero';
  count?: number;
}

const SkeletonBlock: React.FC<{ className: string }> = ({ className }) => (
  <div className={`skeleton ${className}`} />
);

const CardSkeleton = () => (
  <div className="flex flex-col w-full">
    <div className="aspect-[3/4] w-full skeleton rounded-2xl mb-3" />
    <div className="space-y-2 px-0.5">
      <SkeletonBlock className="h-4 w-4/5 rounded-lg" />
      <SkeletonBlock className="h-3 w-3/5 rounded-lg" />
    </div>
  </div>
);

const ListSkeleton = () => (
  <div className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100">
    <SkeletonBlock className="w-16 h-22 rounded-xl shrink-0" />
    <div className="flex-1 space-y-3 py-1">
      <SkeletonBlock className="h-5 w-2/3 rounded-lg" />
      <SkeletonBlock className="h-4 w-1/3 rounded-lg" />
      <SkeletonBlock className="h-4 w-5/6 rounded-lg" />
    </div>
  </div>
);

const TableSkeleton = () => (
  <div className="space-y-3">
    <SkeletonBlock className="h-10 rounded-xl w-full" />
    <SkeletonBlock className="h-14 rounded-xl w-full" />
    <SkeletonBlock className="h-14 rounded-xl w-full" />
    <SkeletonBlock className="h-14 rounded-xl w-full" />
  </div>
);

const DetailSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
    <div className="flex flex-col md:flex-row gap-8">
      <SkeletonBlock className="w-full md:w-56 aspect-[3/4] rounded-xl shrink-0" />
      <div className="flex-1 space-y-4 py-2">
        <SkeletonBlock className="h-8 w-3/4 rounded-lg" />
        <SkeletonBlock className="h-5 w-1/4 rounded-lg" />
        <SkeletonBlock className="h-5 w-1/3 rounded-lg" />
        <SkeletonBlock className="h-24 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card': return <CardSkeleton />;
      case 'list': return <ListSkeleton />;
      case 'table': return <TableSkeleton />;
      case 'detail': return <DetailSkeleton />;
      default: return null;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <React.Fragment key={idx}>{renderSkeleton()}</React.Fragment>
      ))}
    </>
  );
};

export default LoadingSkeleton;
