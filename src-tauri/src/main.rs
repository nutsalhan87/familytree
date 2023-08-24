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
fn cols(gen_serv: State<GenService>) -> Result<HashSet<String>, String> {
    Ok(gen_serv.information_columns())
}

#[tauri::command]
fn gens(gen_serv: State<GenService>) -> Result<Vec<Gen>, String> {
    Ok(gen_serv
        .inner
        .lock()
        .map_err(|err| err.to_string())?
        .gen_data
        .gens()
        .to_vec())
}

#[tauri::command]
fn save_gen(gen_serv: State<GenService>, gen: Gen) -> Result<(), String> {
    gen_serv
        .inner
        .lock()
        .map_err(|err| err.to_string())?
        .gen_data
        .save_gen(gen)
}

#[tauri::command]
fn delete_gen(gen_serv: State<GenService>, id: u32) -> Result<(), String> {
    gen_serv
        .inner
        .lock()
        .map_err(|err| err.to_string())?
        .gen_data
        .delete_gen(id)
}

#[tauri::command]
fn templates(gen_serv: State<GenService>) -> Result<HashMap<String, HashSet<String>>, String> {
    Ok(gen_serv
        .inner
        .lock()
        .map_err(|err| err.to_string())?
        .gen_data
        .templates()
        .clone())
}

#[tauri::command]
fn save_template(
    gen_serv: State<GenService>,
    name: String,
    properties: HashSet<String>,
) -> Result<(), String> {
    gen_serv
        .inner
        .lock()
        .map_err(|err| err.to_string())?
        .gen_data
        .save_template(&name, properties)
}

#[tauri::command]
fn delete_template(gen_serv: State<GenService>, name: String) -> Result<(), String> {
    gen_serv
        .inner
        .lock()
        .map_err(|err| err.to_string())?
        .gen_data
        .delete_template(&name)
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
            let open = CustomMenuItem::new("open", "Открыть").accelerator("ctrl + O");
            let sep = MenuItem::Separator;
            let save = CustomMenuItem::new("save", "Сохранить").accelerator("ctrl + S");
            let save_as =
                CustomMenuItem::new("save_as", "Сохранить как...").accelerator("ctrl + shift + S");
            let submenu = Submenu::new(
                "Файл",
                Menu::new()
                    .add_item(open)
                    .add_native_item(sep)
                    .add_item(save)
                    .add_item(save_as),
            );
            menu.add_submenu(submenu)
        })
        .on_menu_event(|event| {
            let window = event.window().clone();
            let gen_serv = event.window().state::<GenService>();
            match event.menu_item_id() {
                "open" => {
                    gen_serv.open(move || {
                        window.emit("file_opened", ()).unwrap();
                    });
                }
                "save" => {
                    gen_serv.save();
                }
                "save_as" => {
                    gen_serv.save_as();
                }
                _ => (),
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
