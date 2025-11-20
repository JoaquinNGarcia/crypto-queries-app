import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CoingeckoService {
  private baseUrl = environment.coingeckoBaseUrl;
  private apiKey = environment.coingeckoDemoApiKey;



  constructor(private http: HttpClient) {console.log("CoingeckoService -> BASE URL:", this.baseUrl);
console.log("CoingeckoService -> API KEY:", this.apiKey);}

  private createHeaders(): HttpHeaders | undefined {
    if (!this.apiKey) return undefined;
    return new HttpHeaders({
      'x-cg-demo-api-key': this.apiKey,
    });
  }

  private get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.createHeaders();
     console.log("HTTP GET ->", url);
  console.log("Headers ->", headers);
  console.log("Params ->", params ? params.toString() : "(none)");
    return this.http.get<T>(url, { params, headers });
  }

  // Datos globales del mercado
  getGlobalData(): Observable<any> {
    return this.get<any>('/global');
  }

  // Lista de mercados (top N criptos)
  getTopMarkets(
    vsCurrency = 'usd',
    perPage = 20,
    page = 1
  ): Observable<any[]> {
    let params = new HttpParams()
      .set('vs_currency', vsCurrency)
      .set('order', 'market_cap_desc')
      .set('per_page', perPage.toString())
      .set('page', page.toString())
      .set('sparkline', 'false');

    return this.get<any[]>('/coins/markets', params);
  }

  // Criptos trending
  getTrending(): Observable<any> {
    return this.get<any>('/search/trending');
  }

  // Datos de mercados filtrando por ids (para trending)
  getMarketsByIds(ids: string[], vsCurrency = 'usd'): Observable<any[]> {
    if (!ids.length) {
      return new Observable((obs) => {
        obs.next([]);
        obs.complete();
      });
    }

    let params = new HttpParams()
      .set('vs_currency', vsCurrency)
      .set('ids', ids.join(','))
      .set('order', 'market_cap_desc')
      .set('sparkline', 'false');

    return this.get<any[]>('/coins/markets', params);
  }
}
