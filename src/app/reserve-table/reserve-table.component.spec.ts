import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReserveTableComponent } from './reserve-table.component';

describe('ReserveTableComponent', () => {
  let component: ReserveTableComponent;
  let fixture: ComponentFixture<ReserveTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReserveTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReserveTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
