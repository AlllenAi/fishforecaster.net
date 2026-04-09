import { CommunityPostDetail } from "@/modules/community/ui/CommunityPostDetail";

export const metadata = {
  title: "Community Post - The Fish Forecaster",
};

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  return <CommunityPostDetail postId={postId} />;
}
