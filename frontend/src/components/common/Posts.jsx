import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { BiRepost } from "react-icons/bi";

const Posts = ({ feedType, username, userId }) => {
	const getPostEndpoint = () => {
		switch (feedType) {
			case "forYou":
				return "/posts/all";
			case "following":
				return "/posts/following";
			case "posts":
				return `/posts/user/${username}`;
			case "likes":
				return `/posts/likes/${userId}`;
			default:
				return "/posts/all";
		}
	};

	const POST_ENDPOINT = getPostEndpoint();

	const {
		data: posts,
		isLoading,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			try {
				const res = await fetch(`/api${POST_ENDPOINT}`, 
					{
						method: 'GET',
						credentials: "include",
					}
				);
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}

				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	useEffect(() => {
		refetch();
	}, [feedType, refetch, username]);

	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isRefetching && posts?.length === 0 && (
				<p className='text-center my-4'>No posts in this tab. Switch 👻</p>
			)}
			{!isLoading && !isRefetching && posts && (
				<div>
					{posts.map((post) => (
						<div key={post._id}>
							<div className="flex gap-1 flex-row ">
								{post.retweetStatus.isRetweet && (
									<div key={post._id} className='h-6 text-center m-0 pl-6 text-slate-700'>
										<BiRepost  className="w-6 h-6 m-2 inline-block"/> 
										{post.retweetStatus.retweeter.fullname} reposted
									</div>
								)}
							</div>
							<Post post={post} />
						</div>
					))}
				</div>
			)}
		</>
	);
};
export default Posts;