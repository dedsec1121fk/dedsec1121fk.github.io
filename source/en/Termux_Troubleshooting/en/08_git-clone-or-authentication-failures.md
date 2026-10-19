# Termux Git clone failures: distinguish URL, credentials and connectivity

## What causes the failure
A clone can fail because the repository URL is wrong, DNS/TLS is broken, credentials lack access, the repository is private or disk storage is exhausted. Similar user-facing messages require different repairs. Avoid putting access tokens into clone URLs, shell history, pasted screenshots or shared bug reports.

## Controlled diagnostic commands
Commands are diagnostics or labeled examples. Verify paths and preserve data before making changes.
~~~sh
git --version
git remote -v  # only inside an existing repository
git ls-remote https://github.com/OWNER/REPO.git HEAD
df -h "$HOME"
# For SSH, inspect the configured identity WITHOUT printing key content:
# ssh -T git@github.com
~~~

## Repair in evidence-based order
Verify owner/repository spelling through an authorized browser. If the URL is valid and private, check the exact GitHub account and fine-grained token or SSH key permissions. Use Git credential helpers or approved SSH setup; never disable TLS verification. Test connectivity separately from authorization. On a low-storage phone clone only the needed repository once instead of repeatedly copying full directories.

## Hands-on exercise
Compare git ls-remote against a known public repository and an intentionally nonexistent path. Record error categories without guessing the existence of private repositories. Repeat after changing between Wi-Fi and mobile data only if you have permission and no metered-data surprise.
