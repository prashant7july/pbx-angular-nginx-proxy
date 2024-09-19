// import { ApiService } from '../../core';
// import {  ComponentRef,  ComponentFactoryResolver,  Injectable,  Inject,  ReflectiveInjector} from '@angular/core';
// import { jsPlumb } from 'jsplumb';

// import { NodeComponent, Node } from '../smart_ivr/node.component';

// @Injectable({
//   providedIn: 'root'
// })
// export class IVRService {
//   errors = "";
//   private rootViewContainer: any;

//   jsPlumbInstance = jsPlumb.getInstance(); 

//   constructor(private apiService: ApiService, private factoryResolver: ComponentFactoryResolver) { }

//   public setRootViewContainerRef(viewContainerRef) {
//     this.rootViewContainer = viewContainerRef;
//   }

//   public addDynamicNode(node: Node) {
//     const factory = this.factoryResolver.resolveComponentFactory(NodeComponent);
//     const component = factory.create(this.rootViewContainer.parentInjector);
//     (<any>component.instance).node = node;
//     (<any>component.instance).jsPlumbInstance = this.jsPlumbInstance;
//     this.rootViewContainer.insert(component.hostView);
//     console.log("in NodeService.." , component.instance );
//   }

//   addConnection(connection) {
//     this.jsPlumbInstance.connect({ uuids: connection.uuids });
//   }

//   public clear() {
//     this.rootViewContainer.clear();
//   }

// }
