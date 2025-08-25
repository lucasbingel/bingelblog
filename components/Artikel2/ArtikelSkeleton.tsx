"use client";

type ArticleSkeletonProps = {
  blocksCount?: number;
};

export default function ArticleSkeleton({ blocksCount = 8 }: ArticleSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: blocksCount }).map((_, i) => (
        <div key={i} className="h-6 bg-gray-300 rounded animate-pulse" />
      ))}
    </div>
  );
}
