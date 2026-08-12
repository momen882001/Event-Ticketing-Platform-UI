import { Component, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GenericTable } from '../../../shared/components/generic-table/generic-table';
import { PageHero } from '../../../shared/components/page-hero/page-hero';
import { IUserResponse } from '../interfaces/user-interface';
import { TableColumn } from '../../../shared/interfaces/table-configuration-interface';
import { AdminUsersService } from '../../../core/services/admin-users.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UserRoleEnum } from '../../../shared/enums/UserRoleEnum';
import { SuccessMessages } from '../../../core/constants/successMessages';
import { IRegisterRequest } from '../../../features/auth/interfaces/AuthInterface';
import { AddOrganizer } from './add-organizer/add-organizer';

@Component({
  selector: 'app-users',
  imports: [GenericTable, PageHero],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  allUsers = signal<IUserResponse[]>([]);
  totalItems = signal<number>(0);
  pageSize = signal<number>(5);
  pageNumber = signal<number>(0);

  constructor(
    private adminUsersService: AdminUsersService,
    private authService: AuthService,
    private notificationService: NotificationService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadAllUsers();
  }

  isUserAdmin(): boolean {
    return this.authService.getUserData?.role === UserRoleEnum.ADMIN;
  }

  readonly columns: TableColumn[] = [
    { key: 'fullname', header: 'Full Name' },
    { key: 'username', header: 'Username' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'createdAt', header: 'Created At', type: 'datetime' },
  ];

  onAddOrganizer(): void {
    const dialog = this.dialog.open(AddOrganizer, {
      width: '750px',
      maxWidth: '92vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'organizer-dialog-panel',
    });

    dialog.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      const registerData: IRegisterRequest = {
        ...result,
        role: UserRoleEnum.ORGANIZER,
      };

      this.authService.signUp(registerData).subscribe({
        next: (res) => {
          console.log(res, 'create organizer res');
        },
        error: (err) => {
          console.log(err);
        },
        complete: () => {
          this.notificationService.success(SuccessMessages.organizerCreated);

          this.loadAllUsers();
        },
      });
    });
  }

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
