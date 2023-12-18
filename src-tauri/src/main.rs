// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod gen_service;

use std::collections::HashSet;

use gen_service::*;
use tauri::{CustomMenuItem, Manager, Menu, MenuItem, State, Submenu, Window};

enum HotKey {
    CtrlN,
    CtrlO,
    CtrlS,
    CtrlShiftS,
    CtrlZ,
    CtrlShiftZ
}

impl Into<String> for HotKey {
    fn into(self) -> String {
        if cfg!(macos) {
            match self {
                HotKey::CtrlN => "cmd + N".to_string(),
                HotKey::CtrlO => "cmd + O".to_string(),
                HotKey::CtrlS => "cmd + S".to_string(),
                HotKey::CtrlShiftS => "cmd + shift + S".to_string(),
                HotKey::CtrlZ => "cmd + Z".to_string(),
                HotKey::CtrlShiftZ => "cmd + shift + Z".to_string(),
            }
        } else {
            match self {
                HotKey::CtrlN => "ctrl + N".to_string(),
                HotKey::CtrlO => "ctrl + O".to_string(),
                HotKey::CtrlS => "ctrl + S".to_string(),
                HotKey::CtrlShiftS => "ctrl + shift + S".to_string(),
                HotKey::CtrlZ => "ctrl + Z".to_string(),
                HotKey::CtrlShiftZ => "ctrl + shift + Z".to_string(),
            }
        }
    }
}

#[tauri::command]
fn message(window: tauri::Window, title: &str, msg: &str) -> Result<(), String> {
    tauri::api::dialog::message(Some(&window), title, msg);
    Ok(())
}

#[tauri::command]
fn save_gen(
    gen_serv: State<GenService>,
    window: Window,
    gen: Gen,
    old_id: Option<u32>,
) -> Result<(), String> {
    gen_serv.save_history();
    if let Some(old_id) = old_id {
        let _ = gen_serv.delete_gen(old_id);
    }
    gen_serv.save_gen(gen)?;
    window
        .emit("gendata-updated", gen_serv.gen_data_clone())
        .unwrap();
    Ok(())
}

#[tauri::command]
fn delete_gen(gen_serv: State<GenService>, window: Window, id: u32) -> Result<(), String> {
    gen_serv.save_history();
    gen_serv.delete_gen(id)?;
    window
        .emit("gendata-updated", gen_serv.gen_data_clone())
        .unwrap();
    Ok(())
}

#[tauri::command]
fn save_template(
    gen_serv: State<GenService>,
    window: Window,
    name: String,
    properties: HashSet<String>,
    old_name: Option<String>,
) -> Result<(), String> {
    gen_serv.save_history();
    if let Some(old_name) = old_name {
        let _ = gen_serv.delete_template(&old_name);
    }
    gen_serv.save_template(&name, properties)?;
    window
        .emit("gendata-updated", gen_serv.gen_data_clone())
        .unwrap();
    Ok(())
}

#[tauri::command]
fn delete_template(
    gen_serv: State<GenService>,
    window: Window,
    name: String,
) -> Result<(), String> {
    gen_serv.save_history();
    gen_serv.delete_template(&name)?;
    window
        .emit("gendata-updated", gen_serv.gen_data_clone())
        .unwrap();
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .manage(GenService::new())
        .invoke_handler(tauri::generate_handler![
            message,
            save_gen,
            delete_gen,
            save_template,
            delete_template
        ])
        .menu({
            let menu = Menu::new();

            let new = CustomMenuItem::new("new", "Новый").accelerator(HotKey::CtrlN);
            let open = CustomMenuItem::new("open", "Открыть").accelerator(HotKey::CtrlO);
            let sep = MenuItem::Separator;
            let save = CustomMenuItem::new("save", "Сохранить").accelerator(HotKey::CtrlS);
            let save_as =
                CustomMenuItem::new("save_as", "Сохранить как...").accelerator(HotKey::CtrlShiftS);
            let file_menu = Submenu::new(
                "Файл",
                Menu::new()
                    .add_item(new)
                    .add_native_item(sep.clone())
                    .add_item(open)
                    .add_native_item(sep)
                    .add_item(save)
                    .add_item(save_as),
            );

            let undo = CustomMenuItem::new("undo", "Назад").accelerator(HotKey::CtrlZ);
            let redo = CustomMenuItem::new("redo", "Вперед").accelerator(HotKey::CtrlShiftZ);
            let step_menu = Submenu::new("Правка", Menu::new().add_item(undo).add_item(redo));

            menu.add_submenu(file_menu).add_submenu(step_menu)
        })
        .on_menu_event(|event| {
            let window = event.window().clone();
            let gen_serv = event.window().state::<GenService>();
            match event.menu_item_id() {
                "new" => {
                    gen_serv.clear();
                    window
                        .emit("gendata-updated", gen_serv.gen_data_clone())
                        .unwrap();
                }
                "open" => {
                    gen_serv.open(move |gen_data| {
                        window.emit("gendata-updated", gen_data).unwrap();
                    });
                }
                "save" => {
                    gen_serv.save();
                }
                "save_as" => {
                    gen_serv.save_as();
                }
                "redo" => {
                    gen_serv.redo();
                    window
                        .emit("gendata-updated", gen_serv.gen_data_clone())
                        .unwrap();
                }
                "undo" => {
                    gen_serv.undo();
                    window
                        .emit("gendata-updated", gen_serv.gen_data_clone())
                        .unwrap();
                }
                _ => (),
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
