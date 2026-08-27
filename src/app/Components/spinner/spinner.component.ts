import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LoadingServiceService } from '../../Services/loading-service.service';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent {

loadingService = inject(LoadingServiceService);

}
