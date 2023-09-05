// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod gen_service;

use std::collections::{HashMap, HashSet};

use gen_service::*;
use tauri::{CustomMenuItem, Manager, Menu, MenuItem, State, Submenu};

#[tauri::command]
fn message(window: tauri::Window, title: &str, msg: &str) -> Result<(), String> {
    tauri::api::dialog::message(Some(&window), title, msg);
    Ok(())
}

#[tauri::command]
fn cols(gen_serv: State<GenService>) -> Result<Vec<String>, String> {
    Ok(gen_serv.information_columns())
}

#[tauri::command]
fn gens(gen_serv: State<GenService>) -> Result<Vec<Gen>, String> {
    Ok(gen_serv.gens())
}

#[tauri::command]
fn save_gen(gen_serv: State<GenService>, gen: Gen, old_id: Option<u32>) -> Result<(), String> {
    gen_serv.save_history();
    if let Some(old_id) = old_id {
        gen_serv.delete_gen(old_id);
    }
    gen_serv.save_gen(gen)
}

#[tauri::command]
fn delete_gen(gen_serv: State<GenService>, id: u32) -> Result<(), String> {
    gen_serv.save_history();
    gen_serv.delete_gen(id)
}

#[tauri::command]
fn templates(gen_serv: State<GenService>) -> Result<HashMap<String, HashSet<String>>, String> {
    Ok(gen_serv.templates())
}

#[tauri::command]
fn save_template(
    gen_serv: State<GenService>,
    name: String,
    properties: HashSet<String>,
    old_name: Option<String>
) -> Result<(), String> {
    gen_serv.save_history();
    if let Some(old_name) = old_name {
        gen_serv.delete_template(&old_name);
    }
    gen_serv.save_template(&name, properties)
}

#[tauri::command]
fn delete_template(gen_serv: State<GenService>, name: String) -> Result<(), String> {
    gen_serv.save_history();
    gen_serv.delete_template(&name)
}

fn main() {
    tauri::Builder::default()
        .manage(GenService::new())
        .invoke_handler(tauri::generate_handler![
            message,
            cols,
            gens,
            save_gen,
            delete_gen,
            templates,
            save_template,
            delete_template
        ])
        .menu({
            let menu = Menu::new();

            let new = CustomMenuItem::new("new", "Новый").accelerator("ctrl + N");
            let open = CustomMenuItem::new("open", "Открыть").accelerator("ctrl + O");
            let sep = MenuItem::Separator;
            let save = CustomMenuItem::new("save", "Сохранить").accelerator("ctrl + S");
            let save_as =
                CustomMenuItem::new("save_as", "Сохранить как...").accelerator("ctrl + shift + S");
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

            let undo = CustomMenuItem::new("undo", "Назад").accelerator("ctrl + Z");
            let redo = CustomMenuItem::new("redo", "Вперед").accelerator("ctrl + shift + Z");
            let step_menu = Submenu::new("Данные", Menu::new().add_item(undo).add_item(redo));

            menu.add_submenu(file_menu).add_submenu(step_menu)
        })
        .on_menu_event(|event| {
            let window = event.window().clone();
            let gen_serv = event.window().state::<GenService>();
            match event.menu_item_id() {
                "new" => {
                    gen_serv.clear();
                    window.emit("gendata-updated", ());
                },
                "open" => {
                    gen_serv.open(move || {
                        window.emit("gendata-updated", ()).unwrap();
                    });
                }
                "save" => {
                    gen_serv.save();
                }
                "save_as" => {
                    gen_serv.save_as();
                },
                "redo" => {
                    gen_serv.redo();
                    window.emit("gendata-updated", ()).unwrap();
                },
                "undo" => {
                    gen_serv.undo();
                    window.emit("gendata-updated", ()).unwrap();
                }
                _ => (),
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
