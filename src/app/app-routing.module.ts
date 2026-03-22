import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardsComponent } from './components/dashboards/dashboards.component';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { UsersComponent } from './components/users/users.component';
import { UserprofileComponent } from './components/userprofile/userprofile.component';
import { IndividualbeneficiariesComponent } from './components/individualbeneficiaries/individualbeneficiaries.component';
import { IndividualvbusComponent } from './components/individualvbus/individualvbus.component';
import { IndividualmseComponent } from './components/mses/mses';

import { GroupedbeneficiariesComponent } from './components/groupedbeneficiaries/groupedbeneficiaries.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { HomeComponent } from './components/home/home.component';
import { ProjectviewComponent } from './components/projectview/projectview.component';
import { ProjectbriefComponent } from './components/projectbrief/projectbrief.component';
import { ProjectfilesComponent } from './components/projectfiles/projectfiles.component';
import { ProjectgeocoverageComponent } from './components/projectgeocoverage/projectgeocoverage.component';
import { ProjectobjectivesComponent } from './components/projectobjectives/projectobjectives.component';
import { ProjectoutcomesComponent } from './components/projectoutcomes/projectoutcomes.component';
import { ProjectoutputsComponent } from './components/projectoutputs/projectoutputs.component';
import { ProjectactivitiesComponent } from './components/projectactivities/projectactivities.component';
import { AppointmentsComponent } from './components/appointments/appointments.component';
import { IndicatorsComponent } from './components/indicators/indicators.component';
import { IrrigationschemesComponent } from './components/irrigationschemes/irrigationschemes.component';
import { FieldregisterComponent } from './components/fieldregister/fieldregister.component';
import { MsmeregisterComponent } from './components/msmeregister/msmeregister.component';
import { ManageparametersComponent } from './components/manageparameters/manageparameters.component';
import { IndividualstakeholdersComponent } from './components/individualstakeholders/individualstakeholders.component';
import { OrganisationalstakeholdersComponent } from './components/organisationalstakeholders/organisationalstakeholders.component';
import { BeneficiaryselectionComponent } from './components/beneficiaryselection/beneficiaryselection.component';
import { MsmesComponent } from './components/msmes/msmes.component';
import { IndicatortrackingComponent } from './components/indicatortracking/indicatortracking.component';
import { GroupselectionComponent } from './components/groupselection/groupselection.component';
import { FocusgroupdiscussionsComponent } from './components/focusgroupdiscussions/focusgroupdiscussions.component';
import { ApprovefilesComponent } from './components/approvefiles/approvefiles.component';
import { authGuard } from './guards/authguard.guard';
import { PermissionsComponent } from './components/permissions/permissions.component';
import { RoadsComponent } from './components/roads/roads.component';
import { WaterpointsComponent } from './components/waterpoints/waterpoints.component';
import { ParticipationmatrixComponent } from './components/participationmatrix/participationmatrix.component';
import { FarmerdiaryComponent } from './components/farmerdiary/farmerdiary.component';
import { ActivitiessubcomponentComponent } from './components/activitiessubcomponent/activitiessubcomponent.component';
import { DocumentobjectComponent } from './components/documentobject/documentobject.component';
import { WardsclusterComponent } from './components/wardscluster/wardscluster.component';
import { LogframeComponent } from './components/logframe/logframe.component';
import { IndicatordisaggregationComponent } from './components/indicatordisaggregation/indicatordisaggregation.component';
import { AudittrailComponent } from './components/audittrail/audittrail.component';

import { PersonalLibraryComponent } from './components/personal-library/personal-library.component';

import { Benupload } from './components/benupload/benupload';
import { Mse } from './components/mseupload/mse';
import { Vbu } from './components/vbu/vbu';
import { Matrix } from './components/matrix/matrix';
import { BeneficiaryduplicatesComponent } from './components/duplicates/beneficiaryduplicates/beneficiaryduplicates.component';
import { EmploymentRecordsDuplicatesComponent } from './components/duplicates/employment-records-duplicates/employment-records-duplicates.component';
import { IrrigationSchemesDuplicatesComponent } from './components/duplicates/irrigation-schemes-duplicates/irrigation-schemes-duplicates.component';
import { MseInfosDuplicatesComponent } from './components/duplicates/mse-infos-duplicates/mse-infos-duplicates.component';
import { RoadUsersDuplicatesComponent } from './components/duplicates/road-users-duplicates/road-users-duplicates.component';
import { SchoolBusinessUnitsDuplicatesComponent } from './components/duplicates/school-business-units-duplicates/school-business-units-duplicates.component';
import { VbusDuplicatesComponent } from './components/duplicates/vbus-duplicates/vbus-duplicates.component';
import { WaterUsersDuplicatesComponent } from './components/duplicates/water-users-duplicates/water-users-duplicates.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardsComponent,
        canActivate: [authGuard],
      },
      { path: '', component: LandingComponent, canActivate: [authGuard] },
      { path: 'users', component: UsersComponent, canActivate: [authGuard] },
      {
        path: 'userprofile',
        component: UserprofileComponent,
        canActivate: [authGuard],
      },
      {
        path: 'individualbeneficiaries',
        component: IndividualbeneficiariesComponent,
        canActivate: [authGuard],
      },
      {
        path: 'individualvbus',
        component: IndividualvbusComponent,
        canActivate: [authGuard],
      },

      {
        path: 'individualmse',
        component: IndividualmseComponent,
        canActivate: [authGuard],
      },
      {
        path: 'groupedbeneficiaries',
        component: GroupedbeneficiariesComponent,
        canActivate: [authGuard],
      },
      {
        path: 'projects',
        component: ProjectsComponent,
        canActivate: [authGuard],
      },

      {
        path: 'benupload',
        component: Benupload,
        canActivate: [authGuard],
      },
      {
        path: 'beneficiaryduplicates',
        component: BeneficiaryduplicatesComponent,
        canActivate: [authGuard],
      },
      {
        path: 'mseupload',
        component: Mse,
        canActivate: [authGuard],
      },
      {
        path: 'matrix',
        component: Matrix,
        canActivate: [authGuard],
      },

      {
        path: 'vbus',
        component: Vbu,
        canActivate: [authGuard],
      },
      {
        path: 'fieldregister',
        component: FieldregisterComponent,
        canActivate: [authGuard],
      },
      {
        path: 'msmeregister',
        component: MsmeregisterComponent,
        canActivate: [authGuard],
      },
      {
        path: 'manageparameters',
        component: ManageparametersComponent,
        canActivate: [authGuard],
      },
      {
        path: 'individualstakeholders',
        component: IndividualstakeholdersComponent,
        canActivate: [authGuard],
      },
      {
        path: 'organisationalstakeholders',
        component: OrganisationalstakeholdersComponent,
        canActivate: [authGuard],
      },
      {
        path: 'beneficiaryselection',
        component: BeneficiaryselectionComponent,
        canActivate: [authGuard],
      },
      {
        path: 'groupselection',
        component: GroupselectionComponent,
        canActivate: [authGuard],
      },
      { path: 'msmes', component: MsmesComponent, canActivate: [authGuard] },
      {
        path: 'focusgroupdiscussions',
        component: FocusgroupdiscussionsComponent,
        canActivate: [authGuard],
      },
      {
        path: 'permissions',
        component: PermissionsComponent,
        canActivate: [authGuard],
      },
      {
        path: 'audit',
        component: AudittrailComponent,
        canActivate: [authGuard],
      },
      { path: 'mse-infos-duplicates', component: MseInfosDuplicatesComponent, canActivate: [authGuard] },
      { path: 'employment-records-duplicates', component: EmploymentRecordsDuplicatesComponent, canActivate: [authGuard] },
      { path: 'water-users-duplicates', component: WaterUsersDuplicatesComponent, canActivate: [authGuard] },
      { path: 'school-business-units-duplicates', component: SchoolBusinessUnitsDuplicatesComponent, canActivate: [authGuard] },
      { path: 'road-users-duplicates', component: RoadUsersDuplicatesComponent, canActivate: [authGuard] },
      { path: 'irrigation-schemes-duplicates', component: IrrigationSchemesDuplicatesComponent, canActivate: [authGuard] },
      { path: 'vbus-duplicates', component: VbusDuplicatesComponent, canActivate: [authGuard] },

    ],
  },
  {
    path: 'projectview',
    component: ProjectviewComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'projectbrief',
        component: ProjectbriefComponent,
        canActivate: [authGuard],
      },
      {
        path: 'projectfiles',
        component: ProjectfilesComponent,
        canActivate: [authGuard],
      },
      {
        path: 'projectgeocoverage',
        component: ProjectgeocoverageComponent,
        canActivate: [authGuard],
      },
      {
        path: 'projectobjectives',
        component: ProjectobjectivesComponent,
        canActivate: [authGuard],
      },
      {
        path: 'projectoutcomes',
        component: ProjectoutcomesComponent,
        canActivate: [authGuard],
      },
      {
        path: 'projectoutputs',
        component: ProjectoutputsComponent,
        canActivate: [authGuard],
      },
      {
        path: 'projectactivities',
        component: ProjectactivitiesComponent,
        canActivate: [authGuard],
      },
      {
        path: 'generalactivity',
        component: AppointmentsComponent,
        canActivate: [authGuard],
      },
      {
        path: 'indicators',
        component: IndicatorsComponent,
        canActivate: [authGuard],
      },
      {
        path: 'irrigationshemes',
        component: IrrigationschemesComponent,
        canActivate: [authGuard],
      },
      {
        path: 'indicatortracking',
        component: IndicatortrackingComponent,
        canActivate: [authGuard],
      },
      {
        path: 'approvefiles',
        component: ApprovefilesComponent,
        canActivate: [authGuard],
      },
      {
        path: 'waterpoints',
        component: WaterpointsComponent,
        canActivate: [authGuard],
      },
      { path: 'roads', component: RoadsComponent, canActivate: [authGuard] },
      {
        path: 'participationmatrix',
        component: ParticipationmatrixComponent,
        canActivate: [authGuard],
      },
      {
        path: 'farmerdiaries',
        component: FarmerdiaryComponent,
        canActivate: [authGuard],
      },
      {
        path: 'activitiessubcomponent',
        component: ActivitiessubcomponentComponent,
        canActivate: [authGuard],
      },
      {
        path: 'documentobject',
        component: DocumentobjectComponent,
        canActivate: [authGuard],
      },
      {
        path: 'wardcluster',
        component: WardsclusterComponent,
        canActivate: [authGuard],
      },
      {
        path: 'disaggregation',
        component: IndicatordisaggregationComponent,
        canActivate: [authGuard],
      },
      {
        path: 'logframe',
        component: LogframeComponent,
        canActivate: [authGuard],
      },
      {
        path: 'userlibrary',
        component: PersonalLibraryComponent,
        canActivate: [authGuard],
      },
    ],
  },
  { path: '', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
