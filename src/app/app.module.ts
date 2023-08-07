import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { RelationalComponent } from './relational/relational.component';
import { GraphComponent } from './graph/graph.component';
import { GenService } from './gen.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable'
import { TemplateManagerComponent } from './curtain-panel/template-manager/template-manager.component';
import { TemplateEditorComponent } from './curtain-panel/template-manager/template-editor/template-editor.component';
import { TemplatesComponent } from './curtain-panel/template-manager/templates/templates.component';
import { CurtainPanel } from './curtain-panel/curtain-panel.component';
import { GenEditorComponent } from './curtain-panel/gen-editor/gen-editor.component';

@NgModule({
    imports: [BrowserModule, FormsModule, NgxDatatableModule],
    declarations: [AppComponent, RelationalComponent, GraphComponent, TemplateManagerComponent, TemplateEditorComponent, TemplatesComponent, CurtainPanel, GenEditorComponent],
    bootstrap: [AppComponent],
    providers: [GenService]
})
export class AppModule { }