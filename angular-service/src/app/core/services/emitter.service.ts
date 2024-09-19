import { EventEmitter, Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class EmitterService {
    private _updateImage = new Subject();
    updateImage$ = this._updateImage.asObservable();

    //method to update the image
    updateImage() {
        this._updateImage.next();
    }

}