const CharacterEnum = Object.freeze({
    arimakanna:0,
    hitori:1,
    ileina:2,
    kanna:3,
    kurumi:4,
    molu:5,
    nezuko:6,
    nino:7,
    rem:8
});
function findKeysByValue(object, value) {
        for (const key in object) {
            if (object.hasOwnProperty(key) && object[key] == value) {
        return key;
        }
    }
}
function getCharacter(key)
{
    let data = "/static/img/character/"+key+".png";
    return data;
}