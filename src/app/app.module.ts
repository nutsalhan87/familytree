import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { RelationalComponent } from './relational/relational.component';
import { GraphComponent, MouseDraggableDirective } from './graph/graph.component';
import { GenService } from './gen.service';
import { TemplateManagerComponent } from './curtain-panel/template-manager/template-manager.component';
import { TemplateEditorComponent } from './curtain-panel/template-manager/template-editor/template-editor.component';
import { TemplatesComponent } from './curtain-panel/template-manager/templates/templates.component';
import { CurtainPanelComponent } from './curtain-panel/curtain-panel.component';
import { GenEditorComponent } from './curtain-panel/gen-editor/gen-editor.component';
import { GenInfoComponent } from './curtain-panel/gen-info/gen-info.component';

@NgModule({
    imports: [BrowserModule, FormsModule],
    declarations: [
        AppComponent,
        RelationalComponent,
        GraphComponent,
        TemplateManagerComponent, 
        TemplateEditorComponent, 
        TemplatesComponent, 
        CurtainPanelComponent, 
        GenEditorComponent, 
        GenInfoComponent,
        MouseDraggableDirective
    ],
    bootstrap: [AppComponent],
    providers: [GenService]
})
export class AppModule { }