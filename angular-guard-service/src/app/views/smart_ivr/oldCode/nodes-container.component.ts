// import { Component, OnInit, OnChanges, Input, ChangeDetectionStrategy, ViewContainerRef, ViewChild } from '@angular/core';
// import { NodeService } from './node.service';



// @Component({
//   selector: 'nodes-container',
//   templateUrl: './nodes-container.component.html',
//   styleUrls: ['./nodes-container.component.css'],
//  // changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class NodesContainerComponent implements OnInit {
//   @Input() nodes = [];

//   @Input() connections = [];

//   @ViewChild('nodes', { read: ViewContainerRef, static:true }) viewContainerRef: ViewContainerRef;

//   constructor(private nodeService: NodeService) {}

//   ngOnInit() {
//     this.nodeService.setRootViewContainerRef(this.viewContainerRef);

//     this.nodes.forEach(node => {
//       this.nodeService.addDynamicNode(node);
//     });
    
//     setTimeout(() => {
//       this.connections.forEach(connection => {
//         this.nodeService.addConnection(connection);
//       });
//     })
//   }  

//   addNode() {
//     const node = { id: "Step id_"  + [Math.random().toString(16).slice(2, 8)] };

//     this.nodeService.addDynamicNode(node);
//   }


//   addNodeNew(){
//     const node = { id: "Second id_"  + [Math.random().toString(16).slice(2, 8)] };

//     this.nodeService.addDynamicNode(node);
//   }
//   saveNodeJson(){
//     //save element position on Canvas and node conections

//     const container = this.viewContainerRef.element.nativeElement.parentNode;
//     const nodes = Array.from(container.querySelectorAll('.node')).map((node: HTMLDivElement) => {
//       return {
//         id: node.id,
//         top: node.offsetTop,
//         left: node.offsetLeft, 
//       }
//     });

//     const connections = (this.nodeService.jsPlumbInstance.getAllConnections() as any[])
//         .map((conn) => ({ uuids: conn.getUuids() }));

//     const json = JSON.stringify({ nodes, connections });

//     console.log(json);
//   }
  
// }