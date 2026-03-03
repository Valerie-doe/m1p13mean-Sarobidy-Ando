import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../shared/service/api.service';
import { ApiEndpoints } from '../../../shared/constants/api-endpoints';
import { Header } from '../../header/header';

@Component({
  selector: 'app-add-boutique',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Header],
  templateUrl: './add-boutique.html',
  styleUrls: ['./add-boutique.css']
})
export class AddBoutique implements OnInit {

  boutiqueForm!: FormGroup;
  categories: any[] = [];

  modeEdition = false;
  boutiqueId: string | null = null;

  loading = false;
  showSuccess = false;
  errorMessage = '';

  loginInfo: { email: string; password: string } | null = null;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    // ✅ Formulaire aligné EXACTEMENT avec le backend Shop
    this.boutiqueForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      categoryId: ['', Validators.required],
      phone: [''],
      status: ['active'],
      website: [''],
      openingHours: [''],
      description: [''],
      imageUrl: ['']
    });

    this.loadCategories();

    // Mode édition
    this.boutiqueId = this.route.snapshot.paramMap.get('id');
    if (this.boutiqueId) {
      this.modeEdition = true;
      this.loadBoutique(this.boutiqueId);
    }
  }

  // 🔹 Charger catégories
  loadCategories(): void {
    this.api.getList<any[]>(ApiEndpoints.CATEGORIES.GETALL).subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Erreur chargement catégories', err)
    });
  }

  // 🔹 Charger boutique pour édition
  loadBoutique(id: string): void {
    this.loading = true;

    this.api.getById(ApiEndpoints.BOUTIQUES.GETALL, id).subscribe({
      next: (shop: any) => {

        this.boutiqueForm.patchValue({
          name: shop.name,
          email: shop.email,
          categoryId: shop.categoryId?._id || shop.categoryId,
          phone: shop.phone,
          status: shop.status,
          website: shop.website,
          openingHours: shop.openingHours,
          description: shop.description,
          imageUrl: shop.imageUrl
        });

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de charger la boutique';
      }
    });
  }

  // 🔹 Soumission
  onSubmit(): void {

    if (this.boutiqueForm.invalid) {
      this.boutiqueForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.showSuccess = false;

    const data = this.boutiqueForm.value;

    if (this.modeEdition && this.boutiqueId) {

      // UPDATE
      this.api.update(`${ApiEndpoints.BOUTIQUES.GETALL}${this.boutiqueId}`, data)
        .subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/boutiques']);
          },
          error: (err) => {
            this.loading = false;
            this.errorMessage =
              err.error?.message || 'Erreur lors de la modification';
          }
        });

    } else {

      // CREATE
      this.api.create(ApiEndpoints.BOUTIQUES.CREATE, data)
        .subscribe({
          next: (res: any) => {

            this.loading = false;
            this.showSuccess = true;

            if (res.user) {
              this.loginInfo = {
                email: res.user.email,
                password: res.user.password
              };
            }

            this.boutiqueForm.reset({
              status: 'active'
            });

          },
          error: (err) => {
            this.loading = false;
            this.errorMessage =
              err.error?.message || 'Erreur lors de la création';
          }
        });
    }
  }
}