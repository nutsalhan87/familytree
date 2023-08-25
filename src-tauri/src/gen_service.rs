use std::{
    collections::BTreeSet,
    fs::{self, File},
    io::BufReader,
    sync::{Arc, Mutex},
};

use tauri::{api::dialog::FileDialogBuilder, Window};

mod gen;
mod gen_data;

pub use {gen::Gen, gen_data::GenData};

pub struct GenServiceInner {
    pub gen_data: GenData,
    file_path: Option<String>,
}

pub struct GenService {
    pub inner: Arc<Mutex<GenServiceInner>>,
}

impl GenService {
    pub fn new() -> GenService {
        GenService {
            inner: Arc::new(Mutex::new(GenServiceInner {
                gen_data: GenData::new(),
                file_path: None,
            })),
        }
    }

    pub fn information_columns(&self) -> Vec<String> {
        let mut cols = BTreeSet::new();
        for gen in self.inner.lock().unwrap().gen_data.gens() {
            cols.extend(gen.information().iter().map(|(col, _)| col.clone()));
        }
        cols.into_iter().collect()
    }

    pub fn save(&self) {
        let gen_service = self.inner.lock().unwrap();
        match &gen_service.file_path {
            Some(file_path) => {
                fs::write(
                    file_path,
                    serde_json::ser::to_string_pretty(&gen_service.gen_data).unwrap(),
                )
                .unwrap();
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
            .save_file(move |file_path| match file_path {
                Some(file_path) => {
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
                            serde_json::ser::to_string_pretty(&gen_service.gen_data).unwrap(),
                        )
                        .unwrap();
                    }
                }
                None => (),
            });
    }

    pub fn open<F>(&self, handler: F)
    where
        F: FnOnce() + Send + Sync + 'static,
    {
        let self_copy = Arc::clone(&self.inner);
        FileDialogBuilder::new()
            .add_filter("JSON", &["json"])
            .pick_file(move |file_path| match file_path {
                Some(file_path) => {
                    let path = file_path.to_str().unwrap().to_string();
                    let gen_data = serde_json::de::from_reader::<_, GenData>(BufReader::new(
                        File::open(&path).unwrap(),
                    ));
                    match gen_data {
                        Ok(gen_data) => {
                            let mut gen_service = self_copy.lock().unwrap();
                            gen_service.gen_data = gen_data;
                            gen_service.file_path = Some(path);
                            handler();
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
                None => (),
            });
    }
}
