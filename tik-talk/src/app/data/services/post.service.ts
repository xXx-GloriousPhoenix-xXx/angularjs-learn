import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Post } from '../interfaces/post.interface';
import { Pagable } from '../interfaces/pagable.interface';

@Service()
export class PostService {
    http = inject(HttpClient);
    baseApiUrl = 'http://localhost:3000';

    /**
     * Loads top-level feed posts (parentId omitted = top level).
     */
    getFeed(pageNum = 1, pageSize = 10, authorUsername?: string) {
        const params: any = { pageNum, pageSize };
        if (authorUsername) {
            params.authorUsername = authorUsername;
        }

        return this.http.get<Pagable<Post>>(`${this.baseApiUrl}/posts`, { params });
    }
 
    /**
     * Loads direct replies to a given post. Note: NOT all descendants —
     * just one level down. The UI recursively calls this again for any
     * reply that itself has repliesCount > 0, when the user expands it.
     */
    getReplies(parentId: string, pageNum = 1, pageSize = 10) {
        return this.http.get<Pagable<Post>>(`${this.baseApiUrl}/posts`, {
            params: { parentId, pageNum, pageSize },
        });
    }
 
    createPost(content: string, parentId: string | null = null) {
        return this.http.post<Post>(`${this.baseApiUrl}/posts`, {
            content,
            parentId,
        });
    }
 
    like(postId: string) {
        return this.http.post<Post>(`${this.baseApiUrl}/posts/${postId}/like`, {});
    }
 
    unlike(postId: string) {
        return this.http.delete<Post>(`${this.baseApiUrl}/posts/${postId}/like`);
    }

    deletePost(postId: string) {
        return this.http.delete(`${this.baseApiUrl}/posts/${postId}`);
    }

    getDeletedPosts() {
        return this.http.get<Post[]>(`${this.baseApiUrl}/posts/trash`);
    }
    
    restorePost(postId: string) {
        return this.http.patch<Post>(`${this.baseApiUrl}/posts/${postId}/restore`, {});
    }

    hardDeletePost(postId: string) {
        return this.http.delete(`${this.baseApiUrl}/posts/${postId}/hard`);
    }
}
