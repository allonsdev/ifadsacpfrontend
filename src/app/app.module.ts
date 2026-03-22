import {
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
  NgModule,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { DataTablesModule } from 'angular-datatables';
import { AppComponent } from './app.component';
import { LandingComponent } from './components/landing/landing.component';
// import { DashboardsComponent } from './components/dashboards/dashboards.component';
import { LoginComponent } from './components/login/login.component';
import { Matrix } from './components/matrix/matrix';
import { BarchartElement } from './elements/barchat/barchart.element';
import { StatscardElement } from './elements/statscard/statscard.element';
import { PiechartElement } from './elements/piechart/piechart.element';
import { SidebarElement } from './elements/sidebar/sidebar.element';
import { DatatableElement } from './elements/datatable/datatable.element';
import { UsersComponent } from './components/users/users.component';
import { FooterElement } from './elements/footer/footer.element';
import { UsersmodalElement } from './elements/usersmodal/usersmodal.element';
import { UserprofileComponent } from './components/userprofile/userprofile.component';
import { EditprofilemodalElement } from './elements/editprofilemodal/editprofilemodal.element';
import { IndividualbeneficiariesComponent } from './components/individualbeneficiaries/individualbeneficiaries.component';
import { GroupedbeneficiariesComponent } from './components/groupedbeneficiaries/groupedbeneficiaries.component';
import { BeneficiarydetailsmodalElement } from './elements/beneficiarydetailsmodal/beneficiarydetailsmodal.element';
import { ProjectsComponent } from './components/projects/projects.component';
import { ProjectdetailsmodalElement } from './elements/projectdetailsmodal/projectdetailsmodal.element';
import { HomeComponent } from './components/home/home.component';
import { ProjectviewComponent } from './components/projectview/projectview.component';
import { ProjectmenuElement } from './elements/projectmenu/projectmenu.element';
import { ProjectbriefComponent } from './components/projectbrief/projectbrief.component';
import { ProjectfilesComponent } from './components/projectfiles/projectfiles.component';
import { ProjectgeocoverageComponent } from './components/projectgeocoverage/projectgeocoverage.component';
import { FiledetailsmodalElement } from './elements/filedetailsmodal/filedetailsmodal.element';
import { ProjectobjectivesComponent } from './components/projectobjectives/projectobjectives.component';
import { ProjectoutcomesComponent } from './components/projectoutcomes/projectoutcomes.component';
import { ProjectoutputsComponent } from './components/projectoutputs/projectoutputs.component';
import { ProjectactivitiesComponent } from './components/projectactivities/projectactivities.component';
import { AppointmentsComponent } from './components/appointments/appointments.component';
import { AppointmentdetailsmodalElement } from './elements/appointmentdetailsmodal/appointmentdetailsmodal.element';
import { AppointmentElement } from './elements/appointmentv2/appointment';
import { IndicatorsComponent } from './components/indicators/indicators.component';
import { IndicatordetailsmodalElement } from './elements/indicatordetailsmodal/indicatordetailsmodal.element';
import { IrrigationschemesComponent } from './components/irrigationschemes/irrigationschemes.component';
import { IrrigationschemesmodalElement } from './elements/irrigationschemesmodal/irrigationschemesmodal.element';
import { FieldregisterComponent } from './components/fieldregister/fieldregister.component';
import { MsmeregisterComponent } from './components/msmeregister/msmeregister.component';
import { ManageparametersmodalElement } from './elements/manageparametersmodal/manageparametersmodal.element';
import { ManageparametersComponent } from './components/manageparameters/manageparameters.component';
import { BeneficiaryselectionComponent } from './components/beneficiaryselection/beneficiaryselection.component';
import { SitedetailsmodalElement } from './elements/sitedetailsmodal/sitedetailsmodal.element';
import { GroupdetailsmodalElement } from './elements/groupdetailsmodal/groupdetailsmodal.element';
import { IndividualstakeholdersComponent } from './components/individualstakeholders/individualstakeholders.component';
import { OrganisationalstakeholdersComponent } from './components/organisationalstakeholders/organisationalstakeholders.component';
import { IndividualstakeholderdetailsmodalElement } from './elements/individualstakeholderdetailsmodal/individualstakeholderdetailsmodal.element';
import { OrganisationalstakeholderdetailsmodalElement } from './elements/organisationalstakeholderdetailsmodal/organisationalstakeholderdetailsmodal.element';
import { MsmesComponent } from './components/msmes/msmes.component';
import { IndicatortrackingComponent } from './components/indicatortracking/indicatortracking.component';
import { GroupselectionComponent } from './components/groupselection/groupselection.component';
import { ViewparticipationmodalElement } from './elements/viewparticipationmodal/viewparticipationmodal.element';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FocusgroupdiscussionsComponent } from './components/focusgroupdiscussions/focusgroupdiscussions.component';
import { ApprovefilesComponent } from './components/approvefiles/approvefiles.component';
import { NgIdleModule } from '@ng-idle/core';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { PermissionsComponent } from './components/permissions/permissions.component';
import { ParticipationmatrixComponent } from './components/participationmatrix/participationmatrix.component';
import { WaterpointsComponent } from './components/waterpoints/waterpoints.component';
import { RoadsComponent } from './components/roads/roads.component';
import { WaterpointsmodalElement } from './elements/waterpointsmodal/waterpointsmodal.element';
import { Benupload } from './components/benupload/benupload';
import { Mse } from './components/mseupload/mse';
import { Vbu } from './components/vbu/vbu';

import { RoadsmodalElement } from './elements/roadsmodal/roadsmodal.element';
import { FocusgroupattachmentsmodalComponent } from './elements/focusgroupattachmentsmodal/focusgroupattachmentsmodal.component';
import { FarmerdiaryComponent } from './components/farmerdiary/farmerdiary.component';
import { ActivitiessubcomponentComponent } from './components/activitiessubcomponent/activitiessubcomponent.component';
import { DocumentobjectComponent } from './components/documentobject/documentobject.component';
import { WardsclusterComponent } from './components/wardscluster/wardscluster.component';
import { LogframeComponent } from './components/logframe/logframe.component';
import { IndicatordisaggregationComponent } from './components/indicatordisaggregation/indicatordisaggregation.component';
import { TreeTableModule } from 'primeng/treetable';
import { TableModule } from 'primeng/table';
import { ListboxModule } from 'primeng/listbox';
import { AudittrailComponent } from './components/audittrail/audittrail.component';
import { PersonalLibraryComponent } from './components/personal-library/personal-library.component';
import { BeneficiaryduplicatesComponent } from './components/duplicates/beneficiaryduplicates/beneficiaryduplicates.component';
import { MseInfosDuplicatesComponent } from './components/duplicates/mse-infos-duplicates/mse-infos-duplicates.component';
import { EmploymentRecordsDuplicatesComponent } from './components/duplicates/employment-records-duplicates/employment-records-duplicates.component';
import { WaterUsersDuplicatesComponent } from './components/duplicates/water-users-duplicates/water-users-duplicates.component';
import { SchoolBusinessUnitsDuplicatesComponent } from './components/duplicates/school-business-units-duplicates/school-business-units-duplicates.component';
import { RoadUsersDuplicatesComponent } from './components/duplicates/road-users-duplicates/road-users-duplicates.component';
import { IrrigationSchemesDuplicatesComponent } from './components/duplicates/irrigation-schemes-duplicates/irrigation-schemes-duplicates.component';
import { VbusDuplicatesComponent } from './components/duplicates/vbus-duplicates/vbus-duplicates.component';


@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    // DashboardsComponent,
    LoginComponent,
    BarchartElement,
    StatscardElement,
    PiechartElement,
    SidebarElement,
    DatatableElement,
    UsersComponent,
    FooterElement,
    UsersmodalElement,
    UserprofileComponent,
    EditprofilemodalElement,
    IndividualbeneficiariesComponent,
    GroupedbeneficiariesComponent,
    BeneficiarydetailsmodalElement,
    ProjectsComponent,
    ProjectdetailsmodalElement,
    HomeComponent,
    ProjectviewComponent,
    ProjectmenuElement,
    ProjectbriefComponent,
    ProjectfilesComponent,
    ProjectgeocoverageComponent,
    FiledetailsmodalElement,
    ProjectobjectivesComponent,
    ProjectoutcomesComponent,
    ProjectoutputsComponent,
    ProjectactivitiesComponent,
    AppointmentsComponent,
    AppointmentdetailsmodalElement,
    AppointmentElement,
    IndicatorsComponent,
    IndicatordetailsmodalElement,
    IrrigationschemesComponent,
    IrrigationschemesmodalElement,
    FieldregisterComponent,
    MsmeregisterComponent,
    ManageparametersComponent,
    ManageparametersmodalElement,
    BeneficiaryselectionComponent,
    SitedetailsmodalElement,
    GroupdetailsmodalElement,
    IndividualstakeholdersComponent,
    OrganisationalstakeholdersComponent,
    IndividualstakeholderdetailsmodalElement,
    OrganisationalstakeholderdetailsmodalElement,
    MsmesComponent,
    IndicatortrackingComponent,
    GroupselectionComponent,
    ViewparticipationmodalElement,
    FocusgroupdiscussionsComponent,
    ApprovefilesComponent,
    PermissionsComponent,
    ParticipationmatrixComponent,
    WaterpointsComponent,
    RoadsComponent,
    WaterpointsmodalElement,
    RoadsmodalElement,
    FocusgroupattachmentsmodalComponent,
    FarmerdiaryComponent,
    ActivitiessubcomponentComponent,
    DocumentobjectComponent,
    WardsclusterComponent,
    LogframeComponent,
    IndicatordisaggregationComponent,
    AudittrailComponent,
    PersonalLibraryComponent,
    Benupload,
    Mse,
    Vbu,
    Matrix,
    BeneficiaryduplicatesComponent,
    MseInfosDuplicatesComponent,
    EmploymentRecordsDuplicatesComponent,
    WaterUsersDuplicatesComponent,
    SchoolBusinessUnitsDuplicatesComponent,
    RoadUsersDuplicatesComponent,
    IrrigationSchemesDuplicatesComponent,
    VbusDuplicatesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    HttpClientJsonpModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NgIdleModule,
    NgIdleKeepaliveModule,
    TreeTableModule,
    TableModule,
    ListboxModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppModule { }
