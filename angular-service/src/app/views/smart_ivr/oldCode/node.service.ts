// import {
//   ComponentRef,
//   ComponentFactoryResolver,
//   Injectable,
//   Inject,
//   ReflectiveInjector
// } from '@angular/core';
// import { jsPlumb } from 'jsplumb';

// import { NodeComponent, Node } from './node.component';

// @Injectable()
// export class NodeService {

//   private rootViewContainer: any;

//   jsPlumbInstance = jsPlumb.getInstance();

//   constructor(private factoryResolver: ComponentFactoryResolver, ) { }

//   public setRootViewContainerRef(viewContainerRef) {
//     this.rootViewContainer = viewContainerRef;
//   }

//   public addDynamicNode(node: Node) {
//     const factory = this.factoryResolver.resolveComponentFactory(NodeComponent);
//     // console.log('@@@@@@@@@@@@@@', factory)
//     const component = factory.create(this.rootViewContainer.parentInjector);
//     console.log("44444444444444444444444444", node);
//     console.log("44444444444444444444444444", this.jsPlumbInstance);
//     (<any>component.instance).node = node;
//     (<any>component.instance).jsPlumbInstance = this.jsPlumbInstance;
//     this.rootViewContainer.insert(component.hostView);
//     // console.log("in NodeService..", component.instance, component.hostView);
//   }

//   addConnection(connection) {
//     this.jsPlumbInstance.connect({ uuids: connection.uuids });
//   }

//   public clear() {
//     this.rootViewContainer.clear();
//   }
// }

