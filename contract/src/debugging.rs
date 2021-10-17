use crate::*;

use near_sdk::json_types::Base58PublicKey;
use near_sdk::log;
use near_sdk::{near_bindgen, PublicKey};

#[near_bindgen]
impl Crossword {
    pub fn debug_get_puzzle(&self, pk: Base58PublicKey) {
        let pk = PublicKey::from(pk);
        let puzzle = self.puzzles.get(&pk).expect("ERR_NO_PUZZLE");
        log!("Puzzle {:?}", puzzle);
    }
}
