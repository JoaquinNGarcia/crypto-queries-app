import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CoingeckoService } from '../../core/services/coingecko.service';

@Component({
  selector: 'app-trending',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trending.component.html',
  styleUrls: ['./trending.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrendingComponent implements OnInit, OnDestroy {
  trendingCoins: any[] = [];
  vsCurrency = 'usd';
  loading = false;
  error: string | null = null;

  private trendingIds: string[] = [];
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly coingecko: CoingeckoService,private cdr: ChangeDetectorRef) {
}

  ngOnInit(): void {
    this.fetchTrending();
  }

  refresh(): void {
    this.fetchTrending();
  }

  onCurrencyChange(): void {
    this.fetchMarketSnapshot();
  }

  private fetchTrending(): void {
    this.loading = true;
    this.error = null;
    this.trendingCoins = [];
    this.trendingIds = [];
    this.cdr.markForCheck();
    this.coingecko
      .getTrending()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const coins = res?.coins ?? [];
          this.trendingIds = coins.map((coin: any) => coin.item.id);
          this.cdr.markForCheck();
          this.fetchMarketSnapshot();
        },
        error: () => {
          this.error = 'No se pudo obtener el listado trending.';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  private fetchMarketSnapshot(): void {
    if (!this.trendingIds.length) {
      this.loading = false;
      this.trendingCoins = [];
      this.cdr.markForCheck();
      return;
    }

    this.error = null;
    this.loading = true;
    this.cdr.markForCheck();

    this.coingecko
      .getMarketsByIds(this.trendingIds, this.vsCurrency)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (coins) => {
          this.trendingCoins = coins;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.error = 'Error al consultar los detalles de mercado.';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
