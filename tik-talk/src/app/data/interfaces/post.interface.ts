import { Profile } from "./profile.interface";

export interface Post {
    id: string;
    authorId: string; //username
    author: Profile; //user profile
    content: string;
    parentId: string | null; //string - id of parent, null - initial post
    likesCount: number;
    isLikedByMe: boolean;
    repliesCount: number;
    createdAt: string;  
}
