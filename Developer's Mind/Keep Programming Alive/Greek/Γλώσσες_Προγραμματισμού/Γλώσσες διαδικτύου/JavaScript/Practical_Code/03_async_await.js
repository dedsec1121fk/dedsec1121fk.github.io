function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
async function main() {
  await delay(10);
  console.log('Asynchronous work completed');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
