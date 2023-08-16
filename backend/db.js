let db = [];

export function new_entry(uuid, code_verifier, state) {
    db.push({uuid, status: 'redirect', code_verifier, state});
    return;
}

export function get_entry(uuid) {
    return db.find(el => el.uuid == uuid)
}

export function patch_entry(uuid, tokenSet, sub) {
    const index = db.findIndex(el => el.uuid == uuid)
    const state = db[index].state;
    db[index] = {uuid, status: 'tokens', tokenSet, sub, state};
    return db[index];
}

export function patch_tokenSet(uuid, new_tokenSet) {
    const index = db.findIndex(el => el.uuid == uuid)
    db[index].tokenSet = new_tokenSet;
    return;
}

export function remove_entry(uuid) {
    db = db.filter(el => el.uuid != uuid);
    return;
}