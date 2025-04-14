function camelize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}

function capitalizedWords(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function formatString(str) {
    return str.replace(/_/g, ' ').replace(/\b\w/, (char) => char.toUpperCase());
  }

module.exports = {
  camelize,
  capitalizedWords,
  formatString
};
