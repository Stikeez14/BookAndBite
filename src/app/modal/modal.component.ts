import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent {
  @Input() restaurant: any | null = null; // Data passed from the parent
  @Output() close = new EventEmitter<void>(); // Event to close the modal

  closeModal() {
    this.close.emit(); // Emit event to close the modal
  }
}
