import { Component, ViewChild, OnInit } from "@angular/core";
import {
  DiagramComponent,
  MarginModel,
  Diagram,
  NodeModel,
  BpmnDiagrams,
  SnapSettingsModel,
  BpmnLoops,
  SnapConstraints,
  SymbolPalette,
  BpmnShape,
  BpmnDataObjects,
  BpmnGateways,
  BpmnTasks,
  BpmnTriggers,
  BpmnBoundary,
  NodeConstraints,
  BpmnShapeModel,
  ConnectorModel,
  BpmnGatewayModel,
  ContextMenuSettingsModel,
  IDragEnterEventArgs,
  DiagramBeforeMenuOpenEventArgs,
  BpmnEvents,
  PaletteModel,
} from "@syncfusion/ej2-angular-diagrams";

import { ClickEventArgs } from "@syncfusion/ej2-navigations";
import { showPaletteIcon } from "../script/diagram-common";
import { IVRService } from "../ivr.service";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from "@angular/forms";
import { PromptsService } from "../../prompts/prompts.service";
import { ToastrService } from "ngx-toastr";
import { Errors, ivrCreated, ivrPromptError, Name_RegEx } from "../../../core";
import { MenuEventArgs, ExpandMode } from "@syncfusion/ej2-navigations";
import { paletteIconClick } from "../script/diagram-common";
SymbolPalette.Inject(BpmnDiagrams);
Diagram.Inject(BpmnDiagrams);

@Component({
  selector: "app-ivrcode",
  templateUrl: "./ivrcode.component.html",
  styleUrls: ["./ivrcode.component.css"],
})
export class IVRCodeComponent implements OnInit {
  selectedIVRValue = "";
  error = "";
  ivrForm: FormGroup;
  ivrPrompt = false;
  constructor(
    private ivrService: IVRService,
    private toastr: ToastrService,
    private promptsService: PromptsService,
    private formBuilder: FormBuilder
  ) {
    this.ivrForm = this.formBuilder.group({
      name: ["", [Validators.required, Validators.pattern(Name_RegEx)]],
      ivr_prompt: ["", Validators.required],
      description: [""],
    });
  }

  get ivr_prompt() {
    return this.ivrForm.get("ivr_prompt");
  }
  get name() {
    return this.ivrForm.get("name");
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.ivrForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  ngOnInit() {
    this.promptsService.getIVRPrompt(localStorage.getItem("id")).subscribe(
      (data) => {
        this.selectedIVRValue = data.response;
      },
      (err) => {
        this.error = err.message;
      }
    );
  }

  public onClicked(args: ClickEventArgs): void {
    var credentials = this.ivrForm.value;
    credentials.customer_id = localStorage.getItem("id");
    console.log("credentials===", credentials);
    if (args.item.text === "New") {
      this.diagram.clear();
    } else if (args.item.text === "Load") {
      document
        .getElementsByClassName("e-file-select-wrap")[0]
        .querySelector("button")
        .click();
    } else if (args.item.id === "palette-icon") {
      showPaletteIcon();
    } else {
      console.log("@@@@@@@@@@@@@@@@@@@@@@", this.diagram.saveDiagram());
      console.log("$$$$$$$$$$$$$$$$$$$$$$", this.diagram.nodes);
      let arr = [];
      for (let i = 0; i < this.diagram.nodes.length; i++) {
        if (i == 0) {
          arr.push({ level: "Start" });
        } else if (i == this.diagram.nodes.length - 1) {
          arr.push({ level: "End" });
        } else {
          arr.push({
            id: i,
            level:
              this.diagram.nodes[i].annotations.length > 0
                ? this.diagram.nodes[i].annotations[0].content
                : "",
          });
        }
      }
      console.log("22222222222222222", arr);
      let arr1 = [];
      for (let j = 0; j < this.diagram.connectors.length; j++) {
        console.log("aa=", this.diagram.connectors[j].annotations.length);
        arr1.push({
          id: j,
          connector:
            this.diagram.connectors[j].annotations.length > 0
              ? this.diagram.connectors[j].annotations[0].content
              : "",
        });
      }
      let arr3 = arr.map((item, i) => Object.assign({}, item, arr1[i]));
      console.log("******************", arr3);
      for (var i = 0; i < arr3.length; i++) {
        delete arr3[i]["id"];
      }
      console.log("arr3", arr3);
      credentials.finalFig = arr3;
      if (credentials.ivr_prompt == "") {
        this.toastr.error("Error!", ivrPromptError, { timeOut: 2000 });
        return;
      }
      this.ivrService.createIVR(credentials).subscribe((data) => {
        this.toastr.success("Success!", ivrCreated, { timeOut: 2000 });
      });
    }
  }

  @ViewChild("diagram", null)
  public diagram: DiagramComponent;

  public expandMode: ExpandMode = "Multiple";

  public nodes: NodeModel[] = [
    {
      id: "start",
      width: 40,
      height: 40,
      offsetX: 35,
      offsetY: 180,
      shape: {
        type: "Bpmn",
        shape: "Event",
        event: { event: "Start" },
      },
    },
    {
      id: "subProcess",
      width: 520,
      height: 250,
      offsetX: 355,
      offsetY: 180,
      constraints: NodeConstraints.Default | NodeConstraints.AllowDrop,
      shape: {
        shape: "Activity",
        type: "Bpmn",
        activity: {
          activity: "SubProcess",
          subProcess: {
            type: "Transaction",
            collapsed: false,
            processes: [
              "processesStart",
              "service",
              "compensation",
              "processesTask",
              "error",
              "processesEnd",
              "user",
              "subProcessesEnd",
            ],
          },
        },
      },
    },
    {
      id: "hazardEnd",
      width: 40,
      height: 40,
      offsetX: 305,
      offsetY: 370,
      shape: {
        type: "Bpmn",
        shape: "Event",
        event: { event: "End" },
      },
      annotations: [
        {
          id: "label2",
          content: "Hazard",
          style: { fill: "white", color: "black" },
          verticalAlignment: "Top",
          margin: { top: 20 },
        },
      ],
    },
    {
      id: "cancelledEnd",
      width: 40,
      height: 40,
      offsetX: 545,
      offsetY: 370,
      shape: {
        type: "Bpmn",
        shape: "Event",
        event: { event: "End" },
      },
      annotations: [
        {
          id: "cancelledEndLabel2",
          content: "Cancelled",
          style: { fill: "white", color: "black" },
          verticalAlignment: "Top",
          margin: { top: 20 },
        },
      ],
    },
    {
      id: "end",
      width: 40,
      height: 40,
      offsetX: 665,
      offsetY: 180,
      shape: {
        type: "Bpmn",
        shape: "Event",
        event: { event: "End" },
      },
    },
    {
      id: "processesStart",
      width: 30,
      height: 30,
      shape: {
        type: "Bpmn",
        shape: "Event",
        event: { event: "Start" },
      },
      margin: { left: 40, top: 80 },
    },
    {
      id: "service",
      style: { fill: "#6FAAB0" },
      width: 95,
      height: 70,
      shape: {
        type: "Bpmn",
        shape: "Activity",
        activity: {
          activity: "Task",
          task: { type: "Service", loop: "ParallelMultiInstance" },
        },
      },
      annotations: [
        {
          id: "serviceLabel2",
          content: "Book hotel",
          offset: { x: 0.5, y: 0.5 },
          style: { color: "white" },
        },
      ],
      margin: { left: 110, top: 20 },
    },
    {
      id: "compensation",
      width: 30,
      height: 30,
      shape: {
        type: "Bpmn",
        shape: "Event",
        event: { event: "Intermediate", trigger: "Compensation" },
      },
      margin: { left: 170, top: 100 },
    },
    {
      id: "processesTask",
      style: { fill: "#F6B53F" },
      width: 95,
      height: 70,
      shape: {
        type: "Bpmn",
        shape: "Activity",
        activity: {
          activity: "Task",
          task: {
            type: "Service",
          },
        },
      },
      annotations: [
        {
          id: "serviceLabel2",
          content: "Charge credit card",
          offset: { x: 0.5, y: 0.6 },
          style: { color: "white" },
        },
      ],
      margin: { left: 290, top: 20 },
    },
    {
      id: "error",
      width: 30,
      height: 30,
      shape: {
        type: "Bpmn",
        shape: "Event",
        event: {
          event: "Intermediate",
          trigger: "Error",
        },
      },
      margin: { left: 350, top: 100 },
    },
    {
      id: "processesEnd",
      width: 30,
      height: 30,
      shape: {
        type: "Bpmn",
        shape: "Event",
        event: { event: "End" },
      },
      margin: { left: 440, top: 80 },
    },
    {
      id: "user",
      style: { fill: "#E94649" },
      width: 90,
      height: 80,
      shape: {
        type: "Bpmn",
        shape: "Activity",
        activity: {
          activity: "Task",
          task: {
            type: "User",
            compensation: true,
          },
        },
      },
      annotations: [
        {
          id: "serviceLabel2",
          content: "Cancel hotel reservation",
          offset: { x: 0.5, y: 0.6 },
          style: { color: "white" },
        },
      ],
      margin: { left: 240, top: 160 },
    },
    {
      id: "subProcessesEnd",
      width: 30,
      height: 30,
      shape: {
        type: "Bpmn",
        shape: "Event",
        event: { event: "End" },
      },
      margin: { left: 440, top: 210 },
    },
  ];

  public snapSettings: SnapSettingsModel = {
    constraints: SnapConstraints.None,
  };

  public connectors: ConnectorModel[] = [
    { id: "connector1", sourceID: "start", targetID: "subProcess" },
    {
      id: "connector2",
      sourceID: "subProcess",
      sourcePortID: "success",
      targetID: "end",
    },
    {
      id: "connector3",
      sourceID: "subProcess",
      sourcePortID: "failure",
      targetID: "hazardEnd",
      type: "Orthogonal",
      segments: [{ type: "Orthogonal", length: 50, direction: "Bottom" }],
      annotations: [
        {
          id: "connector3Label2",
          content: "Booking system failure",
          offset: 0.5,
          style: { fill: "white" },
        },
      ],
    },
    {
      id: "connector4",
      sourceID: "subProcess",
      sourcePortID: "cancel",
      targetID: "cancelledEnd",
      type: "Orthogonal",
      segments: [{ type: "Orthogonal", length: 50, direction: "Bottom" }],
    },
    {
      id: "connector5",
      sourceID: "processesStart",
      targetID: "service",
      type: "Orthogonal",
    },
    { id: "connector6", sourceID: "service", targetID: "processesTask" },
    {
      id: "connector7",
      sourceID: "processesTask",
      targetID: "processesEnd",
      type: "Orthogonal",
    },
    {
      id: "connector8",
      sourceID: "compensation",
      targetID: "user",
      type: "Orthogonal",
      shape: {
        type: "Bpmn",
        flow: "association",
        association: "Directional",
      },
      style: {
        strokeDashArray: "2,2",
      },
      segments: [
        { type: "Orthogonal", length: 30, direction: "Bottom" },
        { type: "Orthogonal", length: 80, direction: "Right" },
      ],
    },
    {
      id: "connector9",
      sourceID: "error",
      targetID: "subProcessesEnd",
      type: "Orthogonal",
      annotations: [
        {
          id: "connector9Label2",
          content: "Cannot charge card",
          offset: 0.5,
          style: { fill: "white", color: "black" },
        },
      ],
      segments: [{ type: "Orthogonal", length: 50, direction: "Bottom" }],
    },
  ];

  public bpmnShapes: NodeModel[] = [
    {
      id: "Start",
      width: 35,
      height: 35,
      shape: {
        type: "Bpmn",
        shape: "Event",
        event: { event: "Start" },
      },
    },
    {
      id: "NonInterruptingIntermediate",
      width: 35,
      height: 35,
      shape: {
        type: "Bpmn",
        shape: "Event",
        event: { event: "NonInterruptingIntermediate" },
      },
    },
    {
      id: "End",
      width: 35,
      height: 35,
      offsetX: 665,
      offsetY: 230,
      shape: {
        type: "Bpmn",
        shape: "Event",
        event: { event: "End" },
      },
    },
    {
      id: "Task",
      width: 35,
      height: 35,
      offsetX: 700,
      offsetY: 700,
      shape: {
        type: "Bpmn",
        shape: "Activity",
        activity: {
          activity: "Task",
        },
      },
    },
    {
      id: "Transaction",
      width: 35,
      height: 35,
      offsetX: 300,
      offsetY: 100,
      constraints: NodeConstraints.Default | NodeConstraints.AllowDrop,
      shape: {
        type: "Bpmn",
        shape: "Activity",
        activity: {
          activity: "SubProcess",
          subProcess: {
            type: "Transaction",
            transaction: {
              cancel: { visible: false },
              failure: { visible: false },
              success: { visible: false },
            },
          },
        },
      },
    },
    {
      id: "Task_Service",
      width: 35,
      height: 35,
      offsetX: 700,
      offsetY: 700,
      shape: {
        type: "Bpmn",
        shape: "Activity",
        activity: {
          activity: "Task",
          task: { type: "Service" },
        },
      },
    },
    {
      id: "Gateway",
      width: 35,
      height: 35,
      offsetX: 100,
      offsetY: 100,
      shape: {
        type: "Bpmn",
        shape: "Gateway",
        gateway: { type: "Exclusive" } as BpmnGatewayModel,
      },
    },
    {
      id: "DataObject",
      width: 35,
      height: 35,
      offsetX: 500,
      offsetY: 100,
      shape: {
        type: "Bpmn",
        shape: "DataObject",
        dataObject: { collection: false, type: "None" },
      },
    },
    {
      id: "subProcess",
      width: 520,
      height: 250,
      offsetX: 355,
      offsetY: 230,
      constraints: NodeConstraints.Default | NodeConstraints.AllowDrop,
      shape: {
        shape: "Activity",
        type: "Bpmn",
        activity: {
          activity: "SubProcess",
          subProcess: {
            type: "Transaction",
            collapsed: false,
            processes: [],
            transaction: {
              cancel: { visible: false },
              failure: { visible: false },
              success: { visible: false },
            },
          },
        },
      },
    },
  ];

  public contextMenu: ContextMenuSettingsModel = {
    show: true,
    items: [
      {
        text: "Call Upload",
        id: "callupload",
      },
    ],
    showCustomMenuOnly: true,
  };

  public diagramCreate(args: Object): void {
    console.log("diagramCreate");
    this.diagram.fitToPage();
    paletteIconClick();
  }

  public symbolMargin: MarginModel = {
    left: 15,
    right: 15,
    top: 15,
    bottom: 15,
  };

  public contextMenuClick(args: MenuEventArgs): void {
    console.log("qqqqqqqqqqqqqqqqqqqqqq", args);
    if (this.diagram.selectedItems.nodes.length > 0) {
      let bpmnShape: BpmnShapeModel = this.diagram.selectedItems.nodes[0]
        .shape as BpmnShapeModel;
      if (args.item.iconCss.indexOf("e-adhocs") > -1) {
        bpmnShape.activity.subProcess.adhoc =
          args.item.id === "AdhocNone" ? false : true;
      }
      if (args.item.iconCss.indexOf("e-event") > -1) {
        bpmnShape.event.event = args.item.id as BpmnEvents;
      }
      if (args.item.iconCss.indexOf("e-trigger") > -1) {
        bpmnShape.event.trigger = args.item.text as BpmnTriggers;
      }
      if (args.item.iconCss.indexOf("e-loop") > -1) {
        let loop: string =
          args.item.id === ("LoopNone" as BpmnLoops) ? "None" : args.item.id;
        if (bpmnShape.activity.activity === "Task") {
          bpmnShape.activity.task.loop = loop as BpmnLoops;
        }
        if (bpmnShape.activity.activity === "SubProcess") {
          bpmnShape.activity.subProcess.loop = loop as BpmnLoops;
        }
      }
      if (args.item.iconCss.indexOf("e-compensation") > -1) {
        let compensation: boolean =
          args.item.id === "CompensationNone" ? false : true;
        if (bpmnShape.activity.activity === "Task") {
          bpmnShape.activity.task.compensation = compensation;
        }
        if (bpmnShape.activity.activity === "SubProcess") {
          bpmnShape.activity.subProcess.compensation = compensation;
        }
      }
      if (args.item.iconCss.indexOf("e-call") > -1) {
        let compensation: boolean = args.item.id === "CallNone" ? false : true;
        if (bpmnShape.activity.activity === "Task") {
          bpmnShape.activity.task.call = compensation;
        }
      }
      if (
        args.item.id === "CollapsedSubProcess" ||
        args.item.id === "ExpandedSubProcess"
      ) {
        if (args.item.id === "ExpandedSubProcess") {
          bpmnShape.activity.activity = "SubProcess";
          bpmnShape.activity.subProcess.collapsed = false;
        } else {
          bpmnShape.activity.activity = "SubProcess";
          bpmnShape.activity.subProcess.collapsed = true;
        }
      }
      if (args.item.iconCss.indexOf("e-boundry") > -1) {
        let call: string = args.item.id;
        if (args.item.id !== "Default") {
          call = args.item.id === "BoundryEvent" ? "Event" : "Call";
        }
        bpmnShape.activity.subProcess.boundary = call as BpmnBoundary;
      }
      if (args.item.iconCss.indexOf("e-data") > -1) {
        let call: string =
          args.item.id === "DataObjectNone" ? "None" : args.item.id;
        bpmnShape.dataObject.type = call as BpmnDataObjects;
      }
      if (args.item.iconCss.indexOf("e-collection") > -1) {
        let call: boolean =
          args.item.id === "Collectioncollection" ? true : false;
        bpmnShape.dataObject.collection = call;
      }
      if (args.item.iconCss.indexOf("e-task") > -1) {
        let task: string = args.item.id === "TaskNone" ? "None" : args.item.id;
        if (bpmnShape.activity.activity === "Task") {
          bpmnShape.activity.task.type = task as BpmnTasks;
        }
      }
      if (args.item.iconCss.indexOf("e-gate") > -1) {
        let task: string = args.item.id.replace("Gateway", "");
        if (bpmnShape.shape === "Gateway") {
          bpmnShape.gateway.type = task as BpmnGateways;
        }
      }
      this.diagram.dataBind();
    }
  }

  public getConnectors(): ConnectorModel[] {
    let connectorSymbols: ConnectorModel[] = [
      {
        id: "Link1",
        type: "Orthogonal",
        sourcePoint: { x: 0, y: 0 },
        targetPoint: { x: 40, y: 40 },
        targetDecorator: { shape: "Arrow" },
        style: { strokeWidth: 2 },
      },
      {
        id: "Link2",
        type: "Orthogonal",
        sourcePoint: { x: 0, y: 0 },
        targetPoint: { x: 40, y: 40 },
        targetDecorator: { shape: "Arrow" },
        style: { strokeWidth: 2, strokeDashArray: "4 4" },
      },
      {
        id: "Link3",
        type: "Straight",
        sourcePoint: { x: 0, y: 0 },
        targetPoint: { x: 40, y: 40 },
        targetDecorator: { shape: "Arrow" },
        style: { strokeWidth: 2 },
      },
      {
        id: "link4",
        sourcePoint: { x: 0, y: 0 },
        targetPoint: { x: 40, y: 40 },
        type: "Orthogonal",
        shape: {
          type: "Bpmn",
          flow: "Association",
          association: "Directional",
        },
        style: {
          strokeDashArray: "2,2",
        },
      },
    ];
    return connectorSymbols;
  }

  public contextMenuOpen(args: DiagramBeforeMenuOpenEventArgs) {
    console.log("contextMenuOpen", args);
    let hiddenId: string[] = [];
    if (args.element.className !== "e-menu-parent e-ul ") {
      hiddenId = [
        "Adhoc",
        "Loop",
        "taskCompensation",
        "Activity-Type",
        "Boundry",
        "DataObject",
        "collection",
        "DeftCall",
        "TriggerResult",
        "EventType",
        "TaskType",
        "GateWay",
      ];
    }
    if (this.diagram.selectedItems.nodes.length) {
      for (let item of args.items) {
        let bpmnShape: BpmnShapeModel = this.diagram.selectedItems.nodes[0]
          .shape as BpmnShapeModel;
        if (bpmnShape.shape !== "DataObject" && bpmnShape.shape !== "Gateway") {
          if (item.text === "Ad-Hoc") {
            if (bpmnShape.activity.activity === "SubProcess") {
              hiddenId.splice(hiddenId.indexOf(item.id), 1);
            }
          }
          if (
            item.text === "Loop" ||
            item.text === "Compensation" ||
            item.text === "Activity-Type"
          ) {
            if (bpmnShape.shape === "Activity") {
              hiddenId.splice(hiddenId.indexOf(item.id), 1);
            }
          }
          if (item.text === "Boundry") {
            if (bpmnShape.activity.activity === "SubProcess") {
              hiddenId.splice(hiddenId.indexOf(item.id), 1);
            }
          }
        }
        if (item.text === "Data Object") {
          if (bpmnShape.shape === "DataObject") {
            hiddenId.splice(hiddenId.indexOf(item.id), 1);
          }
        }
        if (item.text === "Collection") {
          if (bpmnShape.shape === "DataObject") {
            hiddenId.splice(hiddenId.indexOf(item.id), 1);
          }
        }
        if (item.text === "Call") {
          if (
            bpmnShape.shape === "Activity" &&
            bpmnShape.activity.activity === "Task"
          ) {
            hiddenId.splice(hiddenId.indexOf(item.id), 1);
          }
        }
        if (item.text === "Trigger Result") {
          if (bpmnShape.shape === "Event") {
            hiddenId.splice(hiddenId.indexOf(item.id), 1);
          }
        }
        if (item.text === "Event Type") {
          if (bpmnShape.shape === "Event") {
            hiddenId.splice(hiddenId.indexOf(item.id), 1);
          }
        }
        if (item.text === "Task Type") {
          if (
            bpmnShape.shape === "Activity" &&
            bpmnShape.activity.activity === "Task"
          ) {
            hiddenId.splice(hiddenId.indexOf(item.id), 1);
          }
        }
        if (item.text === "GateWay") {
          if (bpmnShape.shape === "Gateway") {
            hiddenId.splice(hiddenId.indexOf(item.id), 1);
          }
        }
        if (
          args.parentItem &&
          args.parentItem.id === "TriggerResult" &&
          bpmnShape.shape === "Event"
        ) {
          if (
            item.text !== "None" &&
            (item.text === bpmnShape.event.event ||
              item.text === bpmnShape.event.trigger)
          ) {
            hiddenId.push(item.id);
          }
          if (bpmnShape.event.event === "Start") {
            if (
              item.text === "Cancel" ||
              item.text === "Terminate" ||
              item.text === "Link"
            ) {
              hiddenId.push(item.id);
            }
          }
          if (
            bpmnShape.event.event === "NonInterruptingStart" ||
            item.text === "Link"
          ) {
            if (
              item.text === "Cancel" ||
              item.text === "Terminate" ||
              item.text === "Compensation" ||
              item.text === "Error" ||
              item.text === "None"
            ) {
              hiddenId.push(item.id);
            }
          }
          if (bpmnShape.event.event === "Intermediate") {
            if (item.text === "Terminate") {
              hiddenId.push(item.id);
            }
          }
          if (bpmnShape.event.event === "NonInterruptingIntermediate") {
            if (
              item.text === "Cancel" ||
              item.text === "Terminate" ||
              item.text === "Compensation" ||
              item.text === "Error" ||
              item.text === "None" ||
              item.text === "Link"
            ) {
              hiddenId.push(item.id);
            }
          }
          if (bpmnShape.event.event === "ThrowingIntermediate") {
            if (
              item.text === "Cancel" ||
              item.text === "Terminate" ||
              item.text === "Timer" ||
              item.text === "Error" ||
              item.text === "None" ||
              item.text === "Pareller" ||
              item.text === "Conditional"
            ) {
              hiddenId.push(item.id);
            }
          }
          if (bpmnShape.event.event === "End") {
            if (
              item.text === "Parallel" ||
              item.text === "Timer" ||
              item.text === "Conditional" ||
              item.text === "Link"
            ) {
              hiddenId.push(item.id);
            }
          }
        }
        if (
          args.parentItem &&
          args.parentItem.id === "EventType" &&
          bpmnShape.shape === "Event"
        ) {
          if (item.text === bpmnShape.event.event) {
            hiddenId.push(item.id);
          }
        }
      }
    }
    args.hiddenItems = hiddenId;
  }

  public dragEnter(args: IDragEnterEventArgs) {
    console.log("dragenter");
    let obj: NodeModel = args.element as NodeModel;
    if (obj instanceof Node) {
      if (!(obj.shape as BpmnShape).activity.subProcess.collapsed) {
        (
          obj.shape as BpmnShape
        ).activity.subProcess.transaction.cancel.visible = true;
        (
          obj.shape as BpmnShape
        ).activity.subProcess.transaction.failure.visible = true;
        (
          obj.shape as BpmnShape
        ).activity.subProcess.transaction.success.visible = true;
      } else {
        let oWidth: number = obj.width;
        let oHeight: number = obj.height;
        let ratio: number = 100 / obj.width;
        obj.width = 100;
        obj.height *= ratio;
        obj.offsetX += (obj.width - oWidth) / 2;
        obj.offsetY += (obj.height - oHeight) / 2;
      }
    }
  }

  public palette: PaletteModel[] = [
    {
      id: "Bpmn",
      expanded: true,
      symbols: this.bpmnShapes,
      iconCss: "shapes",
      title: "BPMN Shapes",
    },
    {
      id: "Connector",
      expanded: true,
      symbols: this.getConnectors(),
      iconCss: "shapes",
      title: "Connectors",
    },
  ];

  public download(data): void {
    console.log("download", data);
    // let fetchData = JSON.stringify(data);
    if (window.navigator.msSaveBlob) {
      let blob: Blob = new Blob([data], {
        type: "data:text/json;charset=utf-8,",
      });
      window.navigator.msSaveOrOpenBlob(blob, "Diagram.json");
    } else {
      let dataStr: string =
        "data:text/json;charset=utf-8," + encodeURIComponent(data);
      let a: HTMLAnchorElement = document.createElement("a");
      a.href = dataStr;
      a.download = "Diagram.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }
}
