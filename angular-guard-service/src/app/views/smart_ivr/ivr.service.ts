import {
  ComponentFactoryResolver,
  Injectable
} from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ApiService } from "../../core";

@Injectable({
  providedIn: "root",
})
export class IVRService {
  errors = "";
  getSavedRecord = new BehaviorSubject<boolean>(false);

  updateGridList(): void {
    this.getSavedRecord.next(true);
  }

  get displayAllRecord(): Observable<boolean> {
    return this.getSavedRecord.asObservable();
  }

  private rootViewContainer: any;

  constructor(
    private apiService: ApiService,
    private factoryResolver: ComponentFactoryResolver
  ) {}

  public addDynamicNode(node: Node) {
    // const factory = this.factoryResolver.resolveComponentFactory(NodeComponent);
    // const component = factory.create(this.rootViewContainer.parentInjector);
    // (<any>component.instance).node = node;
    // (<any>component.instance).jsPlumbInstance = this.jsPlumbInstance;
    // this.rootViewContainer.insert(component.hostView);
    // console.log("in NodeService.." , component.instance );
  }

  addConnection(connection) {
    // this.jsPlumbInstance.connect({ uuids: connection.uuids });
  }

  public clear() {
    // this.rootViewContainer.clear();
  }

  createIVR(credentials) {
    return this.apiService.post("ivr/createIVR", credentials).pipe(
      map((data) => {
        return data;
      })
    );
  }

  getIVRAction(cond) {
    return this.apiService.get("ivr/getIVRAction", cond).pipe(
      map((data) => {
        return data;
      })
    );
  }

  createBasicIVR(credentials) {
    return this.apiService.post("ivr/createBasicIVR", credentials).pipe(
      map((data) => {
        return data;
      })
    );
  }

  viewBasicIVR(cond) {
    return this.apiService.post(`ivr/viewBasicIVR`, cond).pipe(
      map((data) => {
        return data.response;
      })
    );
  }

  filterBasicIVR(filters) {
    return this.apiService
      .post("ivr/getBasicIVRByFilters", { filters: filters })
      .pipe(
        map((data) => {
          return data.response;
        })
      );
  }

  deleteBasicIVR(id) {
    return this.apiService
      .post(
        `ivr/deleteBasicIVR?` +
          Object.keys(id)[0] +
          "=" +
          id[Object.keys(id)[0]]
      )
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  getIVRMaster(cond) {
    return this.apiService.post(`ivr/getIVRMaster`, cond).pipe(
      map((data) => {
        return data.response;
      })
    );
  }

  getIVRCount(IVR_id, cId) {
    const url = `ivrCount?ivr_id=${IVR_id}&cId=${cId}`;
    return this.apiService.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }

  getAllAssociatedIVR(ivrID, isParentIVR?: boolean) {
    return this.apiService
      .get(`ivr/getAllAssociatedIVR?id=${ivrID}&is_parentIVR=${isParentIVR}`)
      .pipe(
        map((data) => {
          return data.response;
        })
      );
  }

  getIVRMappedWithDID(ivrID, cId) {
    return this.apiService
      .get(`ivr/getIVRMappedWithDID?id=${ivrID}&cId=${cId}`)
      .pipe(
        map((data) => {
          return data.response;
        })
      );
  }
}
