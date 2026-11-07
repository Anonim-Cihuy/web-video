import VideoCard from "./VideoCard";
import type { Video } from "@/lib/types";

export default function VideoGrid({ videos }: { videos: Video[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
