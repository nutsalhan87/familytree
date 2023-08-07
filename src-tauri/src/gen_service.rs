use std::collections::HashSet;

mod gen;
mod gen_data;

pub use {gen_data::GenData, gen::Gen};

pub struct GenService {
    pub gen_data: GenData,
    file_path: Option<String>,
}

impl GenService {
    pub fn new() -> GenService {
        GenService {
            gen_data: GenData::new(),
            file_path: None,
        }
    }

    pub fn fake() -> GenService {
        let mut gen_data = GenData::new();
        let me = {
            let mut gen = Gen::new();
            gen.id = 1;
            gen.father_id = Some(2);
            gen.mother_id = Some(3);
            gen.add_information(&[("Имя", "Петя"), ("Отчество", "Петрович"), ("Работа", "Сварщик")]);
            gen
        };
        let mother = {
            let mut gen = Gen::new();
            gen.id = 2;
            gen.father_id = None;
            gen.mother_id = None;
            gen.add_information(&[("Имя", "Дженна Ортега"), ("Работа", "Актриса")]);
            gen
        };
        let father = {
            let mut gen = Gen::new();
            gen.id = 3;
            gen.father_id = None;
            gen.mother_id = None;
            gen.add_information(&[("Имя", "Петр"), ("Отчество", "Афанасьевич")]);
            gen
        };
        let sister = {
            let mut gen = Gen::new();
            gen.id = 4;
            gen.father_id = Some(2);
            gen.mother_id = Some(3);
            gen.add_information(&[("Имя", "Женя"), ("Работа", "Врач")]);
            gen
        };
        gen_data.add_gen(me);
        gen_data.add_gen(mother);
        gen_data.add_gen(father);
        gen_data.add_gen(sister);
        gen_data.save_template("Шаблон1", HashSet::from(["A1".to_string(), "B".to_string(), "K2".to_string(), "C".to_string()]));
        gen_data.save_template("Шаблон2", HashSet::from(["A3.to_string(), L.to_string(), K0.to_string(), O.to_string(), I5.to_string(), PA3.to_string(), L.to_string(), K0.to_string(), O.to_string(), I5.to_string(), PA3.to_string(), L.to_string(), K0.to_string(), O.to_string(), I5.to_string(), P".to_string()]));
        gen_data.save_template("Шаблон3", HashSet::from(["U2".to_string(), "X".to_string()]));
        GenService {
            gen_data, file_path: None
        }
    }

    pub fn information_columns(&self) -> HashSet<String> {
        let mut cols = HashSet::new();
        for gen in self.gen_data.gens() {
            cols.extend(gen.information().iter().map(|(col, _)| col.clone()));
        }

        cols
    }
}

#[cfg(test)]
mod test {
    use std::error::Error;

    use super::GenService;

    #[test]
    fn t1() -> Result<(), Box<dyn Error>> {
        let gen_service = GenService::fake();
        println!("{}", serde_json::ser::to_string_pretty(&gen_service.gen_data.templates())?);
        Ok(())
    }
}
