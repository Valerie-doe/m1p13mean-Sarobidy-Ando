import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../shared/service/api.service';
import { Header } from '../header/header';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Header],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  revenusMensuels = 0;
  tauxOccupation = 0;
  impayes: any[] = [];
  totalImpayes = 0;
  loading = true;
  errorMessage = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getDashboard().subscribe({
      next: (res: any) => {
        this.revenusMensuels = res.revenusMensuels;
        this.tauxOccupation = res.tauxOccupation;
        this.impayes = res.impayes;
        this.totalImpayes = res.totalImpayes;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur chargement dashboard';
        this.loading = false;
      }
    });
  }
}