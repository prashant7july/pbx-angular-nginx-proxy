import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { AllCommunityModules, Module } from '@ag-grid-enterprise/all-modules';

@Component({
  selector: 'app-grid',
  templateUrl: './ag-grid.component.html',
  styleUrls: ['./ag-grid.component.css']
})
export class AgGridComponent implements OnInit {
  constructor() { }

  public modules: Module[] = AllCommunityModules;

  @Input() columnDefs: any[];
  @Input() dataSource: any = [];
  @Input() rowData: Array<any>;
  @Input() pageSize: number;
  @Input() viewButton: any;
  @Input() actionButton: boolean;
  @Input() editButton: any;
  @Input() statusButton: any;
  @Input() deleteButton: any;
  @Input() viewUsersButton: any;
  @Input() activeButton: any;
  @Input() inactiveButton: any;
  @Input() releaseButton: any;
  @Input() filters: any[];
  @Input() suppressColumnFit: boolean = false;
  @Input() suppressColumnLen: number;
  @Output() actionClick = new EventEmitter();
  @Input() defaultPageSize: any;
  @Input() showLoadingOverlay: boolean = true;
  @Input() isTableInitialized: boolean = false;
  @Input() reinitializeTable: boolean = false;
  @Input() isTableRefreshable: boolean = false;
  @Input() isSupressPagination: boolean = false;

  @Input() gridOptions: any = {};  // Add this line

  loading: boolean;
  loadDataSource: any;
  i = 0;

  @HostListener('window:resize', ['$event'])
  sizeChange() {
    this.resizeDatatable();
  }

  resizeDatatable() {
    const columnLength = this.columnDefs && this.columnDefs.length;
    if (columnLength < 15 && this.gridOptions.api) {
      this.gridOptions.api.sizeColumnsToFit();
    }
  }

  ngOnInit() {
    this.initializeGridOptions();  // Add this line
  }

  // Add this method to initialize grid options
  initializeGridOptions() {
    const defaultGridOptions = {
      columnDefs: this.columnDefs,
      rowData: this.rowData || null,
      rowModelType: 'infinite',
      modules: AllCommunityModules,
      pagination: true,
      suppressHorizontalScroll: true,
      scrollbarWidth: 10,
      rowSelection: 'Multiple',
      colResizeDefault: 'Shift',
      enableSorting: false,
      enableServerSideSorting: false,
      localeText: { noRowsToShow: 'No Record Found' },
      defaultColDef: {
        suppressFilter: false,
        suppressMovable: true,
        filter: false,
        resizable: true,
      },
    };

    // Merge the specific grid options with the default options
    this.gridOptions = { ...defaultGridOptions, ...this.gridOptions };
  }

  ngOnChanges(changes) {
    this.gridOptions.paginationPageSize = this.gridOptions.cacheBlockSize = this.pageSize = this.pageSize || 10;
    this.defaultPageSize = this.gridOptions.paginationPageSize = this.gridOptions.cacheBlockSize;
    this.gridOptions.suppressPaginationPanel = this.isSupressPagination ? true : false;

    if (this.isTableRefreshable) {
      if (!this.isTableInitialized || this.reinitializeTable) {
        this.columnDefs = [];
        this.rowData = [];
        this.initGrid(this.dataSource);
      }
      this.refreshTableCells();
    } else {
      this.columnDefs = [];
      this.rowData = [];
      this.initGrid(this.dataSource);
    }
  }

  initGrid(source) {
    (source[0] && source[0].fields || []).forEach((field, idx) => {
      this.columnDefs.push({
        headerName: field.headerName,
        field: field.field,
        hide: field.hide,
        width: field.width,
        suppressSizeToFit: field.suppressSizeToFit,
        cellStyle: Object.assign({ border: 'none !important', outline: 'none' }, field.cellStyle || {}),
        cellRenderer: field.cellRenderer || (params => {
          if (params.value != null) {
            return (params.value.constructor === {}.constructor ?
              (params.value.data && params.value.data.constructor === {}.constructor ?
                JSON.stringify(params.value.data) : JSON.stringify(params.value)) :
              ((field.manipulate && field.manipulate[params.value]) || params.value));
          }
        }),
        onCellClicked: params => {
          this.actionClick.emit(params);
        },
      });
      this.isTableInitialized = true;
    });

    this.rowData = source[0] ? source[0].data : [];
    this.loadDataSource = this.getGridDataSource(this.rowData, this.gridOptions.paginationPageSize);
    this.onGridReady();
    if (!this.suppressColumnFit) {
      this.resizeDatatable();
    }
  }

  onGridReady() {
    if (!this.gridOptions.api) {
      setTimeout(() => this.onGridReady(), 1000);
      return;
    }

    this.gridOptions.api.setColumnDefs(this.columnDefs);
    this.gridOptions.api.setDatasource(this.loadDataSource);
  }

  getGridDataSource(data, pageSize) {
    const __this = this;
    if (!data || data === '') {
      data = [];
    }
    data = this.filterData(data.slice());
    const dataSource = {
      paginationPageSize: parseInt(pageSize, 10),
      getRows: params => {
        if (__this.showLoadingOverlay) {
          __this.gridOptions.api.showLoadingOverlay();
        }
        setTimeout(() => {
          const rowsThisPage = data.slice(params.startRow, params.endRow);
          const lastRow = data.length;
          params.successCallback(__this.sortData(params.sortModel, rowsThisPage), lastRow);
          if (!lastRow) {
            __this.gridOptions.api.showNoRowsOverlay();
          } else {
            __this.gridOptions.api.hideOverlay();
          }
          if (!__this.suppressColumnFit) {
            __this.gridOptions.api.sizeColumnsToFit();
          }
        }, 100);
      }
    };
    return dataSource;
  }

  filterData(rowData) {
    return rowData.filter(rec => {
      let flag = true;
      if (Array.isArray(this.filters)) {
        this.filters.forEach(filter => {
          if (filter) {
            if (filter.constructor === {}.constructor) {
              flag = flag && rec[filter.key] && rec[filter.key].includes(filter.value);
            } else if (filter.constructor === ''.constructor) {
              flag = flag && this.columnDefs.find(col => col.filter && rec[col.field] &&
                rec[col.field].toLowerCase().includes(filter.toLowerCase()));
            }
          }
        });
      }
      return flag;
    });
  }

  sortData(sortModel, data) {
    const sortPresent = sortModel && sortModel.length > 0;
    if (!sortPresent) {
      return data;
    }
    const resultOfSort = data.slice();
    resultOfSort.sort((a, b) => {
      for (const k in sortModel) {
        if (sortModel[k]) {
          const sortColModel = sortModel[k];
          const valueA = a[sortColModel.colId];
          const valueB = b[sortColModel.colId];
          if (valueA === valueB) {
            continue;
          }
          const sortDirection = sortColModel.sort === 'asc' ? 1 : -1;
          if (valueA > valueB) {
            return sortDirection;
          } else {
            return sortDirection * -1;
          }
        }
      }
      return 0;
    });
    return resultOfSort;
  }

  refreshTableCells() {
    const params = {
      force: false,
      suppressFlash: false,
    };
    this.gridOptions.api.refreshCells(params);
  }
}
