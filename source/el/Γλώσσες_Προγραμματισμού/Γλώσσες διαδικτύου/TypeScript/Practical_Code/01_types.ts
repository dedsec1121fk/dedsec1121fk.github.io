type User = {id: number; name: string};
function formatUser(user: User): string {
  return `${user.id}: ${user.name}`;
}
console.log(formatUser({id: 1, name: 'Ada'}));
