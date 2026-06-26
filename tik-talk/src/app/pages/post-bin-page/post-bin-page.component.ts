import { Component, inject, signal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { SvgIconComponent } from "../../common-ui/svg-icon/svg-icon.component";
import { RemovedPostComponent } from "./removed-post/removed-post.component";
import { ProfileService } from '../../data/services/profile.service';
import { PostService } from '../../data/services/post.service';
import { Post } from '../../data/interfaces/post.interface';

@Component({
    selector: 'app-post-bin-page',
    imports: [RouterLink, SvgIconComponent, RemovedPostComponent],
    templateUrl: './post-bin-page.component.html',
    styleUrl: './post-bin-page.component.scss',
})
export class PostBinPageComponent {
    profileService = inject(ProfileService);
    postService = inject(PostService);

    me = this.profileService.me;
    posts = signal<Post[]>([]);
    isLoading = signal(false);

    constructor() {
        this.loadTrash();
    }

    loadTrash() {
        this.isLoading.set(true);
        this.postService.getDeletedPosts().subscribe({
            next: (data) => {
                this.posts.set(data);
                this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false)
        });
    }

    onRestored(postId: string) {
        this.posts.update(list => list.filter(p => p.id !== postId));
    }
}
