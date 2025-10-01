import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable card component for displaying content with optional title, subtitle, and elevation.
 *
 * @example
 * ```html
 * <app-card title="Welcome" subtitle="This is a subtitle" elevation="md">
 *   <p>Card content goes here.</p>
 * </app-card>
 * ```
 *
 * @property {string} title - The title of the card.
 * @property {string} subtitle - The subtitle of the card.
 * @property {'none' | 'sm' | 'md' | 'lg'} elevation - The shadow elevation of the card. Defaults to 'md'.
 */

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() elevation: 'none' | 'sm' | 'md' | 'lg' = 'md';

  get cardClasses(): Record<string, boolean> {
    return {
      'app-card': true,
      [`app-card--elevation-${this.elevation}`]: true,
    };
  }
}