import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../shared/service/api.service';
import { ApiEndpoints } from '../../shared/constants/api-endpoints';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../header/header';

export interface Responsable {
  nom: string;
  prenom: string;
  contact?: string;
  cin?: string;
}

export interface Boutique {
  _id?: string;
  name: string;
  email: string;
  website: string;
  phone: string;
  description: string;
  categoryId: { _id: string; name: string };
}

@Component({
  selector: 'app-boutiques',
  standalone: true,
  imports: [CommonModule, FormsModule, Header],
  templateUrl: './boutique.html',
  styleUrls: ['./boutique.css']
})
export class Boutique implements OnInit {

  boutiques: Boutique[] = [];
  filteredBoutiques: Boutique[] = [];
  searchTerm: string = '';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadBoutiques();
  }

  loadBoutiques(): void {
    this.api.getList<Boutique[]>(ApiEndpoints.BOUTIQUES.GETALL).subscribe({
      next: data => {
        this.boutiques = data;
        this.filteredBoutiques = data;
      },
      error: err => console.error('Erreur lors du chargement des boutiques', err)
    });
  }

  onSearch(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredBoutiques = this.boutiques;
    } else {
      this.filteredBoutiques = this.boutiques.filter(b =>
        b.name.toLowerCase().includes(term) || b.email.toLowerCase().includes(term)
      );
    }
  }

  goToAddBoutique(): void {
    this.router.navigate(['/boutique/add']);
  }

  editBoutique(id: string): void {
    this.router.navigate(['/boutique/add', id]);
  }

 
}