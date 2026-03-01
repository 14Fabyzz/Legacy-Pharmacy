import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreateUserRequest, UpdateUserRequest, UserDetail } from '../../../core/models/user.model';

@Component({
    selector: 'app-user-form',
    standalone: false,
    templateUrl: './user-form.component.html',
    styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
    userForm: FormGroup;
    isEditMode = false;
    userId?: number;
    submitted = false;
    loading = false; // For submit button
    dataLoading = false; // For initial data fetch
    error: string | null = null;
    originalEnabledState = true; // Track original state for comparison
    showPassword = false; // For password visibility toggle
    successMessage: string | null = null;

    // NOTA: Roles hardcoded - Idealmente deberían venir de un endpoint del backend
    // TODO: Crear endpoint GET /api/usuarios/roles en el backend y consumirlo aquí
    // Por ahora se mantienen los roles conocidos hasta que el backend provea el endpoint
    roles = [
        { id: 1, nombre: 'ADMINISTRADOR' },
        { id: 2, nombre: 'CAJERO' },
        { id: 3, nombre: 'AUDITOR' }
    ];

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private authService: AuthService
    ) {
        this.userForm = this.fb.group({
            nombreCompleto: ['', Validators.required],
            cedula: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
            login: ['', [Validators.required, Validators.minLength(4)]],
            password: ['', [Validators.minLength(8), Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/)]],
            rolId: [2, Validators.required],
            sucursalId: [1, Validators.required],
            enabled: [true]
        });
    }

    ngOnInit(): void {
        console.log('UserFormComponent: ngOnInit executed');
        const isAdmin = this.authService.isAdmin();
        console.log('Is Admin:', isAdmin, 'Role:', this.authService.getRole());

        if (!isAdmin) {
            console.warn('Access denied. Redirecting to dashboard...');
            // Temporarily disabling redirect to debug if the route itself is broken
            // this.router.navigate(['/app/dashboard']);
            // return;
        }

        this.userId = Number(this.route.snapshot.paramMap.get('id'));
        this.isEditMode = !!this.userId;

        const passwordValidators = [
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/)
        ];

        if (this.isEditMode) {
            this.loadUser(this.userId!);
            this.userForm.get('password')?.setValidators(passwordValidators);
        } else {
            this.userForm.get('password')?.setValidators([Validators.required, ...passwordValidators]);
        }
        this.userForm.get('password')?.updateValueAndValidity();
    }

    private loadUser(id: number): void {
        this.dataLoading = true;
        this.userService.getById(id).subscribe({
            next: (user: UserDetail) => {
                this.dataLoading = false;
                if (user) {
                    this.userForm.patchValue({
                        nombreCompleto: user.nombreCompleto,
                        cedula: user.cedula,
                        login: user.login,
                        rolId: user.rolId,
                        sucursalId: user.sucursalId,
                        enabled: user.estado === 'ACTIVO'
                    });
                    // Store original state to detect changes
                    this.originalEnabledState = user.estado === 'ACTIVO';
                    // Disable username/email if they cannot be changed? The Requirement UpdateUserRequest only has nombre, apellido, role.
                    // So we should probably disable username/email or just ignore them on submit.
                    this.userForm.get('login')?.disable();
                    // this.userForm.get('email')?.disable(); // Assuming 'email' is not used, 'login' is the identifier
                } else {
                    this.error = 'Usuario no encontrado';
                    this.userForm.get('login')?.disable();
                }
            },
            error: (err: any) => {
                this.dataLoading = false;
                this.error = 'Error al cargar los datos del usuario.';
                console.error(err);
            }
        });
    }

    onSubmit(): void {
        this.submitted = true;
        this.error = null;

        if (this.userForm.invalid) {
            return;
        }

        this.loading = true;

        if (this.isEditMode) {
            const formData: UpdateUserRequest = {
                nombreCompleto: this.userForm.get('nombreCompleto')?.value,
                cedula: this.userForm.get('cedula')?.value,
                rolId: this.userForm.get('rolId')?.value,
                estado: this.userForm.get('enabled')?.value ? 'ACTIVO' : 'INACTIVO'
            };

            const passwordValue = this.userForm.get('password')?.value;
            if (passwordValue) {
                formData.password = passwordValue;
            }

            const currentEnabledState = this.userForm.get('enabled')?.value;
            const stateChanged = currentEnabledState !== this.originalEnabledState;

            this.userService.update(this.userId!, formData).subscribe({
                next: () => {
                    alert('¡Usuario actualizado correctamente!');
                    // If enabled state changed, call toggleStatus
                    if (stateChanged) {
                        const nuevoEstado: 'ACTIVO' | 'INACTIVO' = currentEnabledState ? 'ACTIVO' : 'INACTIVO';
                        this.userService.cambiarEstado(this.userId!, nuevoEstado).subscribe({
                            next: () => this.router.navigate(['/app/users']),
                            error: () => {
                                this.error = 'Error al cambiar el estado del usuario';
                                this.loading = false;
                            }
                        });
                    } else {
                        this.router.navigate(['/app/users']);
                    }
                },
                error: () => {
                    this.error = 'Error al actualizar usuario';
                    this.loading = false;
                }
            });

        } else {
            const formData: CreateUserRequest = {
                nombreCompleto: this.userForm.get('nombreCompleto')?.value,
                cedula: this.userForm.get('cedula')?.value,
                login: this.userForm.get('login')?.value,
                rolId: this.userForm.get('rolId')?.value,
                sucursalId: this.userForm.get('sucursalId')?.value,
                password: this.userForm.get('password')?.value
            };

            this.userService.create(formData).subscribe({
                next: () => {
                    alert('¡Usuario registrado correctamente!');
                    this.router.navigate(['/app/users']);
                },
                error: (err: any) => {
                    console.error(err);
                    this.error = 'Error al crear usuario';
                    this.loading = false;
                }
            });
        }
    }

    // Helper para validaciones en el template
    get f() { return this.userForm.controls; }

    /**
     * Genera una contraseña aleatoria segura que cumple con todos los requisitos:
     * - Mínimo 8 caracteres
     * - Al menos 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial (@#$%^&+=!)
     */
    generateRandomPassword(): void {
        const length = 12;
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const specialChars = '@#$%^&+=!';

        // Asegurar que la contraseña tenga al menos un carácter de cada tipo
        let password = '';
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += specialChars[Math.floor(Math.random() * specialChars.length)];

        // Rellenar el resto con caracteres aleatorios de todos los tipos
        const allChars = lowercase + uppercase + numbers + specialChars;
        for (let i = password.length; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

        // Mezclar los caracteres para que no sean predecibles
        password = password.split('').sort(() => Math.random() - 0.5).join('');

        // Actualizar el campo del formulario
        this.userForm.patchValue({ password });

        // Mostrar la contraseña generada
        this.showPassword = true;
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }
}
