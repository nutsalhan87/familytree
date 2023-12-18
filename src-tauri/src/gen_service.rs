use std::{
    collections::HashSet,
    fs::{self, File},
    io::BufReader,
    sync::{Arc, Mutex},
};

use tauri::{api::dialog::FileDialogBuilder, Window};

mod gen;
mod gen_data;

pub use gen::Gen;
use gen_data::GenData;

pub struct GenServiceInner {
    gen_data_index: usize,
    gen_data_history: Vec<GenData>,
    file_path: Option<String>,
}

pub struct GenService {
    pub inner: Arc<Mutex<GenServiceInner>>,
}

impl GenServiceInner {
    pub fn gen_data(&mut self) -> &mut GenData {
        &mut self.gen_data_history[self.gen_data_index]
    }

    pub fn next(&mut self) {
        if self.gen_data_index < self.gen_data_history.len() - 1 {
            self.gen_data_index += 1;
        }
    }

    pub fn prev(&mut self) {
        if self.gen_data_index > 0 {
            self.gen_data_index -= 1;
        }
    }

    pub fn save_history(&mut self) {
        self.gen_data_history.truncate(self.gen_data_index + 1);
        self.gen_data_history
            .push(self.gen_data_history.last().unwrap().clone());
        self.gen_data_index += 1;
    }

    pub fn clear(&mut self) {
        self.save_history();
        self.gen_data().clear();
        self.file_path = None;
    }
}

impl GenService {
    pub fn new() -> GenService {
        GenService {
            inner: Arc::new(Mutex::new(GenServiceInner {
                gen_data_index: 0,
                gen_data_history: vec![GenData::new()],
                file_path: None,
            })),
        }
    }

    pub fn gen_data_clone(&self) -> GenData {
        let mut gen_service = self.inner.lock().unwrap();
        gen_service.gen_data().clone()
    }

    pub fn save_gen(&self, new_gen: Gen) -> Result<(), String> {
        let mut gen_service = self.inner.lock().unwrap();
        gen_service.gen_data().save_gen(new_gen)
    }

    pub fn delete_gen(&self, id: u32) -> Result<(), String> {
        let mut gen_service = self.inner.lock().unwrap();
        gen_service.gen_data().delete_gen(id)
    }

    pub fn save_template(&self, name: &str, properties: HashSet<String>) -> Result<(), String> {
        let mut gen_service = self.inner.lock().unwrap();
        gen_service.gen_data().save_template(name, properties)
    }

    pub fn delete_template(&self, name: &str) -> Result<(), String> {
        let mut gen_service = self.inner.lock().unwrap();
        gen_service.gen_data().delete_template(name)
    }

    pub fn undo(&self) {
        self.inner.lock().unwrap().prev()
    }

    pub fn redo(&self) {
        self.inner.lock().unwrap().next()
    }

    pub fn save_history(&self) {
        self.inner.lock().unwrap().save_history()
    }

    pub fn clear(&self) {
        self.inner.lock().unwrap().clear()
    }

    pub fn save(&self) {
        let mut gen_service = self.inner.lock().unwrap();
        let gen_data_json = serde_json::ser::to_string_pretty(gen_service.gen_data()).unwrap();
        match &gen_service.file_path {
            Some(file_path) => {
                fs::write(file_path, gen_data_json).unwrap();
            }
            None => {
                self.save_as();
            }
        }
    }

    pub fn save_as(&self) {
        let self_copy = Arc::clone(&self.inner);
        FileDialogBuilder::new()
            .add_filter("JSON", &["json"])
            .save_file(move |file_path| {
                if let Some(file_path) = file_path {
                    let path = file_path.to_str().unwrap().to_string();
                    if !path.ends_with(".json") {
                        tauri::api::dialog::message(
                            None::<&Window>,
                            "Неверный формат",
                            "Файл должен быть сохранен с раширением json.",
                        );
                    } else {
                        let mut gen_service = self_copy.lock().unwrap();
                        gen_service.file_path = Some(path);
                        fs::write(
                            file_path,
                            serde_json::ser::to_string_pretty(&gen_service.gen_data()).unwrap(),
                        )
                        .unwrap();
                    }
                }
            });
    }

    pub fn open<F>(&self, handler: F)
    where
        F: FnOnce(GenData) + Send + Sync + 'static,
    {
        let self_copy = Arc::clone(&self.inner);
        FileDialogBuilder::new()
            .add_filter("JSON", &["json"])
            .pick_file(move |file_path| {
                if let Some(file_path) = file_path {
                    let path = file_path.to_str().unwrap().to_string();
                    let gen_data = serde_json::de::from_reader::<_, GenData>(BufReader::new(
                        File::open(&path).unwrap(),
                    ));
                    match gen_data {
                        Ok(gen_data) => {
                            let mut gen_service = self_copy.lock().unwrap();
                            gen_service.gen_data_index = 0;
                            gen_service.gen_data_history = vec![gen_data];
                            gen_service.file_path = Some(path);
                            handler(gen_service.gen_data().clone());
                        }
                        Err(_) => {
                            tauri::api::dialog::message(
                                None::<&Window>,
                                "Неверный формат",
                                "Файл не является сохранением для данных программы.",
                            );
                        }
                    }
                }
            });
    }
}
