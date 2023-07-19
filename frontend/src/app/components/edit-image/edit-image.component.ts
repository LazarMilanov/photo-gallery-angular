import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Image } from 'src/app/models/image';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ImageService } from 'src/app/services/image.service';

@Component({
  selector: 'app-edit-image',
  templateUrl: './edit-image.component.html',
  styleUrls: ['./edit-image.component.css']
})
export class EditImageComponent implements OnInit {

  selectedImageId: string = "";

  image: Image | undefined;
  editImageForm: FormGroup;

  constructor(private route: ActivatedRoute, private router: Router, private formBuilder: FormBuilder, private imageService: ImageService, private authService: AuthService) {
    this.editImageForm = this.formBuilder.group({
      description: [''],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      if (params['imageId']) {
        this.selectedImageId = params['imageId'];
      }
    });

    this.imageService.getImageById(this.selectedImageId).subscribe((image: Image | undefined) => {
      if (image === undefined) {
        this.router.navigate(['/images']);
      }
      if (this.authService.getUserId() === image?._authorId) {
        this.image = image;
        this.editImageForm.get('description')?.setValue(this.image?.description);
      } else {
        this.router.navigate(['/images']);
      }
    });

  }

  editImageDescription(): void {
    
    const editImageData = this.editImageForm.value;
    const description = editImageData.description;
    if (description) {
      this.imageService.updateImageDescription(this.selectedImageId, description).subscribe((res) => {
        this.router.navigate(['/view-image', this.selectedImageId]);
      });
    } else {
      alert('Missing Image or Description');
    }
  }



}
