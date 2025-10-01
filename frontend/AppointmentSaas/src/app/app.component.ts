import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CardComponent } from './shared/components/ui/card/card.component';
import { ButtonComponent } from './shared/components/ui/button/button.component';
import { InputComponent } from './shared/components/ui/input/input.component';
import { ModalComponent } from './shared/components/ui/modal/modal.component';
import { ValidationMessageComponent } from './shared/components/forms/validation-message/validation-message.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    CardComponent,
    ButtonComponent,
    InputComponent,
    ModalComponent,
    ValidationMessageComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  protected readonly title = signal('AppointmentSaas');

  // Demo properties
  inputValue: string = '';
  emailValue: string = '';
  disabledValue: string = 'This is disabled';
  errorValue: string = '';

  modalVisible: boolean = false;
  modalTitle: string = '';
  modalSize: 'sm' | 'md' | 'lg' = 'md';

  onInputChange(value: string): void {
    console.log('Input value changed:', value);
  }

  openModal(size: 'sm' | 'md' | 'lg'): void {
    this.modalSize = size;
    this.modalTitle = `${size.toUpperCase()} Modal Demo`;
    this.modalVisible = true;
  }

  closeModal(): void {
    this.modalVisible = false;
  }

  onModalClose(): void {
    console.log('Modal closed');
  }
}
