// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod gen_service;

use std::{
    collections::{HashMap, HashSet},
    sync::Mutex,
};

use gen_service::*;
use tauri::State;

#[tauri::command]
fn message(window: tauri::Window, title: &str, msg: &str) -> Result<(), String> {
    tauri::api::dialog::message(Some(&window), title, msg);
    Ok(())
}

#[tauri::command]
fn cols(gen_serv: State<Mutex<GenService>>) -> Result<HashSet<String>, String> {
    Ok(gen_serv
        .lock()
        .map_err(|err| err.to_string())?
        .information_columns())
}

#[tauri::command]
fn gens(gen_serv: State<Mutex<GenService>>) -> Result<Vec<Gen>, String> {
    Ok(gen_serv
        .lock()
        .map_err(|err| err.to_string())?
        .gen_data
        .gens()
        .to_vec())
}

#[tauri::command]
fn save_gen(gen_serv: State<Mutex<GenService>>, gen: Gen) -> Result<(), String> {
    println!("{:?}", gen);
    gen_serv
        .lock()
        .map_err(|err| err.to_string())?
        .gen_data
        .save_gen(gen)
}

#[tauri::command]
fn delete_gen(gen_serv: State<Mutex<GenService>>, id: u32) -> Result<(), String> {
    gen_serv
        .lock()
        .map_err(|err| err.to_string())?
        .gen_data
        .delete_gen(id)
}

#[tauri::command]
fn templates(
    gen_serv: State<Mutex<GenService>>,
) -> Result<HashMap<String, HashSet<String>>, String> {
    let binding = gen_serv.lock().map_err(|err| err.to_string())?;
    let templates = binding.gen_data.templates();
    Ok(templates.clone())
}

#[tauri::command]
fn save_template(
    gen_serv: State<Mutex<GenService>>,
    name: String,
    properties: HashSet<String>,
) -> Result<(), String> {
    gen_serv
        .lock()
        .map_err(|err| err.to_string())?
        .gen_data
        .save_template(&name, properties)
}

#[tauri::command]
fn delete_template(gen_serv: State<Mutex<GenService>>, name: String) -> Result<(), String> {
    gen_serv
        .lock()
        .map_err(|err| err.to_string())?
        .gen_data
        .delete_template(&name)
}

fn main() {
    tauri::Builder::default()
        .manage(Mutex::new(GenService::fake()))
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
