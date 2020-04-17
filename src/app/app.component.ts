import {AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import {GoogleMap} from "@angular/google-maps";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'distanceFromMyHome';
  myPosition: google.maps.LatLngLiteral;
  @ViewChild('map') googleMap: GoogleMap;
  markers: any[] = [];
  @ViewChild('search')  public searchElementRef: ElementRef;

  constructor(private ngZone: NgZone) {
  }

  ngOnInit(): void {
    navigator.geolocation.getCurrentPosition(position => {
      this.myPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }
      this.setCurrentPositionMarker();
    })
  }

  ngAfterViewInit(): void {
    this.findAddress();
  }

  private setCurrentPositionMarker(address?: string): void {
    this.markers = [];
    this.markers.push({
      position: {
        lat: this.myPosition.lat,
        lng: this.myPosition.lng,
      },
      label: {
        color: 'red',
        text: !address ? 'המיקום שלך' : address,
      },
      title: !address ? 'המיקום שלך' : address,
      options: {animation: google.maps.Animation.BOUNCE},
    })
  }

  findAddress(): void {
    const options = {
      componentRestrictions: {country: "il"}
    };
    let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, options);
    autocomplete.addListener("place_changed", () => {
      this.ngZone.run(() => {
        // some details
        const place: google.maps.places.PlaceResult = autocomplete.getPlace();
        const address = place.formatted_address;
        console.log("found address: " + address);
        this.myPosition = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        }
        this.setCurrentPositionMarker(address);
      });
    });
  }


}
