import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewPromptsComponent } from './view-prompts/view-prompts.component';
import { AssociatePromptComponent } from './associate-prompt/associate-prompt.component';
import { MultiPromptResolver } from './multiprompt-resolver';

const routes: Routes = [
    {
        path: '', data: { title: 'Server' },
        children: [
            { path: '', redirectTo: 'view' },
            { path: 'view', component: ViewPromptsComponent, data: { title: 'View Prompts' } },
        { path: 'view/associate-prompt', component: AssociatePromptComponent, resolve: { packageData: MultiPromptResolver },data: { title: 'Plan Prompt' } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PromptsRoutingModule { }
export const promptsComponents = [ViewPromptsComponent];
