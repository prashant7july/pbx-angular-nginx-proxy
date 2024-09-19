import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ManageGatewayComponent } from "./manage-gateway/manage-gateway.component";
import { ViewGatewayGroupComponent } from "./view-gateway-group/view-gateway-group.component";
import { ViewGatewayComponent } from "./view-gateway/view-gateway.component";

const routes: Routes = [
  {
    path: "",
    data: { title: "Server" },
    children: [
      { path: "", redirectTo: "view" },
      {
        path: "view",
        component: ViewGatewayComponent,
        data: { title: "View Gateway" },
      },
      {
        path: "manage",
        component: ManageGatewayComponent,
        data: { title: "Manage Gateway" },
      },
      {
        path: "viewGroup",
        component: ViewGatewayGroupComponent,
        data: { title: "View Gateway Group" },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GatewayRoutingModule {}

export const gatewayComponents = [
  ViewGatewayComponent,
  ManageGatewayComponent,
  ViewGatewayGroupComponent,
];
