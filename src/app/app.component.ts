import { Component, OnInit, Input } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { BsModalRef } from "ngx-bootstrap/modal";
import { NgxSpinnerService } from "ngx-spinner";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { GlobalService } from "src/app/services/global/global.service";
import { GlobalUrlsService } from "src/app/services/globalUrls/global-urls.service";
import { BsModalService } from "ngx-bootstrap/modal";
import { Subscription, Subject } from "rxjs";
import { ExcelService } from 'src/app/services/excel/excel.service';
import * as XLSX from 'xlsx';
import { CActivateCodigos } from 'src/app/classes/cPuntosColombia/cPcoActivateCodigos';
import { CPcoUpdateCodigosNetactica } from 'src/app/classes/cPuntosColombia/cPcoUpdateCodigosNetactica';

declare var $: any;

@Component({
  selector: "app-create-codigo-modal",
  templateUrl: "./update-codigos-netactica-modal.component.html",
  styleUrls: ["./update-codigos-netactica-modal.component.scss"],
})
export class UpdateCodigosNetacticaModalComponent implements OnInit {

  public data: any = [];
  public formUpdateCode: FormGroup;
  @Input() cPcoUpdateCodigosNetactica: CPcoUpdateCodigosNetactica;
  @Input() isEdit: boolean;
  public isSubmitted: boolean;
  public subscriptions: Subscription[];
  private isNew: boolean;
  private validateExcel: boolean;
  private listaCodigos: CPcoUpdateCodigosNetactica[];
  public name: string;
  public willDownload: boolean;

  constructor(
    private excelService: ExcelService,
    private toastr: ToastrService,
    private spinnerService: NgxSpinnerService,
    public formBuilder: FormBuilder,
    private modalService: BsModalService,
    public globalService: GlobalService,
    public globalUrlsService: GlobalUrlsService,
    public bsModalRef: BsModalRef

  ) {
    this.listaCodigos = [];
    this.name = 'This is XLSX TO JSON CONVERTER';
    this.willDownload = false;
    this.isSubmitted = false;
    this.subscriptions = [];
    this.isNew = false;
    this.validateExcel = false;

  }


  ngOnInit() {
    if (this.cPcoUpdateCodigosNetactica === undefined) {
      this.cPcoUpdateCodigosNetactica = new CPcoUpdateCodigosNetactica();
      this.isEdit = false;
      this.isNew = true;
    }

    this.formUpdateCode = this.formBuilder.group({
      codigo: [
        this.cPcoUpdateCodigosNetactica.codigo,
        [Validators.required],
      ]
    });
    this.inputMaskInit();

  }

  //Inicializa el inputMask para el formato de moneda
  public inputMaskInit() {
    $(".currency").inputmask("currency", { radixPoint: ',', autounmask: true, rightAlign: false });
  }

  //Funcion que edita el formGroup de las monedas
  public changeValue(event) {
    let id = event.target.id;
    let input = $('#' + id);
    this.formUpdateCode.controls[id].setValue(parseFloat(input.inputmask('unmaskedvalue').replace(",", ".")));
  }

  public submit() {
    if (this.validateExcel) {
      let cPcoUpdateCodigosNetactica: CPcoUpdateCodigosNetactica[] = this.listaCodigos;
      this.addCodigosUsados(cPcoUpdateCodigosNetactica);
    }
  }

  public addCodigosUsados(cPcoUpdateCodigosNetactica: CPcoUpdateCodigosNetactica[]) {
    this.globalService.put(this.globalUrlsService.urlActualizarCogigosNetactica, cPcoUpdateCodigosNetactica)
      .then((result: any) => {
        this.spinnerService.hide();
        this.modalService.setDismissReason("true");
        this.bsModalRef.hide();
        this.toastr.success("", result
