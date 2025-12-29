/**
 * Unified Skeleton Export
 * Consolidates Skeleton and ShimmerSkeleton into a single API
 */

export {
  Skeleton,
  SkeletonMessage,
  SkeletonCard,
  SkeletonRow,
  SkeletonList,
} from './Skeleton'

// Re-export ShimmerSkeleton as SkeletonShimmer for backward compatibility
export { ShimmerSkeleton as SkeletonShimmer } from './ShimmerSkeleton'

// Main export - use Skeleton for new code
export { Skeleton as default } from './Skeleton'

