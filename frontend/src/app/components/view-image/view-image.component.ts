import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { Image } from 'src/app/models/image';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ImageService } from 'src/app/services/image.service';

@Component({
  selector: 'app-view-image',
  templateUrl: './view-image.component.html',
  styleUrls: ['./view-image.component.css']
})
export class ViewImageComponent implements OnInit {

  selectedImageId: string = "";
  image: Image | undefined;
  author: User | undefined;

  constructor(private route: ActivatedRoute, private router: Router, public authService: AuthService, private imageService: ImageService) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      if (params['imageId']) {
        this.selectedImageId = params['imageId'];
      }
    });

    this.imageService.getImageById(this.selectedImageId).pipe(
      switchMap((image: Image | undefined) => {
        if (image === undefined) {
          this.router.navigate(['/images']);
        }
        this.image = image;
        return this.authService.getUserById(this.image?._authorId) as Observable<User>;
      })
    ).subscribe((author: User) => {
      this.author = author;
    });

  }

  deleteImage(): void {
    if (this.authService.getUserId() !== this.image?._authorId) {
      alert('You are not authorized to delete this image');
      return;
    }
    this.imageService.deleteImage(this.selectedImageId).subscribe((res) => {
      this.router.navigate(['/images']);
    });
  }

}
