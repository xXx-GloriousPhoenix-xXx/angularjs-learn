import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { ProfileService } from '../../../data/services/profile.service';
import { SvgIconComponent } from "../../../common-ui/svg-icon/svg-icon.component";
import { Post } from '../../../data/interfaces/post.interface';
import { PostService } from '../../../data/services/post.service';

@Component({
    selector: 'app-post-input',
    standalone: true,
    imports: [SvgIconComponent],
    templateUrl: './post-input.component.html',
    styleUrl: './post-input.component.scss',
    host: {
        '[class.--root]': 'isRoot'
    }
})
export class PostInputComponent {
    @Input() isRoot: boolean = false;
    @Input() parentId: string | null = null;
    @Output() posted = new EventEmitter<Post>();

    private profileService = inject(ProfileService);
    private postService = inject(PostService);

    me = this.profileService.me;
    comment = signal<string>('');
    isSending = signal(false);

    onSend(): void {
        const content = this.comment().trim();
        if (!content || this.isSending()) {
            return;
        }
 
        this.isSending.set(true);
 
        this.postService.createPost(content, this.parentId).subscribe({
            next: (newPost) => {
                this.comment.set('');
                this.isSending.set(false);
                this.posted.emit(newPost);
            },
            error: () => {
                this.isSending.set(false);
            },
        });
    }
 
    onSendQuick(event: Event): void {
        event.preventDefault();
        this.onSend();
    }
}
