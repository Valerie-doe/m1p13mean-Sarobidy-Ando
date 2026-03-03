import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../shared/service/api.service';
import { ApiEndpoints } from '../../../shared/constants/api-endpoints';
import { Header } from '../../header/header';

@Component({
  selector: 'app-add-contrat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Header],
  templateUrl: './add-contrat.html',
  styleUrls: ['./add-contrat.css']
})
export class AddContrat implements OnInit {

  contratForm!: FormGroup;
  boutiques: any[] = [];
  lots: any[] = [];
  modeEdition = false;
  contratId: string | null = null;
  loading = false;
  showSuccess = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadBoutiques();
    this.loadLots();
    this.checkEditMode();
  }

  // ==========================
  // INITIALISATION FORMULAIRE
  // ==========================
  initForm(): void {
    this.contratForm = this.fb.group({
      boutiqueId: ['', Validators.required],
      lotId: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required]
    });
  }

  // ==========================
  // MODE EDITION
  // ==========================
  checkEditMode(): void {
    this.contratId = this.route.snapshot.paramMap.get('id');
    if (this.contratId) {
      this.modeEdition = true;
      this.loadContrat(this.contratId);
    }
  }

  // ==========================
  // CHARGEMENTS
  // ==========================
  loadBoutiques(): void {
    this.api.getList<any[]>(ApiEndpoints.BOUTIQUES.GETALL).subscribe({
      next: data => this.boutiques = data,
      error: err => console.error('Erreur chargement boutiques', err)
    });
  }

  loadLots(): void {
    this.api.getList<any[]>(ApiEndpoints.LOTS.GETLIBRE).subscribe({
      next: data => this.lots = data,
      error: err => console.error('Erreur chargement lots', err)
    });
  }

  loadContrat(id: string): void {
    this.loading = true;

    this.api.getById(ApiEndpoints.CONTRATS.GETALL, id).subscribe({
      next: (c: any) => {
        this.contratForm.patchValue({
          boutiqueId: c.boutiqueId?._id,
          lotId: c.lotId?._id,
          dateDebut: c.dateDebut?.split('T')[0],
          dateFin: c.dateFin?.split('T')[0],
          datePaiement: c.datePaiement ? c.datePaiement.split('T')[0] : '',
          dateEnvoie: c.dateEnvoie ? c.dateEnvoie.split('T')[0] : ''
        });

        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger le contrat';
        this.loading = false;
      }
    });
  }

  // ==========================
  // SUBMIT
  // ==========================
  onSubmit(): void {

    if (this.contratForm.invalid) {
      Object.values(this.contratForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.showSuccess = false;
    this.errorMessage = '';

    const data = {
      boutiqueId: this.contratForm.value.boutiqueId,
      lotId: this.contratForm.value.lotId,
      dateDebut: this.contratForm.value.dateDebut,
      dateFin: this.contratForm.value.dateFin,
      datePaiement: this.contratForm.value.datePaiement || null,
      dateEnvoie: this.contratForm.value.dateEnvoie || null
    };

    if (this.modeEdition && this.contratId) {

      this.api.update(`${ApiEndpoints.CONTRATS.GETALL}${this.contratId}`, data)
        .subscribe({
          next: () => {
            this.loading = false;
            this.showSuccess = true;

            setTimeout(() => {
              this.router.navigate(['/contrats']);
            }, 1500);
          },
          error: err => {
            this.loading = false;
            this.errorMessage = err.error?.message || 'Erreur lors de la modification';
          }
        });

    } else {

      this.api.create(ApiEndpoints.CONTRATS.CREATE, data)
        .subscribe({
          next: () => {
            this.loading = false;
            this.showSuccess = true;
            this.contratForm.reset();
          },
          error: err => {
            this.loading = false;
            this.errorMessage = err.error?.message || 'Erreur lors de la création';
          }
        });

    }
  }
}