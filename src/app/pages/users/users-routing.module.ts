import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersListComponent } from './users-list/users-list.component';
import { UserFormComponent } from './user-form/user-form.component';

const routes: Routes = [
    { path: '', component: UsersListComponent },
    { path: 'create', component: UserFormComponent }, // Changed from 'new' to 'create' per request
    { path: 'edit/:id', component: UserFormComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UsersRoutingModule { }
