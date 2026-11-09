"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 rounded-md ${className}`}
    />
  );
}

export function TableSkeleton({ rows = 6, cols = 8 }: { rows?: number; cols?: number }) {
  return (
    <div className="card-retro bg-white p-4 space-y-4 border-2 border-retro-border shadow-retro-sm overflow-hidden">
      {/* Header skeleton */}
      <div className="flex justify-between items-center pb-3 border-b-2 border-slate-100">
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      {/* Table rows skeleton */}
      <div className="space-y-2.5">
        {/* Table header bar */}
        <div className="grid grid-cols-12 gap-2 p-2.5 bg-slate-100 rounded-lg">
          <Skeleton className="col-span-1 h-4" />
          <Skeleton className="col-span-3 h-4" />
          <Skeleton className="col-span-1 h-4" />
          <Skeleton className="col-span-1 h-4" />
          <Skeleton className="col-span-1 h-4" />
          <Skeleton className="col-span-1 h-4" />
          <Skeleton className="col-span-2 h-4" />
          <Skeleton className="col-span-2 h-4" />
        </div>

        {/* Dynamic rows */}
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={rIdx}
            className="grid grid-cols-12 gap-2 p-3 bg-white rounded-lg border border-slate-100 items-center"
          >
            <Skeleton className="col-span-1 h-5 w-8" />
            <div className="col-span-3 space-y-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="col-span-1 h-8 rounded-lg" />
            <Skeleton className="col-span-1 h-8 rounded-lg" />
            <Skeleton className="col-span-1 h-8 rounded-lg" />
            <Skeleton className="col-span-1 h-8 rounded-lg" />
            <Skeleton className="col-span-2 h-6 rounded-full" />
            <Skeleton className="col-span-2 h-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className="card-retro p-4 bg-white border-2 border-retro-border shadow-retro-sm space-y-2.5"
        >
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}
