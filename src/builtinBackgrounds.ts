import type { BackgroundMedia } from './backgroundMedia'

// Repository-hosted backgrounds are the complete built-in media library.
// Keeping this list local-only makes the editor deterministic and avoids
// runtime dependency on external media hosts.
export const BUILTIN_BACKGROUND_SOURCES: BackgroundMedia[] = [
  { id:'local-background-1', name:'Background 1', kind:'image', url:'/backgrounds/Background (1).avif', thumbnailUrl:'/backgrounds/Background (1).avif', author:'Waraq media library', license:'User-provided', attribution:'Waraq media library', sourceUrl:'/backgrounds/Background (1).avif', verifiedRights:false },
  { id:'local-background-2', name:'Background 2', kind:'image', url:'/backgrounds/Backgrounds (1).jpg', thumbnailUrl:'/backgrounds/Backgrounds (1).jpg', author:'Waraq media library', license:'User-provided', attribution:'Waraq media library', sourceUrl:'/backgrounds/Backgrounds (1).jpg', verifiedRights:false },
  { id:'local-background-3', name:'Background 3', kind:'image', url:'/backgrounds/Backgrounds (2).jpg', thumbnailUrl:'/backgrounds/Backgrounds (2).jpg', author:'Waraq media library', license:'User-provided', attribution:'Waraq media library', sourceUrl:'/backgrounds/Backgrounds (2).jpg', verifiedRights:false },
  { id:'local-background-4', name:'Background 4', kind:'image', url:'/backgrounds/Backgrounds (3).jpg', thumbnailUrl:'/backgrounds/Backgrounds (3).jpg', author:'Waraq media library', license:'User-provided', attribution:'Waraq media library', sourceUrl:'/backgrounds/Backgrounds (3).jpg', verifiedRights:false },
  { id:'local-background-5', name:'Background 5', kind:'image', url:'/backgrounds/Backgrounds (4).avif', thumbnailUrl:'/backgrounds/Backgrounds (4).avif', author:'Waraq media library', license:'User-provided', attribution:'Waraq media library', sourceUrl:'/backgrounds/Backgrounds (4).avif', verifiedRights:false },
  { id:'local-video-1', name:'Video 1', kind:'video', url:'/backgrounds/videos/153821-806526710_medium.mp4', thumbnailUrl:'/backgrounds/videos/153821-806526710_medium.mp4', author:'Waraq media library', license:'User-provided', attribution:'Waraq media library', sourceUrl:'/backgrounds/videos/153821-806526710_medium.mp4', verifiedRights:false },
  { id:'local-video-2', name:'Video 2', kind:'video', url:'/backgrounds/videos/186714-878826932_medium.mp4', thumbnailUrl:'/backgrounds/videos/186714-878826932_medium.mp4', author:'Waraq media library', license:'User-provided', attribution:'Waraq media library', sourceUrl:'/backgrounds/videos/186714-878826932_medium.mp4', verifiedRights:false },
  { id:'local-video-3', name:'Video 3', kind:'video', url:'/backgrounds/videos/336603_medium.mp4', thumbnailUrl:'/backgrounds/videos/336603_medium.mp4', author:'Waraq media library', license:'User-provided', attribution:'Waraq media library', sourceUrl:'/backgrounds/videos/336603_medium.mp4', verifiedRights:false },
]

// Kept for backwards-compatible imports. It intentionally contains no remote
// media links; the editor's built-in library is local-only.
export const FREE_MEDIA_DIRECTORIES: { id:string; name:string; url:string }[] = []
