import { Component, inject, signal } from '@angular/core';
import { PostInputComponent } from '../post-input/post-input.component';
import { PostComponent } from '../post/post.component';
import { PostService } from '../../../data/services/post.service';
import { Post } from '../../../data/interfaces/post.interface';
import { ProfileService } from '../../../data/services/profile.service';

@Component({
    selector: 'app-post-feed',
    standalone: true,
    imports: [PostInputComponent, PostComponent],
    templateUrl: './post-feed.component.html',
    styleUrl: './post-feed.component.scss',
})
export class PostFeedComponent {
    private postService = inject(PostService);
    private profileService = inject(ProfileService);

    readonly currentUsername = this.profileService.me()?.username;
 
    posts = signal<Post[]>([]);
    isLoading = signal(true);
 
    constructor() {
        this.loadFeed();
    }
 
    private loadFeed(): void {
        this.postService.getFeed(1, 10, this.currentUsername || undefined).subscribe({
            next: (page) => {
                this.posts.set(page.items);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
            },
        });
    }
 
    onPostCreated(newPost: Post): void {
        this.posts.set([newPost, ...this.posts()]);
    }
}
