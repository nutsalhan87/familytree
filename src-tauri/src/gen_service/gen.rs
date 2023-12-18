use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Gen {
    pub id: u32,
    pub father_id: Option<u32>,
    pub mother_id: Option<u32>,
    information: HashMap<String, String>,
    relations: HashMap<String, HashSet<u32>>,
}
