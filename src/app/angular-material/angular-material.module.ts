import { NgModule } from '@angular/core';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from "@angular/material/list";
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
    declarations: [],
    imports: [
        DragDropModule,
        MatDialogModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatIconModule,
        MatSelectModule,
        MatListModule,
        MatOptionModule,
        MatSliderModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatCheckboxModule
    ],
    exports: [
        DragDropModule,
        MatDialogModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatIconModule,
        MatSelectModule,
        MatListModule,
        MatOptionModule,
        MatSliderModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatCheckboxModule
    ]
})
export class AngularMaterialModule {
}
