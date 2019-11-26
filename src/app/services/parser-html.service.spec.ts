import { TestBed } from '@angular/core/testing';

import { ParserHtmlService } from './parser-html.service';

describe('ParserHtmlService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ParserHtmlService = TestBed.get(ParserHtmlService);
    expect(service).toBeTruthy();
  });
});
