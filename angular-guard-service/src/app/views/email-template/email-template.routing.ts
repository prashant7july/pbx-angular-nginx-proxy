import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { CreateEmailTemplateComponent } from './create-email-template/create-email-template.component';
import { ViewEmailTemplateComponent } from './view-email-template/view-email-template.component';
// import { ManageEmailTemplateComponent } from './manage-email-template/manage-email-template.component';
import { EmailCategoryComponent } from './email-category/email-category.component';

const routes: Routes = [
    {
        path: '', data: { title: 'Email Template' },
        children: [
            { path: '', redirectTo: 'view' },
            // { path: 'create', component: CreateEmailTemplateComponent, data: { title: 'Create Email Template' } },
            { path: 'view', component: ViewEmailTemplateComponent, data: { title: 'View Email Template' } },
            // { path: 'manage', component: ManageEmailTemplateComponent, data: { title: 'Manage Email Template' } },
            { path: 'category', component: EmailCategoryComponent, data: { title: 'Email Category' } }
                                
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmailTemplateRoutingModule { }

export const emailTemplateComponents = [
    // CreateEmailTemplateComponent,
    ViewEmailTemplateComponent,
    // ManageEmailTemplateComponent,
    EmailCategoryComponent
];

