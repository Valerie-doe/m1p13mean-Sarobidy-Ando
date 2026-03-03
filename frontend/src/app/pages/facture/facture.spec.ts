import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateFacture } from './facture';

describe('GenerateFacture', () => {
  let component: GenerateFacture;
  let fixture: ComponentFixture<GenerateFacture>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateFacture]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateFacture);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
