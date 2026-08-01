import { Component, OnInit, signal } from '@angular/core';
import { GenericTable } from '../../../shared/components/generic-table/generic-table';
import { ICategoryResponse } from '../interfaces/category-interface';
import { TableAction, TableColumn } from '../../../shared/interfaces/table-configuration-interface';
import { CategoriesService } from '../../../core/services/categories.service';
import { IGetAllApiParams } from '../../../shared/interfaces/apis-interface';

@Component({
  selector: 'app-categories',
  imports: [GenericTable],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  allCategories = signal<ICategoryResponse[]>([]);
  totalItems = signal<number>(0);
  pageSize = signal<number>(5);
  pageNumber = signal<number>(0);

  constructor(private categoriesService: CategoriesService) {}

  ngOnInit(): void {
    this.loadAllCategories();
  }

  readonly columns: TableColumn[] = [
    { key: 'name', header: 'Name' },
    { key: 'createdAt', header: 'Created At', type: 'date' },
  ];

  readonly actions: TableAction<ICategoryResponse>[] = [
    {
      icon: 'visibility',
      label: 'View',
      handler: (category) => console.log(category),
    },
    {
      icon: 'edit',
      label: 'Edit',
      handler: (category) => console.log(category),
    },
    {
      icon: 'delete',
      label: 'Delete',
      handler: (category) => console.log('Delete category', category),
    },
  ];

  private loadAllCategories() {
    const getCategoriesParams: IGetAllApiParams = {
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
    };
    this.categoriesService.getAllCategories(getCategoriesParams).subscribe({
      next: (res) => {
        console.log(res);
        this.allCategories.set(res);
        // this.pageSize.set(res.page.size);
        // this.totalItems.set(res.page.totalElements);
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
}
