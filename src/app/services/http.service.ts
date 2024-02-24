import { Injectable } from '@angular/core';
import { SerialLinkService } from './serial-link.service';
import { EventsService } from './events.service';
import { StorageService } from './storage.service';
import { sprintf } from "sprintf-js";
import { HttpClient, HttpHeaders } from '@angular/common/http';

import * as gConst from '../gConst';
import * as gIF from '../gIF'
//import * as _ from 'lodash';

const HTTP_PORT = 18870;

@Injectable({
    providedIn: 'root'
})
export class HttpService {

    firsrRun = true;
    ipAddr = '';

    constructor(private serial: SerialLinkService,
                private http: HttpClient,
                private events: EventsService,
                private storage: StorageService) {
        setTimeout(()=>{
            this.initHttp();
        }, 3000);
    }

    /***********************************************************************************************
     * fn          initHttp
     *
     * brief
     *
     */
    public initHttp(){
        try {
            this.ipAddr = this.storage.getPublicIP();
            this.getIP();
        }
        catch (err) {
            this.ipAddr = '0.0.0.0';
            this.getIP();
            console.log(err);
        }
    }

    /***********************************************************************************************
     * fn          getIP
     *
     * brief
     *
     */
    public getIP(){
        this.http.get('https://jsonip.com',).subscribe((data: any)=>{
            console.log(data);
            if(this.ipAddr != data.ip) {
                try {
                    let dns: gIF.dns_t = this.storage.getFreeDNS();
                    /*
                    let dns: gIF.dns_t = {
                        user: 'serfa',
                        psw: 'EjiNUgjO',
                        domain: 'serfa.crabdance.com',
                        token: 'eEh5aTdPY2RYT21kUVl2aEE1TFZ0MzRXOjE5OTE0MzA4'
                    };
                    */
                    if(dns) {
                        const headers = new HttpHeaders().set("Authorization", 'Basic ' + btoa(dns.user + ':' + dns.psw));
                        let httpReq = 'https://freedns.afraid.org/nic/update?hostname=' + dns.domain;
                        this.http.get(httpReq, {headers: headers, responseType: 'text'}).subscribe((rsp: any) => {
                            console.log(rsp);
                            console.log('ip: ' + data.ip);
                            this.ipAddr = data.ip;
                            this.storage.setPublicIP(data.ip);
                        }, (err)=>{
                            console.log(err);
                        });
                    }
                } catch(err){
                    console.log('get freeDNS err: ' + err.code);
                }
            }
        });
        setTimeout(()=>{
            this.getIP();
        }, 60000);
    }
}
