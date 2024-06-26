import {Component, inject, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Candidate} from "../../../../models/candidate.model";
import {Subject, takeUntil} from "rxjs";
import {CandidateAPIService} from "../../../../services/API/candidateAPI.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-candidate-edit',
  templateUrl: './candidate-edit.component.html',
  styleUrl: './candidate-edit.component.scss',
  providers: [DatePipe]
})
export class CandidateEditComponent implements OnInit, OnDestroy {
  private candidateAPIService = inject(CandidateAPIService);
  private formBuilder = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<CandidateEditComponent>);
  public data: Candidate = inject(MAT_DIALOG_DATA);
  private datepipe = inject(DatePipe);

  candidateForm!: FormGroup;
  candidateToEdit!: Candidate;
  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    // Recover candidate to edit
    this.candidateToEdit = this.data;

    if (this.candidateToEdit) {
      // candidateForm initialization
      this.candidateForm = this.formBuilder.group({
        id: [this.candidateToEdit.id],
        mail: [this.candidateToEdit.mail, Validators.required],
        birthDate: [this.candidateToEdit.birthDate],
        phoneNumber: [this.candidateToEdit.phoneNumber],
        professionalProfileUrl: [this.candidateToEdit.professionalProfileUrl],
        archived: [this.candidateToEdit.archived],
        person: [this.candidateToEdit.person]
      });
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Close the MatDialog of the candidate-edit component and possibly return updated candidate
   */
  onClose(updatedData?: { updatedCandidate: Candidate }): void {
    this.dialogRef.close(updatedData);
  }

  /**
   * Submit FormGroup
   */
  onSubmit() {
    // Check if the FormGroup is valid
    if (!this.candidateForm.valid) {
      console.error('Form is invalid.');
      return;
    }

    // Recover updated candidate data (and format date)
    const birthDateFromForm = this.datepipe.transform(this.candidateForm.value.birthDate, 'yyyy-MM-dd');
    const updatedCandidate: Candidate = {
      id: this.candidateToEdit.id,
      mail: this.candidateForm.value.mail,
      birthDate: birthDateFromForm ? new Date(birthDateFromForm) : this.candidateToEdit.birthDate,
      phoneNumber: this.candidateForm.value.phoneNumber,
      professionalProfileUrl: this.candidateForm.value.professionalProfileUrl,
      archived: this.candidateToEdit.archived,
      person: this.candidateToEdit.person
    };

    // Update candidate in database
    this.candidateAPIService.editItem(updatedCandidate)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: updatedCandidate => {
          this.onClose({updatedCandidate});
        }
      });
  }

}
