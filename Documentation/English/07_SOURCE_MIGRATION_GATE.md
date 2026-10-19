# Full Developer Mind source migration gate

## Staging now versus full migration
The Test website already includes the complete web-searchable bilingual record arrays, but the private Developer-Mind-Project repository contains far more: independent lesson Markdown, Python examples, reasoning documents, archived learning paths, original scripts, documentation, and repository history. **Do not delete or rename that private repository yet.** No deletion is authorized by this document.

The private source must be copied **under `source/developer-mind/`** in Test before a later consolidation can be declared complete. This directory is an archival/maintenance input, not another public-facing application list. The user's separate DedSec Project Python toolkit and production DedSec website are not targets of this migration.

## Safe local migration procedure
1. On an authorized computer or Termux environment, clone or obtain a complete, current copy of the private source repository. Confirm the branch, HEAD SHA and that it contains the expected `Keep Programming Alive`, `Learning`, `Reverse Engineering`, and documentation directories. Do not paste credentials into prompts or scripts.
2. Run `python3 scripts/migrate_developer_mind.py /path/to/Developer-Mind-Project` from the Test repository root. The script refuses to silently overwrite an existing archive; use a clean destination for a repeat.
3. Review the resulting SHA-256 inventory in `source/developer-mind-manifest.json`, path counts, executable files, licenses, symlinks, and privacy flags. Compare source and copy; maintain source provenance.
4. Run `python3 scripts/migrate_developer_mind.py --verify /path/to/Developer-Mind-Project` to verify file-by-file hash equality. Audit for accidental secrets or private personal data **before any public merge**.
5. Commit the archive in coherent batches without triggering unnecessary website deployments. Repeat after source changes if needed and reverify.
6. Confirm no source entry is missing, all website indexes still load offline, documentation accurately records the source commit, and backups exist.
7. Only after that audit, ask the owner for separate **explicit** authorization before deleting any older repository. Never treat an archived website index as proof of complete source migration.

## Handling duplicates
Path identity and file hash are maintained in the manifest. Matching texts in English and Greek remain distinct translations. Do not automatically remove files with shared checksums, because filenames and references can matter for learning and maintenance. Review identical material manually and replace with cross-references when appropriate.