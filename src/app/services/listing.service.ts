import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Listing } from '../models/listing.model';

@Injectable({ providedIn: 'root' })
export class ListingService {
  private api = 'http://localhost:3000/api/listings';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Listing[]>(this.api);
  }

  getBySlug(slug: string) {
    return this.http.get<Listing>(`${this.api}/${slug}`);
  }
}