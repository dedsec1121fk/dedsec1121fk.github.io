# Threat models, permissions and authorization checks

## 01. Threat modeling a small offline app

**Focus:** Threat modeling a small offline app.

An offline application still has a security boundary. Draw five boxes: document source, index generator, generated HTML, browser, and optional local state. Connect arrows for each data flow. Ask where untrusted text first becomes executable code.

The main risk in a searchable HTML library is not “being offline”; it is the temptation to insert lesson text as HTML rather than text. A malicious example may contain angle brackets or script-like content. Store it as data, serialize safely, and render with textContent instead of innerHTML. The index generator must also exclude unexpected large or sensitive files.

**Try:** create a lesson containing a harmless sample string that looks like an HTML tag. Rebuild the library index and search for it. The result must display literal characters, not interpret them as markup.

**Record:** asset (lessons), entry point (imported Markdown), trust boundary (data to DOM), control (safe encoding/text-only rendering), negative test (malformed input). This diagram is more informative than a list of security buzzwords.

---

Further reading: [Hacking Guide Project — module 41](#read:hgp-en-041).

## 02. Linux and Termux permissions

**Focus:** Linux and Termux permissions.

Unix permissions answer different questions: who owns a file, which group it belongs to, and whether read/write/execute is allowed. A directory needs execute permission for traversal even if filenames are already known. A script made executable is not automatically safe.

On Android, Termux runs inside its application's sandbox. A Linux command running in Termux does not inherit full Android permissions. External storage access is mediated by Android; a desktop path is not necessarily a phone path. Prefer capability detection and explicit user choice over assumptions about /sdcard or home directories.

**Failure example:** a backup script can read one source folder but fails on another. First check whether the file exists, then traversal permissions on ancestor directories, then Android's storage permission boundary. “Run everything as root” is not a diagnosis.

**Practice:** create a disposable folder with one readable file and one no-read file. Inspect permissions before changing them. Describe the minimal permission required and why broad global writes are not justified.

**Key distinction:** process privilege, Android app permission and file mode are separate layers. Keep them separate in troubleshooting.

---

**Responsible practice:** use only local synthetic data, your own systems or explicit authorization. Check explanations against current reference documentation. 

Further reading: [Hacking Guide Project — module 33](#read:hgp-en-033).

## 03. Authentication is not authorization

**Focus:** Authentication is not authorization.

Authentication asks who the caller is. Authorization asks whether that caller may perform this action on this particular object, in this state. A valid session cannot justify reading another user's document.

Model permission as allow(subject, action, resource, context). Context may include ownership, tenant, approval, expiry and workflow state. Design tests for owner versus non-owner, read versus modify, and pending versus completed resources. Do not trust an object ID merely because the UI generated it.

**Toy matrix:** owner/read/own → allow; owner/edit/own → allow if editable; visitor/read/other → deny; administrator/delete/other → only with explicit policy. Test denied cases as thoroughly as allowed cases.

**Subtle failure:** checking resource ownership during the initial request but forgetting it in a background export worker. The same authorization must hold for search, download, batch export and jobs.

**Practice:** define an imaginary notes service with two users and two notes. Write six allow/deny tests before any API code. Check if any query or download path bypasses the decision.

---

Further reading: [Hacking Guide Project — module 71](#read:hgp-en-071).
## Object-level authorization belongs at the data boundary

Authentication says which actor is making a request. It does not prove that the actor may access a particular object. Every lookup by an externally supplied object ID needs the corresponding ownership, tenant or role rule. Hiding an action in the user interface cannot enforce that rule on the server.

Prefer data access that includes the authorization scope in the same query or transaction as the object operation. Keep absence and denial responses consistent with the application's disclosure policy. The synthetic model checks ownership for both reads and updates without using real accounts.

```python
objects={"note-a":{"owner":"alice","body":"fixture"}}
def allowed(actor, object_id, action):
    item=objects.get(object_id)
    return bool(item and item["owner"]==actor and action in {"read","update"})
assert allowed("alice","note-a","read")
assert not allowed("bob","note-a","read")
assert not allowed("alice","missing","read")
assert not allowed("alice","note-a","delete")
print("object and action both checked")
```

Add cross-tenant IDs, a revoked role and a request whose object changes owner concurrently. Negative tests must call the same protected operation as production, not merely prove that a button is hidden. Default-deny behavior should cover unknown actions.

[Technical reference](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
