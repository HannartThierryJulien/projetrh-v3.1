import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Subject, takeUntil} from "rxjs";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Test} from "../../../models/test.model";
import {TestAPIService} from "../../../services/API/testAPI.service";

@Component({
  selector: 'app-test-edit',
  templateUrl: './test-edit.component.html',
  styleUrl: './test-edit.component.scss'
})
export class TestEditComponent implements OnInit, OnDestroy {
  testForm!: FormGroup;
  testToEdit!: Test;
  private unsubscribe$ = new Subject<void>();

  constructor(private testAPIService: TestAPIService,
              private formBuilder: FormBuilder,
              public dialogRef: MatDialogRef<TestEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Test) {
  }

  ngOnInit(): void {
    // Recover test to edit
    this.testToEdit = this.data;

    if (this.testToEdit) {
      // topicForm initialization
      this.testForm = this.formBuilder.group({
        id: [this.testToEdit.id],
        label: [this.testToEdit.label, Validators.required],
        pointsSum: [this.testToEdit.pointsSum],
        timeLimit: [this.testToEdit.timeLimit],
        creationDate: [this.testToEdit.creationDate, [Validators.required]],
        archived: [this.testToEdit.archived]
      });
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Close the MatDialog of the test-edit component and possibly return updated test
   */
  onClose(updatedData?: { updatedTest: Test }): void {
    this.dialogRef.close(updatedData);
  }

  /**
   * Submit FormGroup
   */
  onSubmit() {
    // Check if the FormGroup is valid
    if (!this.testForm.valid) {
      console.error('Form is invalid.');
      return;
    }

    // Recover updated test
    const updatedTest: Test = {
      id: this.testToEdit.id,
      label: this.testForm.value.label,
      pointsSum: this.testToEdit.pointsSum,
      timeLimit: this.testToEdit.timeLimit,
      creationDate: this.testToEdit.creationDate,
      archived: this.testToEdit.archived
    };

    // Update test in database
    this.testAPIService.editItem(updatedTest)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: updatedTest => {
          this.onClose({updatedTest});
        }
      });
  }

}
