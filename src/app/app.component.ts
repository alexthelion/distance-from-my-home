import {AfterViewInit, Component, ElementRef, HostListener, NgZone, OnInit, ViewChild} from '@angular/core';
import {GoogleMap, MapCircle} from "@angular/google-maps";
import {MatSelect, MatSelectChange} from "@angular/material/select";
import {SwUpdate} from "@angular/service-worker";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'distanceFromMyHome';
  myPosition: google.maps.LatLngLiteral;
  @ViewChild('map') googleMap: GoogleMap;
  @ViewChild('mapCircle', {static: false}) mapCircle: MapCircle;
  markers: any[] = [];
  @ViewChild('search', {static: true}) public searchElementRef: ElementRef;
  @ViewChild('distanceTypeSelect') public matSelect: MatSelect;
  private autocomplete: google.maps.places.Autocomplete;
  radius: string = "0";
  circleOptions: google.maps.CircleOptions;
  distanceTypes = [{type: 'Meter', coefficient: 1, display: 'מטר'},
    {type: 'Kilometer', coefficient: 1000, display: 'קילומטר'}];
  selectedDistanceType: any;
  screenHeight: any = undefined;

  constructor(private ngZone: NgZone,
              private swUpdate: SwUpdate) {
    this.selectedDistanceType = this.distanceTypes[0];
    this.checkVersionUpdate();
    this.getScreenSize();
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
    this.autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, options);
    this.autocomplete.addListener("place_changed", () => {
      this.ngZone.run(() => {
        const place: google.maps.places.PlaceResult = this.autocomplete.getPlace();
        const address = place.formatted_address;
        this.myPosition = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        }
        this.setCurrentPositionMarker(address);
      });
    });
  }


  displayRadius(): void {
    const radius = +this.radius * this.selectedDistanceType.coefficient;
    this.circleOptions = {radius: radius};
  }

  distanceTypesChanged(event: MatSelectChange): void {
    this.selectedDistanceType = this.distanceTypes.find(val => val.type === event.value);
  }

  private checkVersionUpdate(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        if(confirm("New version available. Load New Version?")) {
          window.location.reload();
        }
      });
    }
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    const screenWidth = window.innerWidth;
    if (screenWidth > 768) {
      this.screenHeight = '78vh';
    }
  }
}
