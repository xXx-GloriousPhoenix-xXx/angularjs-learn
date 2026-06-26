import { Component, EventEmitter, Input, OnInit, Output, computed, inject, signal } from '@angular/core';
import { SvgIconComponent } from '../../../common-ui/svg-icon/svg-icon.component';
import { PostInputComponent } from '../post-input/post-input.component';
import { Post } from '../../../data/interfaces/post.interface';
import { PostService } from '../../../data/services/post.service';
import { TimeAgoPipe } from '../../../common-ui/pipes/time-ago-pipe';
import { ProfileService } from '../../../data/services/profile.service';

@Component({
    selector: 'app-post',
    standalone: true,
    imports: [
        SvgIconComponent,
        PostInputComponent,
        PostComponent,
        TimeAgoPipe
    ],
    templateUrl: './post.component.html',
    styleUrl: './post.component.scss',
})
export class PostComponent implements OnInit {
    @Input({ required: true }) post!: Post;
    @Input() depth = 0;
    @Output() postDeleted = new EventEmitter<string>();
    
    private postService = inject(PostService);
    private profileService = inject(ProfileService);

    likesCount = signal(0);
    isLikedByMe = signal(false);

    isReplying = signal(false);
    isDeletable = computed(() => {
        const author = this.post.author.username;
        const me = this.profileService.me()!.username;
        return author === me;
    })

    repliesExpanded = signal(false);
    replies = signal<Post[]>([]);
    repliesLoading = signal(false);
    localRepliesCount = signal(0);
    
    rotationStep = signal(0);

    ngOnInit(): void {
        this.likesCount.set(this.post.likesCount);
        this.isLikedByMe.set(this.post.isLikedByMe);
        this.localRepliesCount.set(this.post.repliesCount);
    }

    toggleLike(): void {
        const wasLiked = this.isLikedByMe();
        this.isLikedByMe.set(!wasLiked);
        this.likesCount.set(this.likesCount() + (wasLiked ? -1 : 1));
 
        const request = wasLiked
            ? this.postService.unlike(this.post.id)
            : this.postService.like(this.post.id);
 
        request.subscribe({
            next: (updated) => {
                this.likesCount.set(updated.likesCount);
                this.isLikedByMe.set(updated.isLikedByMe);
            },
            error: () => {
                this.isLikedByMe.set(wasLiked);
                this.likesCount.set(this.likesCount() + (wasLiked ? 1 : -1));
            },
        });
    }

    cancelLike(event: Event) {
        if (!this.isLikedByMe) {
            return;
        }

        event.preventDefault();
        this.toggleLike();
    }

    toggleReplyForm(): void {
        this.isReplying.set(!this.isReplying());
    }

    onReplyPosted(newReply: Post): void {
        this.isReplying.set(false);
        this.replies.set([newReply, ...this.replies()]);
        this.localRepliesCount.set(this.localRepliesCount() + 1);
        this.repliesExpanded.set(true);
    }
 
    toggleReplies(): void {
        const expanding = !this.repliesExpanded();
        this.repliesExpanded.set(expanding);
        this.rotationStep.set(this.rotationStep() + 1); 
 
        if (expanding && this.replies().length === 0 && this.localRepliesCount() > 0) {
            this.loadReplies();
        }
    }

    cancelReplyForm(event: Event) {
        if (!this.isReplying) {
            return;
        }

        event.preventDefault();
        this.toggleReplyForm();
    }

    cancelShowReplies(event: Event) {
        if (!this.repliesExpanded()) {
            return;
        }

        event.preventDefault();
        this.toggleReplies();
    }
 
    private loadReplies(): void {
        this.repliesLoading.set(true);
        this.postService.getReplies(this.post.id).subscribe({
            next: (page) => {
                this.replies.set(page.items);
                this.repliesLoading.set(false);
            },
            error: () => {
                this.repliesLoading.set(false);
            },
        });
    }

    onPostDelete() {
        this.postService.deletePost(this.post.id)
            .subscribe({
                next: () => {
                    this.postDeleted.emit(this.post.id);
                },
                error: (err) => console.error('Delete error', err)
            });
    }
}
