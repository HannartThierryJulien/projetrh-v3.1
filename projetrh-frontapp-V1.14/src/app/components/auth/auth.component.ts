import {Component, inject, OnDestroy} from '@angular/core';
import {AuthAPIService} from "../../services/API/authAPI.service";
import {Router} from "@angular/router";
import {NgForm} from "@angular/forms";
import {Observable, Subject, takeUntil} from "rxjs";
import {NotificationService} from "../../services/notification.service";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent implements OnDestroy {
  private authAPIService = inject(AuthAPIService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  isLoginMode = true;
  isLoading = false;
  private _userType: string[] = ['candidate', 'hrManager'];
  private unsubscribe$ = new Subject<void>();
  errorMessage: string = '';
  errorHappened: boolean = false;
  showPassword = false;

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
    console.log("en mode login ? " + this.isLoginMode);
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const firstname = form.value.firstname;
    const lastname = form.value.lastname;
    const email = form.value.email;
    const password = form.value.password;

    let authObs: Observable<any>;

    this.isLoading = true;

    if (this.isLoginMode) {
      authObs = this.authAPIService.login(email, password);
    } else {
      authObs = this.authAPIService.signup(lastname, firstname, email, password, new Date());
    }

    authObs
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (responseData: { token: string }) => {
          this.isLoading = false;
          // this.errorHappened = false;
          this.redirectToAppropriatePage();
        },
        error: (errorMessage) => {
          this.errorHappened = true;
          if (this.isLoginMode) {
            this.errorMessage = "Une erreur s'est produite lors de la connexion. Veuillez réessayer.";
          } else {
            this.errorMessage = "Une erreur s'est produite lors de l'inscription. Veuillez réessayer.";
          }
          this.notificationService.showError(this.errorMessage);
          this.isLoading = false;
        }
      });

    // form.reset();
  }

  /**
   * Temporary !
   *
   * @param responseData
   * @private
   */
  private redirectToAppropriatePage() {
    this.authAPIService.user
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(user => {
        if (user == null) {
          return;
        }

        if (user.role === this._userType[1]) {
          this.router.navigate(['/tests']);
        } else if (user.role === this._userType[0]) {
          this.router.navigate(['/dashboard']);
        } else {
          //this.router.navigate(['/tests']);
        }
      });
  }

  /**
   * Used to display, or not, the password in text.
   */
  toggleShowOldPassword() {
    this.showPassword = !this.showPassword;
  }

}

