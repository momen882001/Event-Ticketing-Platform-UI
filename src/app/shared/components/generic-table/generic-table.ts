import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TableAction, TableColumn } from '../../interfaces/table-configuration-interface';
import { DatePipe } from '@angular/common';

export interface TableSearchEvent {
  searchValue: string;
}

@Component({
  selector: 'app-generic-table',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatTableModule,
  ],
  templateUrl: './generic-table.html',
  styleUrl: './generic-table.scss',
})
export class GenericTable implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly dataSource = input<any[]>([]);
  readonly columns = input<TableColumn[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly actions = input<TableAction<any>[]>([]);
  readonly isSearchable = input(false);
  // readonly totalItems = input(0);
  // readonly pageSize = input(10);
  readonly emptyTableMessage = input('No data available');
  readonly searchPlaceholder = input('Search…');

  readonly search = output<TableSearchEvent>();
  // readonly pageChange = output<PageEvent>();

  protected readonly searchControl = new FormControl('', { nonNullable: true });

  protected readonly displayedColumns = computed(() => {
    const keys = this.columns().map((column) => column.key);
    return this.actions().length > 0 ? [...keys, 'actions'] : keys;
  });

  protected readonly hasData = computed(() => this.dataSource().length > 0);

  ngOnInit(): void {
    if (!this.isSearchable()) {
      return;
    }

    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((searchValue) => {
        this.search.emit({ searchValue: searchValue.trim() });
      });
  }

  // protected onPageChange(event: PageEvent): void {
  //   this.pageChange.emit(event);
  // }

  protected cellValue(element: Record<string, unknown>, column: TableColumn): unknown {
    const value = element[column.key];
    return column.pipe ? column.pipe(value) : value;
  }

  protected visibleActions(element: Record<string, unknown>): TableAction[] {
    return this.actions().filter((action) => action.visible?.(element) ?? true);
  }

  protected actionIcon(action: TableAction, element: Record<string, unknown>): string {
    return action.conditionalIcon?.(element) || action.icon || 'more_horiz';
  }

  protected actionLabel(action: TableAction, element: Record<string, unknown>): string {
    return action.conditionalLabel?.(element) || action.label || 'Action';
  }
}
