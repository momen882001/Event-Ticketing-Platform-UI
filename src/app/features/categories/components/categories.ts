import { Component, OnInit, signal } from '@angular/core';
import { GenericTable } from '../../../shared/components/generic-table/generic-table';
import { ICategoryRequest, ICategoryResponse } from '../interfaces/category-interface';
import { TableAction, TableColumn } from '../../../shared/interfaces/table-configuration-interface';
import { CategoriesService } from '../../../core/services/categories.service';
import { IGetAllApiParams } from '../../../shared/interfaces/apis-interface';
import { MatDialog } from '@angular/material/dialog';
import { AddEditCategory } from './add-edit-category/add-edit-category';
import { SuccessMessages } from '../../../core/constants/successMessages';
import { NotificationService } from '../../../core/services/notification.service';
import { PageHero } from '../../../shared/components/page-hero/page-hero';

@Component({
  selector: 'app-categories',
  imports: [GenericTable, PageHero],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  allCategories = signal<ICategoryResponse[]>([]);
  totalItems = signal<number>(0);
  pageSize = signal<number>(5);
  pageNumber = signal<number>(0);

  constructor(
    private categoriesService: CategoriesService,
    private notificationService: NotificationService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadAllCategories();
  }

  readonly columns: TableColumn[] = [{ key: 'name', header: 'Name' }];

  readonly actions: TableAction<ICategoryResponse>[] = [
    {
      icon: 'edit',
      label: 'Edit',
      handler: (category) => this.onEditCategory(category),
    },
    // {
    //   icon: 'delete',
    //   label: 'Delete',
    //   handler: (category) => console.log('Delete category', category),
    // },
  ];

  private loadAllCategories() {
    const getCategoriesParams: IGetAllApiParams = {
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
    };
    this.categoriesService.getAllCategoriesPaginated(getCategoriesParams).subscribe({
      next: (res) => {
        console.log(res);
        this.allCategories.set(res.content);
        this.pageSize.set(res.page.size);
        this.totalItems.set(res.page.totalElements);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  onPageChange(event: any): void {
    this.pageNumber.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadAllCategories();
  }

  onCreateCategory(): void {
    const dialog = this.dialog.open(AddEditCategory, {
      width: '450px',
      autoFocus: false,
    });

    dialog.afterClosed().subscribe((result: ICategoryRequest) => {
      if (result) {
        this.categoriesService.createCategory(result).subscribe({
          next: (res) => {
            console.log(res, 'create category res');
            this.notificationService.success(SuccessMessages.categoryCreated);
            this.loadAllCategories();
          },
          error: (err: any) => {
            console.log(err);
          },
        });
      }
    });
  }

  onEditCategory(category: ICategoryResponse): void {
    const dialog = this.dialog.open(AddEditCategory, {
      width: '450px',
      autoFocus: false,
      data: category,
    });

    dialog.afterClosed().subscribe((result: ICategoryRequest) => {
      if (result) {
        this.categoriesService.updateCategory(result, category.id).subscribe({
          next: (res) => {
            console.log(res, 'create category res');
            this.notificationService.success(SuccessMessages.categoryUpdated);
            this.loadAllCategories();
          },
          error: (err: any) => {
            console.log(err);
          },
        });
      }
    });
  }
}
