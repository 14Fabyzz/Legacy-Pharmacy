import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ToastMessage {
    message: string;
    type: 'success' | 'error' | 'warning';
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toastSubject = new BehaviorSubject<ToastMessage | null>(null);
    public toastState$: Observable<ToastMessage | null> = this.toastSubject.asObservable();

    private timeoutId: any;

    constructor() { }

    showSuccess(message: string): void {
        this.show(message, 'success');
    }

    showError(message: string): void {
        this.show(message, 'error');
    }

    showWarning(message: string): void {
        this.show(message, 'warning');
    }

    private show(message: string, type: 'success' | 'error' | 'warning'): void {
        this.clear(); // Clear existing
        this.toastSubject.next({ message, type });

        // Auto clear after 4 seconds
        this.timeoutId = setTimeout(() => {
            this.clear();
        }, 4000);
    }

    clear(): void {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        this.toastSubject.next(null);
    }
}
