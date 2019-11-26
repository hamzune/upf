import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MateriaPage } from './materia.page';

describe('MateriaPage', () => {
  let component: MateriaPage;
  let fixture: ComponentFixture<MateriaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MateriaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MateriaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
