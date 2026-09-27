<div align="center">
  <img src="Favicons/favicon-512.png" alt="DedSec Project" width="180">

  # DedSec Project Website

  Website and documentation for the cross-platform DedSec Project.
</div>

## Supported Systems

The website now documents the same supported platforms as the DedSec cross-platform build:

- Termux on Android
- Ubuntu
- Kali Linux
- Linux Mint

The shared workflow is:

```bash
git clone https://github.com/dedsec1121fk/DedSec
cd DedSec
bash Setup.sh
./Run.sh
```

On desktop Linux, setup uses apt packages, a project-local `.venv`, and `Compat/bin`. On Termux it uses native Termux packages and Android-aware storage. Android-specific utilities are clearly marked Termux-only instead of being presented as desktop Linux features.

## Website Documentation Updates

The installation page covers Termux, Ubuntu, Kali Linux, and Linux Mint. Assistance includes Linux installation, `.venv` and path guidance, repair steps, and update steps. Tool descriptions now include platform support and save paths for each supported system. The legacy learning section and its routes were removed.

The homepage no longer shows the old `Free core project`, `No root required`, or `English + Greek` fact rows below the repository statistics.

## Paths

- Termux outputs commonly use `~/storage/downloads/` or Android Download storage.
- Ubuntu, Kali Linux, and Linux Mint outputs commonly use `~/Downloads/` or the configured XDG Downloads directory.
- Desktop Python environment: `DedSec/.venv/`
- Desktop compatibility commands: `DedSec/Compat/bin/`
- Common shell startup files: Termux `$PREFIX/etc/bash.bashrc`, Ubuntu/Linux Mint `~/.bashrc`, Kali often `~/.zshrc`.

## Main Links

- Website: https://ded-sec.space/
- Greek website: https://ded-sec.space/el/
- DedSec repository: https://github.com/dedsec1121fk/DedSec
- Backup repository: https://github.com/sal-scar/DedSec

## Credits

Creator: dedsec1121fk  
Help By: zyxen.gr Systems Engineered
