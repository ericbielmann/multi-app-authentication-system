import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService, UserSession } from '../../services/auth.service';
import { FilterPipe } from '../../pipes/filter.pipe';

interface Application {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  status: 'pending' | 'in-review' | 'approved' | 'rejected';
  submittedDate: string;
  progress: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressBarModule,
    MatInputModule,
    MatFormFieldModule,
    FilterPipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  session: UserSession | null = null;
  searchTerm: string = '';
  applications: Application[] = [
    {
      id: 'APP-001',
      applicantName: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 123-4567',
      status: 'in-review',
      submittedDate: '2025-01-15',
      progress: 100
    },
    {
      id: 'APP-002',
      applicantName: 'Michael Chen',
      email: 'mchen@email.com',
      phone: '+1 (555) 234-5678',
      status: 'pending',
      submittedDate: '2025-01-14',
      progress: 75
    },
    {
      id: 'APP-003',
      applicantName: 'Emily Rodriguez',
      email: 'emily.r@email.com',
      phone: '+1 (555) 345-6789',
      status: 'approved',
      submittedDate: '2025-01-12',
      progress: 100
    },
    {
      id: 'APP-004',
      applicantName: 'David Kim',
      email: 'dkim@email.com',
      phone: '+1 (555) 456-7890',
      status: 'pending',
      submittedDate: '2025-01-10',
      progress: 50
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.session$.subscribe(session => {
      this.session = session;
    });
  }

  viewApplication(application: Application) {
    window.location.href = 'http://localhost:4200';
  }

  getStatusLabel(status: string): string {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
