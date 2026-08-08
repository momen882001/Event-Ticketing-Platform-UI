import { Component, OnInit, signal } from '@angular/core';
import { GenericTable } from '../../../shared/components/generic-table/generic-table';
import { PageHero } from '../../../shared/components/page-hero/page-hero';
import { IUserResponse } from '../interfaces/user-interface';
import { TableColumn } from '../../../shared/interfaces/table-configuration-interface';
import { AdminUsersService } from '../../../core/services/admin-users.service';

@Component({
  selector: 'app-users',
  imports: [GenericTable, PageHero],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  allUsers = signal<IUserResponse[]>([]);
  totalItems = signal<number>(0);
  pageSize = signal<number>(10);
  pageNumber = signal<number>(0);

  constructor(private adminUsersService: AdminUsersService) {}

  ngOnInit(): void {
    this.loadAllUsers();
  }

  readonly columns: TableColumn[] = [
    { key: 'fullname', header: 'Full Name' },
    { key: 'username', header: 'Username' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'createdAt', header: 'Created At', type: 'datetime' },
  ];

  private loadAllUsers(): void {
    this.adminUsersService.getAllUsers().subscribe({
      next: (res) => {
        console.log(res);
        this.allUsers.set(res);
        this.totalItems.set(res.length);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  onPageChange(event: any): void {
    this.pageNumber.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }
}
