import {AfterViewInit, Component, ViewChild} from "@angular/core";
import {FileDto} from "../dto/file-dto";
import {MatSort, MatSortHeader} from "@angular/material/sort";
import {FilesService} from "../files.service";
import {
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTableDataSource
} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {QFormsService} from "@qlack/forms";
import {CdkCell, CdkCellDef, CdkColumnDef, CdkHeaderCell, CdkTable} from "@angular/cdk/table";
import {RouterLink} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {OkCancelModalComponent} from "../../shared/component/ok-cancel-modal/ok-cancel-modal.component";
import {UtilityService} from "../../shared/service/utility.service";

@Component({
    selector: "app-files",
    templateUrl: "./files-list.component.html",
    imports: [CdkTable, MatSort, CdkColumnDef, MatHeaderCellDef, CdkHeaderCell, MatSortHeader, CdkCellDef,
      CdkCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator, RouterLink]
})
export class FilesListComponent implements AfterViewInit {
  columns = ["fileName", "description", "size", "actions"];
  datasource = new MatTableDataSource<FileDto>();
  @ViewChild(MatSort, {static: true}) sort!: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator!: MatPaginator;

  constructor(private filesService: FilesService, private qForms: QFormsService,
              private dialog: MatDialog, private utilityService: UtilityService) {
  }

  ngAfterViewInit(): void {
    // Initial fetch of data.
    this.fetchData(0, this.paginator.pageSize, this.sort.active, this.sort.start);

    // Each time the sorting changes, reset the page number.
    this.sort.sortChange.subscribe((onNext: { active: string; direction: string; }) => {
      this.paginator.pageIndex = 0;
      this.fetchData(0, this.paginator.pageSize, onNext.active, onNext.direction);
    });
  }

  fetchData(page: number, size: number, sort: string, sortDirection: string) {
    this.filesService.getAll(this.qForms.makeQueryStringForData(null, [], false, page, size,
      sort, sortDirection)).subscribe({
      next: onNext => {
        this.datasource.data = onNext.content;
        this.paginator.length = onNext.totalElements;
      }
    });
  }

  changePage() {
    this.fetchData(this.paginator.pageIndex, this.paginator.pageSize, this.sort.active, this.sort.start);
  }

  download(id: string) {
    this.filesService.download(id);
  }

  delete(id: any) {
    const dialogRef = this.dialog.open(OkCancelModalComponent, {
      data: {
        title: "Delete file",
        question: "Do you really want to delete this file?",
        buttons: {
          ok: true, cancel: true, reload: false
        }
      }
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.filesService.delete(id).subscribe(() => {
          this.utilityService.popupSuccess("File successfully deleted.");
          this.ngAfterViewInit();
        });
      }
    });
  }

}

