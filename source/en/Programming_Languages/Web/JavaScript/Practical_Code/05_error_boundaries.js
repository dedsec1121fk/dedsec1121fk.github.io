function parseSettings(text) {
  try { return JSON.parse(text); }
  catch (error) { throw new Error(`Invalid settings JSON: ${error.message}`, {cause: error}); }
}
for (const text of ['{"ok":true}', '{broken']) {
  try { console.log(parseSettings(text)); }
  catch (error) { console.log(error.message); }
}
