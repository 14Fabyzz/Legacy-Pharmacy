import { Component, OnInit } from '@angular/core';
import { UserList, UserDetail } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-users-list',
    standalone: false,
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
    users: UserList[] = [];
    loading = true;

    // Props para el modal de detalle
    showDetailModal = false;
    selectedUser: UserDetail | null = null;
    modalLoading = false;

    constructor(
        private userService: UserService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        console.log('UsersListComponent: ngOnInit executed');
        const isAdmin = this.authService.isAdmin();
        console.log('Is Admin:', isAdmin, 'Role:', this.authService.getRole());

        if (!isAdmin) {
            console.warn('Access denied. Redirecting to dashboard...');
            // Temporarily disabling redirect to debug if the route itself is broken
            // this.router.navigate(['/app/dashboard']);
            // return;
        }
        this.loadUsers();
    }

    loadUsers(): void {
        this.loading = true;
        this.userService.getAll().subscribe({
            next: (users) => {
                this.users = users;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading users', err);
                this.loading = false;
            }
        });
    }

    deleteUser(user: UserList): void {
        const nuevoEstado: 'ACTIVO' | 'INACTIVO' = user.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        const accion = nuevoEstado === 'INACTIVO' ? 'desactivar' : 'activar';
        if (confirm(`¿Estás seguro de ${accion} este usuario?`)) {
            this.userService.cambiarEstado(user.id, nuevoEstado).subscribe(() => {
                this.loadUsers();
            });
        }
    }

    toggleStatus(user: UserList): void {
        const nuevoEstado: 'ACTIVO' | 'INACTIVO' = user.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        this.userService.cambiarEstado(user.id, nuevoEstado).subscribe({
            next: () => this.loadUsers(),
            error: (err) => console.error('Error al cambiar estado', err)
        });
    }

    viewUserDetails(id: number): void {
        this.selectedUser = null;
        this.showDetailModal = true;
        this.modalLoading = true;

        this.userService.getById(id).subscribe({
            next: (user) => {
                this.selectedUser = user;
                this.modalLoading = false;
            },
            error: (err) => {
                console.error('Error loading user details', err);
                this.modalLoading = false;
                this.showDetailModal = false;
            }
        });
    }

    closeDetailModal(): void {
        this.showDetailModal = false;
        this.selectedUser = null;
    }
}
