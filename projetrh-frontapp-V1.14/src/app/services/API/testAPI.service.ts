import {Injectable} from "@angular/core";
import {GenericAPIService} from "./genericAPI.service";
import {Test} from "../../models/test.model";

@Injectable({
  providedIn: 'root',
})
export class TestAPIService extends GenericAPIService<Test> {

  constructor() {
    super();
    this.itemName = 'test';
    this.apiUrl = '/aubay-HRProject/tests';
    this.initializeMessages();
  }

}
