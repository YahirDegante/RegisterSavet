import { Component, OnInit, ViewChild } from '@angular/core';
import { Consultation } from '../../types/consultation';
import { MatTableDataSource } from '@angular/material/table';
import { ConsultationService } from '../../services/consultation.service';
import { GeneralService } from '../../../../services/general.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { AddConsultationComponent } from '../add-consultation/add-consultation.component';

@Component({
	selector: 'app-main-consultation',
	templateUrl: './main-consultation.component.html',
})
export class MainConsultationComponent implements OnInit {
	displayedColumns: string[] = ['#', 'date', 'pet', 'actions'];

	consultations!: MatTableDataSource<Consultation>;

	get isLoading() {
		return this.consultationService.isLoading;
	}

	getAllConsultations() {
		this.consultationService.findAll().subscribe((response: any) => {
			this.consultationService.isLoading = false;
			this.consultations = new MatTableDataSource(response);
			this.consultations.paginator = this.paginator;
			this.consultations.sort = this.sort;
		});
	}

	getDisplayedColumns() {
		if (this.isAdmin()) {
			return this.displayedColumns;
		} else {
			return this.displayedColumns.filter(
				(column) => column !== 'actions'
			);
		}
	}

	isAdmin() {
		return this.generalService.userInfo.role === 'admin';
	}

	constructor(
		private consultationService: ConsultationService,
		private generalService: GeneralService,
		private _liveAnnouncer: LiveAnnouncer,
		public dialog: MatDialog
	) {}

	ngOnInit(): void {
		this.getAllConsultations();
	}

	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;

	// ngAfterViewInit() {}

	announceSortChange(sortState: Sort) {
		if (sortState.direction) {
			this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
		} else {
			this._liveAnnouncer.announce('Sorting cleared');
		}
	}

	openDialog(enterAnimationDuration: string, exitAnimationDuration: string) {
		const modalRef = this.dialog.open(AddConsultationComponent, {
			width: '60%',
			enterAnimationDuration,
			exitAnimationDuration,
			disableClose: true,
		});
		modalRef.afterClosed().subscribe((result: any) => {
			this.consultationService.consultationUpdate = {
				consultation_id: 0,
				consultation_date: '',
				pet: {
					id: 0,
					name: '',
					breed: '',
					gender: '',
					weight: 0,
					user: {},
				},
			};
			this.consultationService.edit = false;
			this.getAllConsultations();
		});
	}

	editConsultation(consultation: any) {
		this.consultationService.edit = true;
		this.consultationService.consultationUpdate = {
			...consultation,
		};
		this.openDialog('2ms', '1ms');
	}

	deletePet(id: number) {
		this.consultationService.delete(id).subscribe((response: any) => {
			this.consultationService.isLoading = false;
			this.getAllConsultations();
		});
	}
}
