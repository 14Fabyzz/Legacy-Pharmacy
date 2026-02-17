import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';

@Component({
    selector: 'app-toast',
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class ToastComponent implements OnInit, OnDestroy {
    toast: ToastMessage | null = null;
    private subscription: Subscription = new Subscription();

    constructor(private toastService: ToastService) { }

    ngOnInit(): void {
        this.subscription = this.toastService.toastState$.subscribe(toast => {
            this.toast = toast;
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    close(): void {
        this.toastService.clear();
    }
}
