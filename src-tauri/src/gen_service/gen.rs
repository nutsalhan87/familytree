use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct Gen {
    pub id: u32,
    pub father_id: Option<u32>,
    pub mother_id: Option<u32>,
    information: HashMap<String, String>,
    relations: HashMap<String, HashSet<u32>>,
}

impl Gen {
    pub fn new() -> Gen {
        Gen {
            id: 0,
            father_id: None,
            mother_id: None,
            information: HashMap::new(),
            relations: HashMap::new(),
        }
    }

    pub fn information(&self) -> &HashMap<String, String> {
        &self.information
    }

    pub fn relations(&self) -> &HashMap<String, HashSet<u32>> {
        &self.relations
    }

    pub fn add_information(&mut self, new_info: &[(&str, &str)]) -> Result<(), String> {
        self.information.extend(new_info.iter().map(|(a, b)| (a.to_string(), b.to_string())));
        Ok(())
    }

    pub fn remove_information(&mut self, key: &str) -> Result<(), String> {
        self.information.remove(key);
        Ok(())
    }

    pub fn add_relations(&mut self, new_relations: &[(&str, Vec<u32>)]) -> Result<(), String> {
        new_relations.iter().for_each(|(relation, ids)| {
            self.relations
                .entry(relation.to_string())
                .and_modify(|relations_set| relations_set.extend(ids.iter()))
                .or_insert_with(|| {
                    let mut set = HashSet::new();
                    set.extend(ids.iter());
                    set
                });
        });
        Ok(())
    }

    pub fn remove_relation(&mut self, key: &str, relation_id: u32) ->Result<(), String> {
        match self.relations.get_mut(key) {
            Some(ids) => {
                ids.remove(&relation_id);
                if ids.is_empty() {
                    self.relations.remove(key);
                }
            },
            None => ()
        };
        Ok(())
    }
}
