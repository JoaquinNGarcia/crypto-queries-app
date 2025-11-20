import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CoingeckoService } from '../../core/services/coingecko.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = false;
  error: string | null = null;

  global: any | null = null;
  markets: any[] = [];

  vsCurrency = 'usd';
  searchTerm = '';

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly coingecko: CoingeckoService, private cdr:ChangeDetectorRef) { 
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    this.coingecko
      .getGlobalData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.global = res?.data ?? null;
          this.cdr.markForCheck();
        },
        error: () => {
          this.error = 'Error al cargar datos globales.';
          this.cdr.markForCheck();
        },
      });

    this.coingecko
      .getTopMarkets(this.vsCurrency, 30, 1)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (coins) => {
          this.markets = coins;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.error = 'Error al cargar el listado de criptomonedas.';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onCurrencyChange(): void {
    this.loadData();
  }

  get filteredMarkets(): any[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.markets;
    return this.markets.filter(
      (coin) =>
        (coin.name as string).toLowerCase().includes(term) ||
        (coin.symbol as string).toLowerCase().includes(term)
    );
  }

  trackById(_: number, item: any) {
    return item.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
