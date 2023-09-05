use std::collections::{HashMap, HashSet};

use super::Gen;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct GenData {
    gens: Vec<Gen>,
    templates: HashMap<String, HashSet<String>>,
}

impl GenData {
    pub fn new() -> GenData {
        GenData {
            gens: Vec::new(),
            templates: HashMap::new(),
        }
    }

    pub fn gens(&self) -> &Vec<Gen> {
        &self.gens
    }

    pub fn templates(&self) -> &HashMap<String, HashSet<String>> {
        &self.templates
    }

    pub fn save_gen(&mut self, new_gen: Gen) -> Result<(), String> {
        match self.gens.iter().find(|gen| gen.id == new_gen.id) {
            Some(gen) => {
                self.delete_gen(gen.id);
                self.gens.push(new_gen);
                Ok(())
            }
            None => {
                self.gens.push(new_gen);
                Ok(())
            }
        }
    }

    pub fn delete_gen(&mut self, id: u32) -> Result<(), String> {
        self.gens.retain(|val| val.id != id);
        Ok(())
    }

    pub fn save_template(
        &mut self,
        name: &str,
        properties: HashSet<String>,
    ) -> Result<(), String> {
        self.templates
            .entry(name.to_string())
            .and_modify(|v| {
                v.clear();
                v.extend(properties.iter().map(|a| a.clone()));
            })
            .or_insert_with(|| {
                let mut t = HashSet::new();
                t.extend(properties.iter().map(|a| a.clone()));
                t
            });
        Ok(())
    }

    pub fn delete_template(&mut self, name: &str) -> Result<(), String> {
        self.templates.remove(name).ok_or("There is no template with this name")?;
        Ok(())
    }

    pub fn clear(&mut self) {
        self.gens.clear();
        self.templates = HashMap::new();
    }
}