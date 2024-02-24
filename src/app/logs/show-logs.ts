import { Component, Inject, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { EventsService } from '../services/events.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilsService } from '../services/utils.service';

import * as gConst from '../gConst';
import * as gIF from '../gIF'

@Component({
    selector: 'app-show-logs',
    templateUrl: './show-logs.html',
    styleUrls: ['./show-logs.css']
})
export class ShowLogs implements OnInit, AfterViewInit {

    scrollFlag = true;

    constructor(private dialogRef: MatDialogRef<ShowLogs>,
                @Inject(MAT_DIALOG_DATA) public dlgData: any,
                private events: EventsService,
                public utils: UtilsService,
                private ngZone: NgZone) {
        // ---
    }

    /***********************************************************************************************
     * @fn          ngOnInit
     *
     * @brief
     *
     */
    ngOnInit(): void {
        this.events.subscribe('logMsg', (msg: gIF.msgLogs_t)=>{
            if(this.scrollFlag == true) {
                let logsDiv = document.getElementById('logList');
                if(logsDiv){
                    logsDiv.scrollTop = logsDiv.scrollHeight;
                }
            }
        });
    }
    /***********************************************************************************************
     * @fn          ngAfterViewInit
     *
     * @brief
     *
     */
    ngAfterViewInit(): void {

    }
    /***********************************************************************************************
     * @fn          save
     *
     * @brief
     *
     */
    save() {
        this.dialogRef.close();
    }
    /***********************************************************************************************
     * @fn          close
     *
     * @brief
     *
     */
    close() {
        this.dialogRef.close();
    }

    /***********************************************************************************************
     * fn          autoScroll
     *
     * brief
     *
     */
    autoScrollChange(scroll) {
        console.log(scroll);
        this.scrollFlag = scroll;
        if(scroll == true) {
            let logsDiv = document.getElementById('logList');
            logsDiv.scrollTop = logsDiv.scrollHeight;
        }
    }

    /***********************************************************************************************
     * fn          clearLogs
     *
     * brief
     *
     */
    clearLogs() {
        this.utils.msgLogs = [];
    }

}
