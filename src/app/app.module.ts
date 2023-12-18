import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { RelationalComponent } from './relational/relational.component';
import { GraphComponent } from './graph/graph.component';
import { GenService } from './gen.service';
import { TemplateManagerComponent } from './curtain-panel/template-manager/template-manager.component';
import { TemplateEditorComponent } from './curtain-panel/template-editor/template-editor.component';
import { CurtainPanelComponent } from './curtain-panel/curtain-panel.component';
import { GenEditorComponent } from './curtain-panel/gen-editor/gen-editor.component';
import { GenInfoComponent } from './curtain-panel/gen-info/gen-info.component';
import { MouseDraggableDirective } from './graph/mousedraggable.directive';
import { LogoSvgComponent } from './logo-svg/logo-svg.component';
import { NgxBootstrapIconsModule, caretDownFill, caretUpFill, infoCircle } from 'ngx-bootstrap-icons';
import { NgxFloatUiModule } from 'ngx-float-ui';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        NgxBootstrapIconsModule.pick({ caretDownFill, caretUpFill, infoCircle }),
        NgxFloatUiModule.forRoot({ positionFixed: true })
    ],
    declarations: [
        AppComponent,
        RelationalComponent,
        GraphComponent,
        TemplateManagerComponent,
        TemplateEditorComponent,
        CurtainPanelComponent,
        GenEditorComponent,
        GenInfoComponent,
        LogoSvgComponent,
        MouseDraggableDirective
    ],
    bootstrap: [AppComponent],
    providers: [GenService]
})
export class AppModule { }