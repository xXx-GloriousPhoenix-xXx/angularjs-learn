import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { Post } from '../../../data/interfaces/post.interface';
import { TimeAgoPipe } from '../../../common-ui/pipes/time-ago-pipe';
import { SvgIconComponent } from "../../../common-ui/svg-icon/svg-icon.component";
import { PostService } from '../../../data/services/post.service';

@Component({
    selector: 'app-removed-post',
    imports: [TimeAgoPipe, SvgIconComponent],
    templateUrl: './removed-post.component.html',
    styleUrl: './removed-post.component.scss',
})
export class RemovedPostComponent {
    @Input() post!: Post;
    @Output() restored = new EventEmitter<string>();

    postService = inject(PostService);
    restoring = false;

    isLikedByMe = signal(false);
    likesCount = signal(0);
    localRepliesCount = signal(0);

    ngOnInit(): void {
        this.isLikedByMe.set(this.post.isLikedByMe ?? false);
        this.likesCount.set(this.post.likesCount ?? 0);
        this.localRepliesCount.set(this.post.repliesCount ?? 0);
    }

    onPostRestore() {
        this.restoring = true;
        this.postService.restorePost(this.post.id).subscribe({
            next: () => {
                this.restored.emit(this.post.id);
                this.restoring = false;
            },
            error: () => {
                this.restoring = false;
            }
        });
    }
}
