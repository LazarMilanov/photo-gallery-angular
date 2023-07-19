import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ImageService } from 'src/app/services/image.service';

@Component({
  selector: 'app-add-image',
  templateUrl: './add-image.component.html',
  styleUrls: ['./add-image.component.css']
})
export class AddImageComponent implements OnInit{

  addImageForm: FormGroup;
  imageUrl: string | ArrayBuffer | null = null;

  constructor(private formBuilder: FormBuilder, private router: Router, private authService: AuthService, private imageService: ImageService) {
    this.addImageForm = this.formBuilder.group({
      image: [''],
      description: [''],
    });
  }

  ngOnInit(): void {
    console.log(this.authService.getUserId());
  }

  addImage(): void {
    const addImageData = this.addImageForm.value;
    const image = addImageData.image;
    const description = addImageData.description;
    if (image && description) {
      this.imageService.createImage(image, this.authService.getUserId(), description).pipe(
        catchError((err) => {
          alert("Error while adding image");
          return EMPTY;
        })
      ).subscribe((res) => {
        this.router.navigate(['/images']);
      });
    } else {
      alert('Missing image or description');
    }
  }

  handleDrop(event: DragEvent | any): void {
    event.preventDefault();
    event.stopPropagation();
    const inputElement = document.getElementById('fileInput') as HTMLInputElement;
    inputElement.files = event.dataTransfer.files;
    const file = (inputElement.files as FileList)[0];
    this.addImageForm.get('image')?.setValue(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imageUrl = reader.result;
    };
  }

  handleDragOver(event: DragEvent | any): void {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    const dropZone = event.target as HTMLElement;
    dropZone.classList.add('drag-over');
  }

  handleDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = event.target as HTMLElement;
    dropZone.classList.remove('drag-over');
  }

  handleFileInput(event: Event | any): void {
    const file = event.target.files[0];
    this.addImageForm.get('image')?.setValue(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imageUrl = reader.result;
    };
  }

}
