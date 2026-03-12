import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { provinces } from '../../leafletZim/provinces';
import { districts } from '../../leafletZim/districts';

import 'leaflet-easyprint';
import Swal from 'sweetalert2';

const apiUrl = environment.apiUrl;
@Component({
  selector: 'projectgeocoverage',
  templateUrl: './projectgeocoverage.component.html',
})
export class ProjectgeocoverageComponent implements OnInit {
  currentUser: any;

  selectedtab: number = 1;
  dataTable: any;
  highlightedProvinces: { [id: number]: boolean } = {};
  editObject: any = {};

  geoJSONProvincesLayer: any;
  geoJSONDistrictsLayer: any;
  highlightedDistricts: { [name: string]: boolean } = {};
  bigImage: any;
  highlightedWards: { [name: string]: boolean } = {};
  geoJSONWardsLayer: any;
  title: string = 'Sites';
  wards: any;
  clustersData: any;
  geoJSONClustersLayer: any;
  wardColors: any;
  wardCodes: any;

  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.http.get(apiUrl + '/CoveredWard/wards').subscribe((data: any) => {
      this.wards = data;
      if (data == null) {
        console.log('null');
      }
    });
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.initMap();
    this.loadSites();
  }

  refresh() {
    switch (this.selectedtab) {
      case 1:
        this.loadSites();
        break;
      case 2:
        this.loadProvinces();
        break;
      case 3:
        this.loadDistricts();
        break;
      case 4:
        this.loadWards();
        break;
      case 4:
        this.loadClusters();
        break;
      default:
        this.loadSites();
    }
  }

  private markers: L.Marker[] = [];
  private map!: L.Map;
  private centroid: L.LatLngExpression = [
    -18.960793764446468, 29.5238220856469,
  ]; //

  private initMap(): void {
    this.map = L.map('map', {
      center: this.centroid,
      zoom: 7,
    });

    const tiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 20,
        minZoom: 1,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );

    tiles.addTo(this.map);
  }

  public getRegister(endpoint: any, tablename: any) {
    this.http.get<any[]>(`${apiUrl}/${endpoint}`).subscribe(
      (data: any) => {
        if (this.dataTable) {
          this.dataTable.clear().destroy();
          const dataTableElement = $('#dtPGC');
          if (dataTableElement.length) {
            dataTableElement.empty();
          }
        }
        this.initializeDataTable(data, tablename);
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  private initializeDataTable(data: any[], tablename: any) {
    if (!data || data.length === 0) {
      console.error('No data available.');
      return;
    }
    const columns: any[] = Object.keys(data[0]).map((key) => ({
      data: key,
      title: key,
    }));

    var editButtonColumn;

    switch (this.selectedtab) {
      case 1:
        editButtonColumn = [
          {
            data: 'action',
            defaultContent:
              '<button class="btn btn-sm btn-icon-only btn-outline-secondary mb-0 btn-sm d-flex align-items-center justify-content-center px-3" data-bs-toggle="modal" data-bs-target="#sitedetailsmodal"><i class="fa fa-pencil" aria-hidden="true"></i></button>',
            title: '',
            createdCell: (
              cell: any,
              cellData: any,
              rowData: any,
              rowIndex: number,
              colIndex: number
            ) => {
              if (
                rowData.siteType === 'Water Point' ||
                rowData.siteType === 'Irrigation Scheme'
              ) {
                $(cell).find('button').prop('disabled', true);
              } else {
                $(cell).on('click', () => {
                  this.editObject = rowData;
                });
              }
            },
          },
          {
            data: 'action',
            defaultContent:
              '<button class="btn btn-sm btn-danger mb-0 btn-sm d-flex align-items-center justify-content-center px-3"><i class="fa fa-trash" aria-hidden="true"></i></button>',
            title: '',
            createdCell: (
              cell: any,
              cellData: any,
              rowData: any,
              rowIndex: number,
              colIndex: number
            ) => {
              if (
                rowData.siteType === 'Water Point' ||
                rowData.siteType === 'Irrigation Scheme'
              ) {
                $(cell).find('button').prop('disabled', true);
              } else {
                $(cell).on('click', () => {
                  this.deleteRecord(rowData.id, 'ProjectSite');
                });
              }
            },
          },
        ];
        break;
      default:
        editButtonColumn = [
          {
            data: 'action',
            defaultContent:
              '<button class="btn btn-sm btn-danger mb-0 btn-sm d-flex align-items-center justify-content-center px-3"><i class="fa fa-trash" aria-hidden="true"></i></button>',
            title: '',
            createdCell: (
              cell: any,
              cellData: any,
              rowData: any,
              rowIndex: number,
              colIndex: number
            ) => {
              $(cell).on('click', () => {
                if (this.selectedtab == 2) {
                  this.deleteRecord(rowData.Id, 'CoveredProvince');
                } else if (this.selectedtab == 3) {
                  this.deleteRecord(rowData.Id, 'CoveredDistrict');
                } else if (this.selectedtab == 4) {
                  this.deleteRecord(rowData.Id, 'CoveredWard');
                } else if (this.selectedtab == 5) {
                  this.deleteRecord(rowData.id, 'CoveredCluster');
                }
              });
            },
          },
        ];
    }

    const updatedColumns = [...editButtonColumn, ...columns];

    const dtOptions: any = {
      processing: true,
      pagingType: 'full_numbers',
      pageLength: 25,
      columns: updatedColumns,
      dom: 'BfrtipP',
      buttons: ['copy', 'print', 'excel', 'colvis'],
      initComplete: function (this: any) {
        const api = this.api();

        const headerRow = api.table().header().querySelector('tr');
        const searchRow = document.createElement('tr');
        api.columns().every(function (this: any) {
          const column = this;
          const searchCell = document.createElement('th');
          const input = document.createElement('input');
          input.placeholder = 'Search';
          input.className = 'form-control form-control-sm';
          input.addEventListener('keyup', function () {
            column.search(this.value).draw();
          });
          searchCell.appendChild(input);
          searchRow.appendChild(searchCell);
        });

        headerRow.insertAdjacentElement('afterend', searchRow);
      },
    };

    this.dataTable = $(`#${tablename}`).DataTable(dtOptions);

    if (data && data.length > 0) {
      this.dataTable.rows.add(data).draw();
    }
  }

  deleteRecord(id: number, endpoint: string): void {
    const url = `${apiUrl}/${endpoint}/${id}`; // Replace with your API base URL

    this.http.delete(url).subscribe(
      (response) => {
        if (this.selectedtab == 1) {
          this.loadSites();
        } else if (this.selectedtab == 2) {
          this.loadProvinces();
        } else if (this.selectedtab == 3) {
          this.loadDistricts();
        } else if (this.selectedtab == 3) {
          this.loadWards();
        } else if (this.selectedtab == 3) {
          this.loadClusters();
        }
        Swal.fire({
          icon: 'success',
          title: 'Geo Coverage',
          text: 'Error saving record',
        });
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Geo Coverage',
          text: 'Error saving record',
        });
      }
    );
  }

  fetchSitesAndHighlight() {
    this.http.get<any[]>(apiUrl + '/ProjectSite/mixed').subscribe(
      (data: any[]) => {
        this.addMarkers(data);
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  private addMarkers(sites: any): void {
    this.clearMarkers();

    sites.forEach((site: any) => {
      var coordinates = [site.latitude, site.longitude];
      var iconUrl = this.getIconUrl(site.siteType); // Get icon URL based on siteType
      const marker = L.marker(coordinates as L.LatLngExpression, {
        icon: L.icon({
          iconUrl,
          iconSize: [35, 35],
          iconAnchor: [17, 17],
        }),
      }).addTo(this.map); // Use icon URL when adding marker
      marker
        .bindPopup(
          `<b>${site.name}</b><br>${site.siteType}<br><b>Stats</b><br>Men:${site.men}<br>Women:${site.women}<br>Youth:${site.youth}<br>Total:${site.numberOfIndividuals}`
        )
        .openPopup();
      this.markers.push(marker);
    });
  }

  private getIconUrl(siteType: string): string {
    switch (siteType) {
      case 'Water Point':
        return 'assets/img/water.png';
      case 'Irrigation Scheme':
        return 'assets/img/green.png';
      default:
        return 'assets/img/red.png';
    }
  }

  private clearMarkers(): void {
    this.markers.forEach((marker) => {
      this.map.removeLayer(marker);
    });
    this.markers = [];
  }

  fetchProvincesAndHighlight() {
    this.http
      .get<any>(apiUrl + '/CoveredProvince')
      .subscribe((data: number[]) => {
        data.forEach((province: number) => {
          this.highlightedProvinces[province] = true; // Highlight received provinces
        });
        this.addGeoJSONProvincesLayer(); // After fetching provinces, add GeoJSON layer
      });
  }

  addGeoJSONProvincesLayer() {
    this.geoJSONProvincesLayer = L.geoJSON(provinces, {
      style: (feature: any) => ({
        fillColor: this.highlightedProvinces[feature.properties.name]
          ? 'green'
          : 'transparent',
        fillOpacity: 0.5,
        color: 'black',
        weight: 1,
      }),
    }).addTo(this.map);

    this.map.fitBounds(this.geoJSONProvincesLayer.getBounds());
  }

  // addGeoJSONProvincesLayer() {
  //   if (!provinces || !('features' in provinces)) {
  //     console.error('Invalid GeoJSON data');
  //     return;
  //   }

  //   // Filter only the provinces that are highlighted (from API)
  //   const selectedProvincesData = (
  //     provinces as GeoJSON.FeatureCollection
  //   ).features.filter(
  //     (feature: GeoJSON.Feature) =>
  //       this.highlightedProvinces[feature.properties?.['name']]
  //   );

  //   if (selectedProvincesData.length === 0) {
  //     console.warn('No matching provinces found from API data');
  //     return;
  //   }

  //   // Remove previous province layer before adding a new one
  //   if (this.geoJSONProvincesLayer) {
  //     this.map.removeLayer(this.geoJSONProvincesLayer);
  //   }

  //   // Add filtered provinces to the map
  //   this.geoJSONProvincesLayer = L.geoJSON(
  //     {
  //       type: 'FeatureCollection',
  //       features: selectedProvincesData,
  //     } as GeoJSON.FeatureCollection,
  //     {
  //       style: (feature: any) => ({
  //         fillColor: 'green', // Highlight only API provinces
  //         fillOpacity: 0.5,
  //         color: 'black',
  //         weight: 2,
  //       }),
  //       onEachFeature: (feature, layer) => {
  //         if (feature.properties?.name) {
  //           layer
  //             .bindTooltip(feature.properties.name, {
  //               permanent: true,
  //               direction: 'center',
  //               className: 'province-label',
  //             })
  //             .openTooltip();
  //         }
  //       },
  //     }
  //   ).addTo(this.map);

  //   // Fit bounds to the highlighted provinces
  //   const bounds = this.geoJSONProvincesLayer.getBounds();
  //   if (bounds.isValid()) {
  //     this.map.fitBounds(bounds);
  //   }
  // }

  clearGeoJSONProvincesLayer() {
    if (this.map && this.geoJSONProvincesLayer) {
      this.map.removeLayer(this.geoJSONProvincesLayer);
      this.highlightedProvinces = {};
    }
  }

  fetchDistrictsAndHighlight() {
    this.http
      .get<string[]>(apiUrl + '/CoveredDistrict')
      .subscribe((data: string[]) => {
        this.highlightedDistricts = {}; // Clear previous data

        data.forEach((district: string) => {
          this.highlightedDistricts[district] = true; // Store highlighted districts
        });

        this.addGeoJSONDistrictsLayer(); // Call the function after fetching data
      });
  }

  // addGeoJSONDistrictsLayer() {
  //   this.geoJSONDistrictsLayer = L.geoJSON(districts, {
  //     style: (feature: any) => ({
  //       fillColor: this.highlightedDistricts[feature.properties.DISTRICT]
  //         ? 'green'
  //         : 'transparent',
  //       fillOpacity: 0.5,
  //       color: 'black',
  //       weight: 1,
  //     }),
  //   }).addTo(this.map);
  //   this.map.fitBounds(this.geoJSONDistrictsLayer.getBounds());
  // }

  addGeoJSONDistrictsLayer() {
    if (!districts || !('features' in districts)) {
      console.error('Invalid GeoJSON data');
      return;
    }

    // Filter only the districts that are highlighted (from API)
    const selectedDistrictData = (
      districts as GeoJSON.FeatureCollection
    ).features.filter(
      (feature: GeoJSON.Feature) =>
        this.highlightedDistricts[feature.properties?.['DISTRICT']]
    );

    if (selectedDistrictData.length === 0) {
      console.warn('No matching districts found from API data');
      return;
    }

    // Remove the previous district layer before adding a new one
    if (this.geoJSONDistrictsLayer) {
      this.map.removeLayer(this.geoJSONDistrictsLayer);
    }

    // Add filtered districts to the map
    this.geoJSONDistrictsLayer = L.geoJSON(
      {
        type: 'FeatureCollection',
        features: selectedDistrictData,
      } as GeoJSON.FeatureCollection,
      {
        style: (feature: any) => ({
          fillColor: 'green', // Highlight only API districts
          fillOpacity: 0.5,
          color: 'black',
          weight: 2,
        }),
        onEachFeature: (feature, layer) => {
          if (feature.properties?.DISTRICT) {
            layer
              .bindTooltip(feature.properties.DISTRICT, {
                permanent: true,
                direction: 'center',
                className: 'district-label',
              })
              .openTooltip();
          }
        },
      }
    ).addTo(this.map);

    // Fit bounds to the highlighted districts
    const bounds = this.geoJSONDistrictsLayer.getBounds();
    if (bounds.isValid()) {
      this.map.fitBounds(bounds);
    }
  }

  clearGeoJSONDistrictsLayer() {
    if (this.map && this.geoJSONDistrictsLayer) {
      this.map.removeLayer(this.geoJSONDistrictsLayer);
      this.highlightedDistricts = {};
    }
  }

  fetchWardsAndHighlight() {
    this.http.get<any>(apiUrl + '/CoveredWard').subscribe((data: any[]) => {
      data.forEach((ward: any) => {
        this.highlightedWards[ward] = true;
      });
      console.log(data);
      this.addGeoJSONWardsLayer();
    });
  }

  addGeoJSONWardsLayer() {
    this.geoJSONWardsLayer = L.geoJSON(this.wards, {
      style: (feature: any) => ({
        fillColor: this.highlightedWards[feature.properties.WARDCODE]
          ? 'green'
          : 'transparent',
        fillOpacity: 0.5,
        color: 'black',
        weight: 1,
      }),
    }).addTo(this.map);
    this.map.fitBounds(this.geoJSONWardsLayer.getBounds());
  }

  clearGeoJSONWardsLayer() {
    if (this.map && this.geoJSONWardsLayer) {
      this.map.removeLayer(this.geoJSONWardsLayer);
      this.highlightedWards = {};
    }
  }

  loadDistricts() {
    this.selectedtab = 3;
    this.title = 'Districts';
    this.clearLayers();
    this.fetchDistrictsAndHighlight();
    this.getRegister('CoveredDistrict/list', 'dtPGC');
  }
  loadProvinces() {
    this.selectedtab = 2;
    this.title = 'Provinces';
    this.clearLayers();
    this.fetchProvincesAndHighlight();
    this.getRegister('CoveredProvince/list', 'dtPGC');
  }
  loadSites() {
    this.selectedtab = 1;
    this.title = 'Sites';
    this.clearLayers();
    this.fetchSitesAndHighlight();
    this.getRegister('ProjectSite/mixed', 'dtPGC');
  }
  loadWards() {
    this.selectedtab = 4;
    this.title = 'Wards';
    this.clearLayers();
    this.fetchWardsAndHighlight();
    this.getRegister('CoveredWard/list', 'dtPGC');
  }
  loadClusters() {
    this.selectedtab = 5;
    this.title = 'Clusters';
    this.clearLayers();
    this.fetchClustersAndHighlight();
    this.getRegister('CoveredCluster/list', 'dtPGC');
  }
  clearLayers() {
    this.clearGeoJSONWardsLayer();
    this.clearMarkers();
    this.clearGeoJSONDistrictsLayer();
    this.clearGeoJSONProvincesLayer();
    this.clearGeoJSONClustersLayer();
  }

  fetchClustersAndHighlight() {
    this.http
      .get<any>(apiUrl + '/CoveredCluster/coveredclusters')
      .subscribe((data: any) => {
        this.clustersData = data;
        console.log(this.clustersData); // Assuming data is in the format { clusterId1: [wardCode1, wardCode2, ...], clusterId2: [...], ... }
        this.colorWardsByCluster();
        this.addGeoJSONClustersLayer();
      });
  }

  colorWardsByCluster() {
    this.wardColors = {};
    Object.keys(this.clustersData).forEach((clusterId: any) => {
      // Generate a random color for each cluster
      const clusterColor = this.getRandomColor();
      // Get the ward codes array for the current cluster
      this.wardCodes = this.clustersData[clusterId];
      // Iterate over the ward codes array and assign the cluster color to each ward
      this.wardCodes.forEach((wardCode: any) => {
        this.wardColors[wardCode] = clusterColor;
      });
    });
  }

  addGeoJSONClustersLayer() {
    this.geoJSONClustersLayer = L.geoJSON(this.wards, {
      style: (feature: any) => ({
        fillColor:
          this.wardColors[feature.properties.WARDCODE] || 'transparent', // Get color from wardColors object, default to transparent
        fillOpacity: 0.5,
        color: 'black',
        weight: 1,
      }),
    }).addTo(this.map);
    this.map.fitBounds(this.geoJSONClustersLayer.getBounds());
  }

  getRandomColor() {
    // Generate a random color in hexadecimal format
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  clearGeoJSONClustersLayer() {
    if (this.map && this.geoJSONClustersLayer) {
      this.map.removeLayer(this.geoJSONClustersLayer);
      this.wardCodes = [];
      this.wardColors = {};
    }
  }
}
